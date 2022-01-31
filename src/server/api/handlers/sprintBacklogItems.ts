// externals
import { Request } from "express";
import * as HttpStatus from "http-status-codes";

// libraries
import {
    ApiBacklogItem,
    ApiBacklogItemInSprint,
    ApiBacklogItemPart,
    ApiSprintStats,
    BacklogItemPart,
    BacklogItemStatus,
    mapApiItemToBacklogItemPart
} from "@atoll/shared";

// data access
import { SprintBacklogItemDataModel } from "../../dataaccess/models/SprintBacklogItem";
import { BacklogItemDataModel } from "../../dataaccess/models/BacklogItem";

// utils
import { getParamsFromRequest } from "../utils/filterHelper";
import { mapDbSprintBacklogToApiBacklogItemInSprint } from "../../dataaccess/mappers/dataAccessToApiMappers";
import { fetchSprintBacklogItemsWithLinks } from "./fetchers/sprintBacklogItemFetcher";
import { backlogItemRankFirstItemInserter, BacklogItemRankFirstItemInserterResult } from "./inserters/backlogItemRankInserter";
import { handleSprintStatUpdate } from "./updaters/sprintStatUpdater";
import { removeFromProductBacklog } from "./deleters/backlogItemRankDeleter";
import { backlogItemPartFetcher } from "./fetchers/backlogItemPartFetcher";
import { isStatusSuccess } from "../utils/httpStatusHelper";
import {
    abortWithNotFoundResponse,
    beginSerializableTransaction,
    commitWithCreatedResponseIfNotAborted,
    commitWithOkResponseIfNotAborted,
    finish,
    handleUnexpectedErrorResponse,
    hasAborted,
    hasRolledBack,
    rollbackWithErrorResponse,
    start
} from "./utils/handlerContext";
import { buildFindOptionsIncludeForNested, computeUnallocatedParts, computeUnallocatedPoints } from "./helpers/backlogItemHelper";
import {
    allocateBacklogItemToSprint,
    determineNextSprintIndex,
    fetchAssociatedBacklogItemWithParts,
    fetchSprintBacklogItems,
    fetchSprintBacklogItemsForBacklogItemWithNested,
    fetchAllocatedAndUnallocatedBacklogItemParts,
    isItemInProductBacklog,
    removeSprintBacklogItemAndUpdateStats,
    ApiBacklogItemPartWithSprintId
} from "./helpers/sprintBacklogItemHelper";
import { LastPartRemovalOptions, removeUnallocatedBacklogItemPart } from "./deleters/backlogItemPartDeleter";
import { fetchSprint } from "./fetchers/sprintFetcher";
import { buildSprintStatsFromApiSprint } from "./helpers/sprintStatsHelper";

export const sprintBacklogItemsGetHandler = async (req: Request, res) => {
    const params = getParamsFromRequest(req);
    const result = await fetchSprintBacklogItemsWithLinks(params.sprintId);
    if (isStatusSuccess(result.status)) {
        res.json(result);
    } else {
        res.status(result.status).json({
            status: result.status,
            message: result.message
        });
        console.log(`Unable to fetch sprintBacklogItems: ${result.message}`);
    }
};

export const sprintBacklogItemPostHandler = async (req: Request, res) => {
    const handlerContext = start("sprintBacklogItemPostHandler", res);

    const params = getParamsFromRequest(req);
    const backlogitemId = req.body.backlogitemId;
    const sprintId = params.sprintId;

    let allocatedBacklogItemPartId: string | null = null;
    let allStoryPartsAllocated = false;
    try {
        await beginSerializableTransaction(handlerContext);

        const sprintBacklogs = await fetchSprintBacklogItems(handlerContext, sprintId);

        const displayIndex = determineNextSprintIndex(sprintBacklogs);

        const backlogitempartsResult = await backlogItemPartFetcher(backlogitemId, handlerContext.transactionContext.transaction);
        let backlogItemPartAllocated: BacklogItemPart;
        let apiBacklogItemPartAllocated: ApiBacklogItemPart;
        let backlogItem: ApiBacklogItem;
        if (!isStatusSuccess(backlogitempartsResult.status)) {
            rollbackWithErrorResponse(
                handlerContext,
                `unable to retrieve backlog item parts for backlog item ID "${backlogitemId}"`
            );
        }
        let joinSplitParts = false;
        let partsWithAllocationInfo: ApiBacklogItemPartWithSprintId[];
        if (!hasRolledBack(handlerContext)) {
            const allBacklogItemParts = backlogitempartsResult.data.items;

            partsWithAllocationInfo = await fetchAllocatedAndUnallocatedBacklogItemParts(handlerContext, allBacklogItemParts);
            const unallocatedBacklogItemParts = partsWithAllocationInfo.filter((item) => !item.sprintId);
            if (!unallocatedBacklogItemParts.length) {
                rollbackWithErrorResponse(
                    handlerContext,
                    `no unallocated backlog item parts for backlog item ID "${backlogitemId}"`
                );
                allStoryPartsAllocated = false;
            }
            if (!hasRolledBack(handlerContext)) {
                const allocatedBacklogItemParts = partsWithAllocationInfo.filter((item) => !!item.sprintId);
                const alreadyAllocatedToNextSprint = allocatedBacklogItemParts.filter((item) => item.sprintId === sprintId);
                if (alreadyAllocatedToNextSprint.length > 0) {
                    joinSplitParts = true;
                }

                allStoryPartsAllocated = unallocatedBacklogItemParts.length === 1;
                apiBacklogItemPartAllocated = unallocatedBacklogItemParts[0];
                backlogItemPartAllocated = mapApiItemToBacklogItemPart(apiBacklogItemPartAllocated);
                allocatedBacklogItemPartId = backlogItemPartAllocated.id;
            }
        }
        let addedSprintBacklogItem: SprintBacklogItemDataModel;
        let sprintStats: ApiSprintStats;
        if (!hasRolledBack(handlerContext)) {
            if (joinSplitParts) {
                const removePartResult = await removeUnallocatedBacklogItemPart(
                    allocatedBacklogItemPartId,
                    LastPartRemovalOptions.Disallow,
                    handlerContext.transactionContext.transaction
                );
                if (removePartResult.status !== HttpStatus.OK) {
                    rollbackWithErrorResponse(handlerContext, removePartResult.message);
                }
            } else {
                addedSprintBacklogItem = await allocateBacklogItemToSprint(
                    handlerContext,
                    sprintId,
                    allocatedBacklogItemPartId,
                    displayIndex
                );
            }
            if (!hasRolledBack(handlerContext) && allStoryPartsAllocated) {
                const removeProductBacklogItemResult = await removeFromProductBacklog(
                    backlogitemId,
                    handlerContext.transactionContext.transaction
                );
                if (!isStatusSuccess(removeProductBacklogItemResult.status)) {
                    rollbackWithErrorResponse(
                        handlerContext,
                        `Error ${removeProductBacklogItemResult.message} (status ${removeProductBacklogItemResult.status}) ` +
                            "when trying to remove backlog item from the product backlog"
                    );
                }
            }
            if (!hasRolledBack(handlerContext)) {
                backlogItem = await fetchAssociatedBacklogItemWithParts(handlerContext, backlogitemId);
                if (joinSplitParts) {
                    const fetchSprintResult = await fetchSprint(sprintId);
                    if (!isStatusSuccess(fetchSprintResult.status)) {
                        rollbackWithErrorResponse(
                            handlerContext,
                            `Error ${fetchSprintResult.message} (status ${fetchSprintResult.status}) ` +
                                `when trying to fetch sprint with id "${sprintId}"`
                        );
                    } else {
                        sprintStats = buildSprintStatsFromApiSprint(fetchSprintResult.data.item);
                    }
                } else {
                    sprintStats = await handleSprintStatUpdate(
                        sprintId,
                        BacklogItemStatus.None,
                        backlogItemPartAllocated.status,
                        null,
                        null,
                        backlogItemPartAllocated.points,
                        backlogItem.estimate,
                        handlerContext.transactionContext.transaction
                    );
                }
            }
        }
        if (!hasRolledBack(handlerContext)) {
            const extra = {
                sprintStats,
                backlogItemPart: apiBacklogItemPartAllocated,
                backlogItem
            };
            if (joinSplitParts) {
                // nothing was added, so 200 status is appropriate
                // (it combined the "added" part into an existing part in the sprint)
                await commitWithOkResponseIfNotAborted(handlerContext, addedSprintBacklogItem, extra);
            } else {
                // a new entry was added, so 201 status is appropriate
                await commitWithCreatedResponseIfNotAborted(handlerContext, addedSprintBacklogItem, extra);
            }
        }
    } catch (err) {
        await handleUnexpectedErrorResponse(handlerContext, err);
    }
    finish(handlerContext);
};

export const sprintBacklogItemDeleteHandler = async (req: Request, res) => {
    const handlerContext = start("sprintBacklogItemDeleteHandler", res);

    const params = getParamsFromRequest(req);
    const backlogitemId = params.backlogItemId;
    const sprintId = params.sprintId;

    try {
        await beginSerializableTransaction(handlerContext);

        const matchingItems = await fetchSprintBacklogItemsForBacklogItemWithNested(handlerContext, sprintId, backlogitemId);
        if (!matchingItems.length) {
            abortWithNotFoundResponse(
                handlerContext,
                `Unable to find sprint backlog item in sprint "${sprintId}" with ID "${backlogitemId}"`
            );
        } else {
            // NOTE: If multiple items match it doesn't matter for this code because all of those items will be associated with
            //   the same story.  All we care about is adding that story back into the product backlog (if it isn't already
            //   there).
            const firstSprintBacklogItem = matchingItems[0];
            const firstApiBacklogItemTyped = mapDbSprintBacklogToApiBacklogItemInSprint(firstSprintBacklogItem);
            let result: BacklogItemRankFirstItemInserterResult;
            let sprintStats: ApiSprintStats;
            let apiBacklogItemTyped: ApiBacklogItemInSprint;
            const itemInProductBacklog = await isItemInProductBacklog(handlerContext, backlogitemId);
            if (!itemInProductBacklog) {
                result = await backlogItemRankFirstItemInserter(
                    firstApiBacklogItemTyped,
                    handlerContext.transactionContext.transaction
                );
                if (!isStatusSuccess(result.status)) {
                    await rollbackWithErrorResponse(
                        handlerContext,
                        "Unable to insert new backlogitemrank entries, aborting move to product backlog for item part ID " +
                            `${backlogitemId}` +
                            ` (reason: backlogItemRankFirstItemInserter returned status ${result.status})`
                    );
                }
            }
            const backlogItems = await BacklogItemDataModel.findAll({
                where: { id: backlogitemId },
                include: buildFindOptionsIncludeForNested()
            });
            if (backlogItems.length !== 1) {
                await rollbackWithErrorResponse(
                    handlerContext,
                    "Unable to insert new backlogitemrank entries, aborting move to product backlog for item part ID " +
                        `${backlogitemId}` +
                        ` (reason: expected 1 matching backlog item to match ID above, but ${backlogItems.length} matched)`
                );
            } else {
                const backlogItem = backlogItems[0];
                const backlogItemParts = (backlogItem as any).backlogitemparts;
                firstApiBacklogItemTyped.unallocatedParts = computeUnallocatedParts(backlogItemParts);
                firstApiBacklogItemTyped.unallocatedPoints = computeUnallocatedPoints(backlogItem, backlogItemParts);
            }
            if (!hasAborted(handlerContext)) {
                // forEach doesn't work with async, so we use for ... of instead
                for (const sprintBacklogItem of matchingItems) {
                    if (!handlerContext.transactionContext.rolledBack) {
                        sprintStats = await removeSprintBacklogItemAndUpdateStats(
                            handlerContext,
                            sprintId,
                            sprintBacklogItem,
                            sprintStats
                        );
                    }
                }
                firstApiBacklogItemTyped.unallocatedParts += matchingItems.length;
            }
            const extra = {
                sprintStats,
                backlogItem: firstApiBacklogItemTyped
            };
            await commitWithOkResponseIfNotAborted(handlerContext, apiBacklogItemTyped, extra);
        }
    } catch (err) {
        await handleUnexpectedErrorResponse(handlerContext, err);
    }
};
