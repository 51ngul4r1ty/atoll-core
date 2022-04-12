// externals
import { Request, Response } from "express";

// libraries
import {
    ApiBacklogItem,
    ApiBacklogItemInSprint,
    ApiBacklogItemPart,
    ApiSprint,
    ApiSprintStats,
    BacklogItemPart,
    BacklogItemStatus,
    mapApiItemToBacklogItemPart
} from "@atoll/shared";

// data access
import { SprintBacklogItemPartDataModel } from "../../dataaccess/models/SprintBacklogItemPartDataModel";
import { BacklogItemDataModel } from "../../dataaccess/models/BacklogItemDataModel";

// consts/enums
import { SPRINT_BACKLOG_CHILD_RESOURCE_NAME, SPRINT_BACKLOG_PARENT_RESOURCE_NAME } from "../../resourceNames";

// utils
import { getParamsFromRequest } from "../utils/filterHelper";
import {
    mapDbSprintBacklogWithNestedToApiBacklogItemInSprint,
    mapDbToApiSprintBacklogItem
} from "../../dataaccess/mappers/dataAccessToApiMappers";
import {
    fetchSprintBacklogItemsWithLinks,
    fetchSprintBacklogItemPartWithLinks,
    fetchSprintBacklogItemWithLinks
} from "./fetchers/sprintBacklogItemFetcher";
import {
    productBacklogItemFirstItemInserter,
    ProductBacklogItemFirstItemInserterResult
} from "./inserters/productBacklogItemInserter";
import { handleSprintStatUpdate } from "./updaters/sprintStatUpdater";
import { removeFromProductBacklog } from "./deleters/productBacklogItemDeleter";
import { fetchBacklogItemParts, BacklogItemPartsResult } from "./fetchers/backlogItemPartFetcher";
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
import {
    buildBacklogItemFindOptionsIncludeForNested,
    computeUnallocatedParts,
    computeUnallocatedPointsUsingDbObjs
} from "./helpers/backlogItemHelper";
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
import { buildChldSelfLink } from "../../utils/linkBuilder";
import { isRestApiErrorResult, isRestApiItemResult } from "../utils/responseBuilder";

export const sprintBacklogItemsGetHandler = async (req: Request, res: Response) => {
    const params = getParamsFromRequest(req);
    const result = await fetchSprintBacklogItemsWithLinks(params.sprintId);
    if (isRestApiItemResult(result)) {
        res.json(result);
    } else {
        res.status(result.status).json(result);
        console.log(`Unable to fetch sprintBacklogItems: ${result.message}`);
    }
};

export const sprintBacklogItemGetHandler = async (req: Request, res: Response) => {
    const params = getParamsFromRequest(req);
    const result = await fetchSprintBacklogItemWithLinks(params.sprintId, params.backlogItemId);
    if (isRestApiItemResult(result)) {
        res.json(result);
    } else {
        res.status(result.status).json(result);
        console.log(`Unable to fetch sprintBacklogItem: ${result.message}`);
    }
};

export const sprintBacklogItemPostHandler = async (req: Request, res: Response) => {
    const handlerContext = start("sprintBacklogItemPostHandler", res);

    const params = getParamsFromRequest(req);
    const backlogitemId = req.body.backlogitemId;
    const sprintId = params.sprintId;

    let allocatedBacklogItemPartId: string | null = null;
    let allStoryPartsAllocated = false;
    try {
        await beginSerializableTransaction(handlerContext);

        const sprintBacklogs = await fetchSprintBacklogItems(sprintId, handlerContext.transactionContext.transaction);

        const displayIndex = determineNextSprintIndex(sprintBacklogs);

        const backlogitempartsResult = await fetchBacklogItemParts(backlogitemId, handlerContext.transactionContext.transaction);
        let backlogItemPartAllocated: BacklogItemPart;
        let apiBacklogItemPartAllocated: ApiBacklogItemPart;
        let backlogItem: ApiBacklogItem;
        if (isRestApiErrorResult(backlogitempartsResult)) {
            rollbackWithErrorResponse(
                handlerContext,
                `unable to retrieve backlog item parts for backlog item ID "${backlogitemId}"`
            );
        }
        const backlogitempartsSuccessResult = backlogitempartsResult as BacklogItemPartsResult;
        let joinSplitParts = false;
        let partsWithAllocationInfo: ApiBacklogItemPartWithSprintId[];
        if (!hasRolledBack(handlerContext)) {
            const allBacklogItemParts = backlogitempartsSuccessResult.data.items;

            partsWithAllocationInfo = await fetchAllocatedAndUnallocatedBacklogItemParts(
                allBacklogItemParts,
                handlerContext.transactionContext.transaction
            );
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
        let addedDbSprintBacklogItem: SprintBacklogItemPartDataModel;
        let sprintStats: ApiSprintStats;
        if (!hasRolledBack(handlerContext)) {
            if (joinSplitParts) {
                const removePartResult = await removeUnallocatedBacklogItemPart(
                    allocatedBacklogItemPartId,
                    LastPartRemovalOptions.Allow,
                    handlerContext.transactionContext.transaction
                );
                if (isRestApiErrorResult(removePartResult)) {
                    rollbackWithErrorResponse(handlerContext, removePartResult.message);
                }
            } else {
                addedDbSprintBacklogItem = await allocateBacklogItemToSprint(
                    sprintId,
                    allocatedBacklogItemPartId,
                    displayIndex,
                    handlerContext.transactionContext.transaction
                );
            }
            if (!hasRolledBack(handlerContext) && allStoryPartsAllocated) {
                const removeProductBacklogItemResult = await removeFromProductBacklog(
                    backlogitemId,
                    handlerContext.transactionContext.transaction
                );
                if (isRestApiErrorResult(removeProductBacklogItemResult)) {
                    rollbackWithErrorResponse(
                        handlerContext,
                        `Error ${removeProductBacklogItemResult.message} (status ${removeProductBacklogItemResult.status}) ` +
                            "when trying to remove backlog item from the product backlog"
                    );
                }
            }
            if (!hasRolledBack(handlerContext)) {
                backlogItem = await fetchAssociatedBacklogItemWithParts(
                    backlogitemId,
                    handlerContext.transactionContext.transaction
                );
                if (joinSplitParts) {
                    const fetchSprintResult = await fetchSprint(sprintId, handlerContext.transactionContext.transaction);
                    if (!isRestApiItemResult<ApiSprint>(fetchSprintResult)) {
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
            const addedItemWithoutLinks = mapDbToApiSprintBacklogItem(addedDbSprintBacklogItem);
            const resourceBasePath =
                `/api/v1/${SPRINT_BACKLOG_PARENT_RESOURCE_NAME}/${addedItemWithoutLinks.sprintId}` +
                `/${SPRINT_BACKLOG_CHILD_RESOURCE_NAME}`;
            const addedSprintBacklogItem = {
                ...addedItemWithoutLinks,
                links: [buildChldSelfLink(backlogitemId, resourceBasePath)]
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
        finish(handlerContext);
    } catch (err) {
        await handleUnexpectedErrorResponse(handlerContext, err);
    }
};

/**
 * Remove an sprint backlog item part from a sprint (i.e. make it an "unallocated part").
 * @param req request with backlogItemId and sprintId as params
 * @param res
 */
export const sprintBacklogItemDeleteHandler = async (req: Request, res: Response) => {
    const handlerContext = start("sprintBacklogItemDeleteHandler", res);

    const params = getParamsFromRequest(req);
    const backlogitemId = params.backlogItemId;
    const sprintId = params.sprintId;

    try {
        await beginSerializableTransaction(handlerContext);

        const matchingItems = await fetchSprintBacklogItemsForBacklogItemWithNested(
            sprintId,
            backlogitemId,
            handlerContext.transactionContext.transaction
        );
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
            const firstApiBacklogItemTyped = mapDbSprintBacklogWithNestedToApiBacklogItemInSprint(firstSprintBacklogItem);
            let result: ProductBacklogItemFirstItemInserterResult;
            let sprintStats: ApiSprintStats;
            let apiBacklogItemTyped: ApiBacklogItemInSprint;
            const itemInProductBacklog = await isItemInProductBacklog(backlogitemId, handlerContext.transactionContext.transaction);
            if (!itemInProductBacklog) {
                result = await productBacklogItemFirstItemInserter(
                    firstApiBacklogItemTyped,
                    handlerContext.transactionContext.transaction
                );
                if (isRestApiErrorResult(result)) {
                    await rollbackWithErrorResponse(
                        handlerContext,
                        "Unable to insert new productbacklogitem entries, aborting move to product backlog for item part ID " +
                            `${backlogitemId}` +
                            ` (reason: productBacklogItemFirstItemInserter returned status ${result.status})`
                    );
                }
            }
            if (!hasAborted(handlerContext)) {
                // forEach doesn't work with async, so we use for ... of instead
                for (const sprintBacklogItem of matchingItems) {
                    if (!handlerContext.transactionContext.rolledBack) {
                        sprintStats = await removeSprintBacklogItemAndUpdateStats(
                            sprintId,
                            sprintBacklogItem,
                            sprintStats,
                            handlerContext.transactionContext.transaction
                        );
                    }
                }
                firstApiBacklogItemTyped.unallocatedParts += matchingItems.length;

                const backlogItems = await BacklogItemDataModel.findAll({
                    where: { id: backlogitemId },
                    include: buildBacklogItemFindOptionsIncludeForNested(),
                    transaction: handlerContext.transactionContext.transaction
                });
                if (backlogItems.length !== 1) {
                    await rollbackWithErrorResponse(
                        handlerContext,
                        "Unable to insert new productbacklogitem entries, aborting move to product backlog for item part ID " +
                            `${backlogitemId}` +
                            ` (reason: expected 1 matching backlog item to match ID above, but ${backlogItems.length} matched)`
                    );
                } else {
                    const backlogItem = backlogItems[0];
                    const backlogItemParts = (backlogItem as any).backlogitemparts;
                    firstApiBacklogItemTyped.unallocatedParts = computeUnallocatedParts(backlogItemParts);
                    firstApiBacklogItemTyped.unallocatedPoints = computeUnallocatedPointsUsingDbObjs(backlogItem, backlogItemParts);
                }
            }
            const extra = {
                sprintStats,
                backlogItem: firstApiBacklogItemTyped
            };
            await commitWithOkResponseIfNotAborted(handlerContext, apiBacklogItemTyped, extra);
        }
        finish(handlerContext);
    } catch (err) {
        await handleUnexpectedErrorResponse(handlerContext, err);
    }
};
