// externals
import { Request } from "express";
import * as HttpStatus from "http-status-codes";
import { CreateOptions, FindOptions, Transaction } from "sequelize";

// libraries
import {
    ApiBacklogItem,
    ApiBacklogItemInSprint,
    ApiBacklogItemPart,
    ApiSprintStats,
    BacklogItemPart,
    BacklogItemStatus,
    logger,
    mapApiItemToBacklogItem,
    mapApiItemToBacklogItemPart
} from "@atoll/shared";

// data access
import { sequelize } from "../../dataaccess/connection";
import { SprintBacklogItemDataModel } from "../../dataaccess/models/SprintBacklogItem";
import { BacklogItemDataModel } from "../../dataaccess/models/BacklogItem";
import { BacklogItemRankDataModel } from "../../dataaccess/models/BacklogItemRank";
import { BacklogItemPartDataModel } from "../../dataaccess/models/BacklogItemPart";

// utils
import { getParamsFromRequest } from "../utils/filterHelper";
import { buildOptionsFromParams } from "../utils/sequelizeHelper";
import { respondWithError, respondWithNotFound } from "../utils/responder";
import {
    mapDbSprintBacklogToApiBacklogItem,
    mapDbToApiBacklogItem,
    mapDbToApiBacklogItemPart,
    mapDbToApiSprintBacklogItem
} from "../../dataaccess/mappers/dataAccessToApiMappers";
import { addIdToBody } from "../utils/uuidHelper";
import { fetchSprintBacklogItemsWithLinks } from "./fetchers/sprintBacklogItemFetcher";
import { backlogItemRankFirstItemInserter, BacklogItemRankFirstItemInserterResult } from "./inserters/backlogItemRankInserter";
import { handleSprintStatUpdate } from "./updaters/sprintStatUpdater";
import { removeFromProductBacklog } from "./deleters/backlogItemRankDeleter";
import { backlogItemPartFetcher } from "./fetchers/backlogItemPartFetcher";
import { isStatusSuccess } from "../utils/httpStatusHelper";
import {
    abortWithNotFoundResponse,
    beginSerializableTransaction,
    commitWithOkResponseIfNotAborted,
    handleUnexpectedErrorResponse,
    hasAborted,
    rollbackWithErrorResponse,
    start
} from "./utils/handlerContext";
import { buildFindOptionsIncludeForNested, computeUnallocatedParts } from "./helpers/backlogItemHelper";
import {
    fetchSprintBacklogItemsForBacklogItemWithNested,
    isItemInProductBacklog,
    removeSprintBacklogItemAndUpdateStats
} from "./helpers/sprintBacklogItemHelper";

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
    const functionTag = "sprintBacklogItemPostHandler";
    const logContext = logger.info("starting call", [functionTag]);
    const params = getParamsFromRequest(req);
    const backlogitemId = req.body.backlogitemId;
    let backlogitempartId: string | null = null;
    let allStoryPartsAllocated = false;
    const sprintId = params.sprintId;
    let transaction: Transaction;
    try {
        let rolledBack = false;
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        let displayIndex: number;
        const options = buildOptionsFromParams({ sprintId });
        const sprintBacklogs = await SprintBacklogItemDataModel.findAll({
            ...options,
            order: [["displayindex", "ASC"]],
            transaction
        });
        if (sprintBacklogs && sprintBacklogs.length) {
            const lastSprintBacklogItem = mapDbToApiSprintBacklogItem(sprintBacklogs[sprintBacklogs.length - 1]);
            displayIndex = lastSprintBacklogItem.displayindex + 1;
        } else {
            displayIndex = 0;
        }
        const backlogitempartsResult = await backlogItemPartFetcher(backlogitemId, transaction);
        let backlogItemPartAllocated: BacklogItemPart;
        let apiBacklogItemPartAllocated: ApiBacklogItemPart;
        let backlogItem: ApiBacklogItem;
        if (!isStatusSuccess(backlogitempartsResult.status)) {
            await transaction.rollback();
            rolledBack = true;
            respondWithError(res, `unable to retrieve backlog item parts for backlog item ID "${backlogitemId}"`);
        } else {
            const allBacklogItemParts = backlogitempartsResult.data.items;
            const allBacklogItemPartIds = allBacklogItemParts.map((item) => item.id);
            const options: FindOptions = {
                where: { backlogitempartId: allBacklogItemPartIds },
                transaction
            };
            const sprintBacklogItems = await SprintBacklogItemDataModel.findAll(options);
            const backlogItemPartsInSprints = sprintBacklogItems.map((item) => mapDbToApiSprintBacklogItem(item));
            let backlogItemPartIdsInSprints = {};
            backlogItemPartsInSprints.forEach((item) => {
                backlogItemPartIdsInSprints[item.backlogitempartId] = item;
            });
            const unallocatedBacklogItemParts = allBacklogItemParts.filter((item) => !backlogItemPartIdsInSprints[item.id]);
            if (!unallocatedBacklogItemParts.length) {
                await transaction.rollback();
                rolledBack = true;
                respondWithError(res, `no unallocated backlog item parts for backlog item ID "${backlogitemId}"`);
            } else {
                apiBacklogItemPartAllocated = unallocatedBacklogItemParts[0];
                backlogItemPartAllocated = mapApiItemToBacklogItemPart(apiBacklogItemPartAllocated);

                const backlogItemId = backlogItemPartAllocated.backlogitemId;
                const dbBacklogItem = await BacklogItemDataModel.findByPk(backlogItemId, { transaction });
                backlogItem = mapDbToApiBacklogItem(dbBacklogItem);
                backlogitempartId = backlogItemPartAllocated.id;
                allStoryPartsAllocated = unallocatedBacklogItemParts.length === 1;
            }
        }
        let addedSprintBacklog: SprintBacklogItemDataModel;
        let sprintStats: ApiSprintStats;
        if (!rolledBack) {
            const bodyWithId = addIdToBody({
                sprintId,
                backlogitempartId,
                displayindex: displayIndex
            });
            addedSprintBacklog = await SprintBacklogItemDataModel.create(bodyWithId, { transaction } as CreateOptions);
            if (allStoryPartsAllocated) {
                const removeProductBacklogItemResult = await removeFromProductBacklog(backlogitemId, transaction);
                if (!isStatusSuccess(removeProductBacklogItemResult.status)) {
                    await transaction.rollback();
                    rolledBack = true;
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                        status: HttpStatus.INTERNAL_SERVER_ERROR,
                        message:
                            `Error ${removeProductBacklogItemResult.message} (status ${removeProductBacklogItemResult.status}) ` +
                            "when trying to remove backlog item from the product backlog"
                    });
                }
            }
            if (!rolledBack) {
                // const dbBacklogItem = await BacklogItemDataModel.findOne({ where: { id: backlogitemId }, transaction });
                // const apiBacklogItem = mapDbToApiBacklogItem(dbBacklogItem);
                // const backlogItemTyped = mapApiItemToBacklogItem(apiBacklogItem);
                sprintStats = await handleSprintStatUpdate(
                    sprintId,
                    BacklogItemStatus.None,
                    backlogItemPartAllocated.status,
                    null,
                    backlogItemPartAllocated.points,
                    transaction
                );
            }
        }
        if (!rolledBack) {
            await transaction.commit();
            res.status(HttpStatus.CREATED).json({
                status: HttpStatus.CREATED,
                data: {
                    item: addedSprintBacklog,
                    extra: {
                        sprintStats,
                        backlogItemPart: apiBacklogItemPartAllocated,
                        backlogItem
                    }
                }
            });
        }
    } catch (err) {
        const errLogContext = logger.warn(`handling error "${err}"`, [functionTag], logContext);
        if (transaction) {
            logger.info("rolling back transaction", [functionTag], errLogContext);
            try {
                await transaction.rollback();
            } catch (err) {
                logger.warn(`roll back failed with error "${err}"`, [functionTag], errLogContext);
            }
        }
        respondWithError(res, err);
        logger.info(`handling error ${err}`, [functionTag], logContext);
    }
    logger.info("finishing call", [functionTag]);
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
            const firstApiBacklogItemTyped = mapDbSprintBacklogToApiBacklogItem(firstSprintBacklogItem);
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
                firstApiBacklogItemTyped.unallocatedParts = computeUnallocatedParts((backlogItem as any).backlogitemparts);
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
            // BUSY HERE:
            // 1) Add tech debt story to refactor all handlers to use the new pattern.
            await commitWithOkResponseIfNotAborted(handlerContext, apiBacklogItemTyped, {
                sprintStats,
                backlogItem: firstApiBacklogItemTyped
            });
        }
    } catch (err) {
        await handleUnexpectedErrorResponse(handlerContext, err);
    }
};
