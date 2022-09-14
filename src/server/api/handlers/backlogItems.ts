// externals
import { Request, Response } from "express";
import * as core from "express-serve-static-core";
import { StatusCodes } from "http-status-codes";
import { CreateOptions, FindOptions, Transaction } from "sequelize";

// libraries
import {
    ApiBacklogItem,
    ApiProductBacklogItem,
    ApiSprintStats,
    formatNumber,
    getValidStatuses,
    isValidStatus,
    logger,
    mapApiItemToBacklogItem
} from "@atoll/shared";

// data access
import { sequelize } from "../../dataaccess/connection";
import { BacklogItemDataModel } from "../../dataaccess/models/BacklogItemDataModel";
import { BacklogItemPartDataModel } from "../../dataaccess/models/BacklogItemPartDataModel";
import { ProductBacklogItemDataModel } from "../../dataaccess/models/ProductBacklogItemDataModel";
import { CounterDataModel } from "../../dataaccess/models/CounterDataModel";
import { ProjectSettingsDataModel } from "../../dataaccess/models/ProjectSettingsDataModel";

// utils
import {
    respondWithFailedValidation,
    respondWithNotFound,
    respondWithError,
    respondWithOk,
    respondWithItem,
    respondWithObj
} from "../utils/responder";
import { getParamsFromRequest } from "../utils/filterHelper";
import { fetchBacklogItemsByDisplayId, fetchBacklogItems, fetchBacklogItem } from "./fetchers/backlogItemFetcher";
import { addIdToBody } from "../utils/uuidHelper";
import {
    productBacklogItemFirstItemInserter,
    productBacklogItemSubsequentItemInserter
} from "./inserters/productBacklogItemInserter";
import {
    mapDbToApiBacklogItem,
    mapDbToApiBacklogItemPart,
    mapDbToApiCounter,
    mapDbToApiProjectSettings
} from "../../dataaccess/mappers/dataAccessToApiMappers";
import { getUpdatedBacklogItemWhenStatusChanges } from "../utils/statusChangeUtils";
import { buildResponseWithItem, isRestApiCollectionResult, isRestApiItemResult, RestApiItemResult } from "../utils/responseBuilder";
import { logError } from "./utils/serverLogger";
import { logErrorInfoFromResponseObj } from "../utils/serverLogUtils";
import { fetchBacklogItemWithSprintAllocationInfo } from "./aggregators/backlogItemAggregator";
import { buildOptionsWithTransaction } from "../utils/sequelizeHelper";
import { calcNewPartIndex } from "../utils/partIndexUtils";
import { mapApiToDbBacklogItem, mapApiToDbBacklogItemPart } from "../../dataaccess/mappers/apiToDataAccessMappers";

// interfaces/types
import type { BacklogItemsResult } from "./fetchers/backlogItemFetcher";
import type { RestApiStatusAndMessageOnly } from "../utils/responseBuilder";
import {
    beginSerializableTransaction,
    handleFailedValidationResponse,
    handlePersistenceErrorResponse,
    handleSuccessResponse,
    handleUnexpectedErrorResponse,
    start
} from "./utils/handlerContext";
import { fetchBacklogItemParts } from "./fetchers/backlogItemPartFetcher";
import { ApiBacklogItemPartWithSprintId, fetchAllocatedAndUnallocatedBacklogItemParts } from "./helpers/sprintBacklogItemHelper";

export const backlogItemsGetHandler = async (req: Request, res: Response) => {
    const params = getParamsFromRequest(req);
    let result: BacklogItemsResult | RestApiStatusAndMessageOnly;
    if (params.projectId && params.backlogItemDisplayId) {
        result = await fetchBacklogItemsByDisplayId(params.projectId, params.backlogItemDisplayId);
    } else {
        result = await fetchBacklogItems(params.projectId);
    }
    if (result.status === StatusCodes.OK) {
        res.json(result);
    } else {
        res.status(result.status).json({
            status: result.status,
            message: result.message
        });
        logErrorInfoFromResponseObj(result, "backlog items", "Unable to fetch backlog items");
    }
};

export interface BacklogItemGetParams extends core.ParamsDictionary {
    itemId: string;
}

export const backlogItemGetHandler = async (req: Request<BacklogItemGetParams>, res: Response) => {
    try {
        const id = req.params.itemId;
        const itemWithSprintInfoResult = await fetchBacklogItemWithSprintAllocationInfo(id);
        if (isRestApiItemResult(itemWithSprintInfoResult)) {
            respondWithObj(res, itemWithSprintInfoResult);
        } else {
            respondWithObj(res, itemWithSprintInfoResult);
            logError(`backlogItemGetHandler: ${itemWithSprintInfoResult.message} (error)`);
        }
    } catch (error) {
        respondWithError(res, error, "Unable to fetch backlog item");
    }
};

export const backlogItemsDeleteHandler = async (req: Request, res: Response) => {
    let committing = false;
    let transaction: Transaction;
    try {
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        await sequelize.query('SET CONSTRAINTS "productbacklogitem_backlogitemId_fkey" DEFERRED;', { transaction });
        await sequelize.query('SET CONSTRAINTS "productbacklogitem_nextbacklogitemId_fkey" DEFERRED;', { transaction });
        const id = req.params.itemId;
        let abort = true;
        if (!id) {
            respondWithFailedValidation(res, "backlog item ID is required for DELETE");
        }
        let backlogItemTyped: ApiBacklogItem = null;
        let backlogItem: BacklogItemDataModel = await BacklogItemDataModel.findByPk(id, { transaction });
        if (!backlogItem) {
            respondWithNotFound(res, `Unable to find backlogitem by primary key ${id}`);
        } else {
            backlogItemTyped = mapDbToApiBacklogItem(backlogItem);
            abort = false;
        }
        if (!abort) {
            const firstLink = await ProductBacklogItemDataModel.findOne({
                where: { nextbacklogitemId: id },
                transaction
            });
            let firstLinkTyped: ApiProductBacklogItem = null;
            if (!firstLink) {
                respondWithNotFound(res, `Unable to find productbacklogitem entry with next = ${id}`);
                abort = true;
            } else {
                firstLinkTyped = firstLink as unknown as ApiProductBacklogItem;
            }

            let secondLink: ProductBacklogItemDataModel = null;
            let secondLinkTyped: ApiProductBacklogItem = null;

            if (!abort) {
                secondLink = await ProductBacklogItemDataModel.findOne({
                    where: { backlogitemId: id },
                    transaction
                });
                if (!secondLink) {
                    respondWithNotFound(res, `Unable to find productbacklogitem entry with id = ${id}`);
                    abort = true;
                } else {
                    secondLinkTyped = secondLink as unknown as ApiProductBacklogItem;
                }
            }

            if (!abort) {
                const backlogItemParts: BacklogItemPartDataModel[] = await BacklogItemPartDataModel.findAll({
                    where: { backlogitemId: id },
                    transaction
                });
                const backlogItemPartIds = backlogItemParts.map((backlogItemPart) => backlogItemPart.id);
                if (!backlogItemPartIds.length) {
                    respondWithNotFound(res, `Unable to find backlogitempart entries related to backlogitem with id = ${id}`);
                    abort = true;
                } else {
                    await BacklogItemPartDataModel.destroy({ where: { id: backlogItemPartIds }, transaction });
                }
            }

            if (!abort) {
                if (!firstLinkTyped.backlogitemId && !secondLinkTyped.nextbacklogitemId) {
                    // we'll end up with one null-null row, just remove it instead
                    await ProductBacklogItemDataModel.destroy({ where: { id: firstLinkTyped.id }, transaction });
                } else {
                    await firstLink.update({ nextbacklogitemId: secondLinkTyped.nextbacklogitemId }, { transaction });
                }
                await ProductBacklogItemDataModel.destroy({ where: { id: secondLinkTyped.id }, transaction });
                await BacklogItemDataModel.destroy({ where: { id: backlogItemTyped.id }, transaction });
                committing = true;
                await transaction.commit();
                respondWithItem(res, backlogItemTyped);
            }
        }
    } catch (err) {
        if (committing) {
            console.log("an error occurred, skipping rollback because commit was already in progress");
        } else if (transaction) {
            await transaction.rollback();
        }
        respondWithError(res, err);
    }
};

/**
 * Get a new counter value - caller is responsible for managing the transaction.
 */
const getNewCounterValue = async (projectId: string, backlogItemType: string, transaction: Transaction) => {
    let result: string;
    let stage = "init";
    const entitySubtype = backlogItemType === "story" ? "story" : "issue";
    try {
        const projectSettingsFindOptions: FindOptions = {
            where: { projectId: projectId }
        };
        if (transaction) {
            projectSettingsFindOptions.transaction = transaction;
        }
        stage = "retrieve project settings";
        let projectSettingsItem: any = await ProjectSettingsDataModel.findOne(projectSettingsFindOptions);
        if (!projectSettingsItem) {
            stage = "retrieve global project settings";
            projectSettingsItem = await ProjectSettingsDataModel.findOne({
                where: { projectId: null },
                transaction
            });
        }
        if (projectSettingsItem) {
            stage = "process project settings item";
            const projectSettingsItemTyped = mapDbToApiProjectSettings(projectSettingsItem);
            const counterSettings = projectSettingsItemTyped.settings.counters[entitySubtype];
            const entityNumberPrefix = counterSettings.prefix;
            const entityNumberSuffix = counterSettings.suffix;
            const counterFindOptions: FindOptions = {
                where: { entity: "project", entityId: projectId, entitySubtype }
            };
            if (transaction) {
                counterFindOptions.transaction = transaction;
            }
            stage = "retrieve counter data for project";
            const counterItem: any = await CounterDataModel.findOne(counterFindOptions);
            if (counterItem) {
                stage = "process counter item";
                const counterItemTyped = mapDbToApiCounter(counterItem);
                counterItemTyped.lastNumber++;
                let counterValue = entityNumberPrefix || "";
                counterValue += formatNumber(counterItemTyped.lastNumber, counterSettings.totalFixedLength);
                counterValue += entityNumberSuffix || "";
                counterItemTyped.lastCounterValue = counterValue;
                stage = "store new counter value";
                await counterItem.update(counterItemTyped);
                result = counterItem.lastCounterValue;
            }
        }
    } catch (err) {
        throw new Error(`Unable to get new ID value (stage "${stage}"), ${err}`);
    }
    if (!result) {
        throw new Error("Unable to get new ID value - could not retrieve counter item");
    }
    return result;
};

export const backlogItemsPostHandler = async (req: Request, res: Response) => {
    let transaction: Transaction;
    try {
        let rolledBack = false;
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        const bodyWithId = { ...addIdToBody(req.body) };
        if (!bodyWithId.friendlyId) {
            const friendlyIdValue = await getNewCounterValue(req.body.projectId, req.body.type, transaction);
            bodyWithId.friendlyId = friendlyIdValue;
        }
        const prevBacklogItemId = bodyWithId.prevBacklogItemId;
        delete bodyWithId.prevBacklogItemId;
        await sequelize.query('SET CONSTRAINTS "productbacklogitem_backlogitemId_fkey" DEFERRED;', { transaction });
        await sequelize.query('SET CONSTRAINTS "productbacklogitem_nextbacklogitemId_fkey" DEFERRED;', { transaction });
        const updateBacklogItemPartResult = getUpdatedBacklogItemWhenStatusChanges(null, bodyWithId);
        const newItem = updateBacklogItemPartResult.backlogItem;
        const addedBacklogItem = await BacklogItemDataModel.create(newItem, { transaction } as CreateOptions);
        if (!prevBacklogItemId) {
            await productBacklogItemFirstItemInserter(newItem, transaction);
        } else {
            const result = await productBacklogItemSubsequentItemInserter(newItem, transaction, prevBacklogItemId);
            if (result.status !== StatusCodes.OK) {
                respondWithFailedValidation(res, result.message);
            }
            rolledBack = result.rolledBack;
        }
        if (!rolledBack) {
            await BacklogItemPartDataModel.create(
                {
                    ...addIdToBody({
                        externalId: null,
                        backlogitemId: bodyWithId.id,
                        partIndex: 1,
                        percentage: 100.0,
                        points: bodyWithId.estimate,
                        startedAt: bodyWithId.startedAt,
                        finishedAt: bodyWithId.finishedAt,
                        status: bodyWithId.status
                    })
                },
                {
                    transaction
                } as CreateOptions
            );
        }
        if (!rolledBack) {
            await transaction.commit();
            res.status(StatusCodes.CREATED).json({
                status: StatusCodes.CREATED,
                data: {
                    item: addedBacklogItem
                }
            });
        }
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        respondWithError(res, err);
    }
};

export const backlogItemPutHandler = async (req: Request, res: Response) => {
    const functionTag = "backlogItemPutHandler";
    const logContext = logger.info("starting call", [functionTag]);
    const queryParamItemId = req.params.itemId;
    if (!queryParamItemId) {
        respondWithFailedValidation(res, "Item ID is required in URI path for this operation");
        return;
    }
    const bodyItemId = req.body.id;
    if (queryParamItemId != bodyItemId) {
        respondWithFailedValidation(
            res,
            `Item ID in URI path (${queryParamItemId}) should match Item ID in payload (${bodyItemId})`
        );
        return;
    }
    if (!isValidStatus(req.body.status)) {
        respondWithFailedValidation(
            res,
            `Status "${req.body.status}" is not a valid value - it should be one of the following: ${getValidStatuses().join(", ")}`
        );
        return;
    }
    let transaction: Transaction;
    try {
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        const backlogItem = await BacklogItemDataModel.findOne({
            where: { id: bodyItemId },
            transaction
        });
        if (!backlogItem) {
            if (transaction) {
                await transaction.commit();
                transaction = null;
            }
            respondWithNotFound(res, `Unable to find backlogitem to update with ID ${req.body.id}`);
        } else {
            const originalApiBacklogItem = mapDbToApiBacklogItem(backlogItem);
            const updateBacklogItemResult = getUpdatedBacklogItemWhenStatusChanges(originalApiBacklogItem, req.body);
            const newDataItem = updateBacklogItemResult.changed ? backlogItem : updateBacklogItemResult.backlogItem;
            await backlogItem.update(newDataItem, { transaction });
            await handleResponseAndCommit(originalApiBacklogItem, backlogItem, res, transaction);
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
    }
};

export const backlogItemsReorderPostHandler = async (req: Request, res: Response) => {
    const sourceItemId = req.body.sourceItemId;
    const targetItemId = req.body.targetItemId;
    if (!sourceItemId) {
        respondWithFailedValidation(res, "sourceItemId must have a value");
        return;
    }
    if (sourceItemId === targetItemId) {
        respondWithFailedValidation(res, "sourceItemId and targetItemId must be different!");
        return;
    }
    let transaction: Transaction;
    try {
        let rolledBack = false;
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });

        // 1. Unlink source item from old location
        const sourceItemPrevLink = await ProductBacklogItemDataModel.findOne({
            where: { nextbacklogitemId: sourceItemId }
        });
        const sourceItemNextLink = await ProductBacklogItemDataModel.findOne({
            where: { backlogitemId: sourceItemId }
        });
        const oldNextItemId = (sourceItemNextLink as any).dataValues.nextbacklogitemId;
        const sourceItemPrevLinkId = (sourceItemPrevLink as any).dataValues.backlogitemId;
        if (sourceItemPrevLinkId === oldNextItemId) {
            throw new Error(`sourceItemPrevLink with ${sourceItemPrevLinkId} linked to self!`);
        }
        await sourceItemPrevLink.update({ nextbacklogitemId: oldNextItemId }, { transaction });

        // 2. Re-link source item in new location
        const targetItemPrevLink = await ProductBacklogItemDataModel.findOne({
            where: { nextbacklogitemId: targetItemId }
        });
        const targetItemPrevLinkId = (targetItemPrevLink as any).dataValues.backlogitemId;
        if (targetItemPrevLinkId === sourceItemId) {
            throw new Error(`targetItemPrevLink with ${targetItemPrevLinkId} linked to self (which was source item)!`);
        }
        await targetItemPrevLink.update({ nextbacklogitemId: sourceItemId }, { transaction });
        const sourceItemNextLinkId = (sourceItemNextLink as any).dataValues.backlogitemId;
        if (sourceItemNextLinkId === targetItemId) {
            throw new Error(`sourceItemNextLink with ${sourceItemNextLinkId} linked to self (which was target item)!`);
        }
        await sourceItemNextLink.update({ nextbacklogitemId: targetItemId }, { transaction });

        if (!rolledBack) {
            await transaction.commit();
            respondWithOk(res);
        }
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        respondWithError(res, err);
    }
};

export const backlogItemJoinUnallocatedPartsPostHandler = async (req: Request, res: Response) => {
    const handlerContext = start("backlogItemJoinUnallocatedPartsPostHandler", res);

    const queryParamBacklogItemId = req.params.itemId;

    if (!queryParamBacklogItemId) {
        return await handleFailedValidationResponse(handlerContext, "Item ID is required in URI path for this operation");
    }

    try {
        await beginSerializableTransaction(handlerContext);

        const transaction = handlerContext.transactionContext.transaction;

        const backlogitempartsResult = await fetchBacklogItemParts(queryParamBacklogItemId, transaction);
        if (!isRestApiCollectionResult(backlogitempartsResult)) {
            return await handlePersistenceErrorResponse(
                handlerContext,
                `unable to retrieve backlog item parts for backlog item ID "${queryParamBacklogItemId}"`,
                backlogitempartsResult
            );
        }
        const allBacklogItemParts = backlogitempartsResult.data.items;

        const partsWithAllocationInfo = await fetchAllocatedAndUnallocatedBacklogItemParts(allBacklogItemParts, transaction);
        const unallocatedBacklogItemParts = partsWithAllocationInfo.filter((item) => !item.sprintId);
        const unallocatedBacklogItemPartsSorted = unallocatedBacklogItemParts.sort((a, b) => a.partIndex - b.partIndex);

        // Keep part with lowest partIndex value and remove all the other unallocated parts
        // (for example, unallocated parts could be: 1, 5, 6 and 2, 3, 4 could be allocated to sprints)
        const partIndexesRemoved: number[] = [];
        const itemsToRemove = unallocatedBacklogItemPartsSorted.slice(1);
        let errorMessage = "";
        for (const item of itemsToRemove) {
            if (!errorMessage) {
                const backlogItemPartId = item.id;
                const findItemOptions: FindOptions = buildOptionsWithTransaction({ where: { id: backlogItemPartId } }, transaction);
                const dbBacklogItemPart = await BacklogItemPartDataModel.findOne(findItemOptions);
                if (!dbBacklogItemPart) {
                    errorMessage = `Backlog item part to remove ("${backlogItemPartId}") was not found`;
                }
                await dbBacklogItemPart.destroy({ transaction });
                partIndexesRemoved.push(dbBacklogItemPart.partIndex);
            }
        }
        if (errorMessage) {
            return await handlePersistenceErrorResponse(handlerContext, errorMessage);
        }

        // Re-assign partIndex values
        const firstItem = unallocatedBacklogItemPartsSorted[0];
        const itemsToKeep = [firstItem];
        const allocatedBacklogItemParts = partsWithAllocationInfo.filter((item) => item.sprintId);
        allocatedBacklogItemParts.forEach((item) => {
            itemsToKeep.push(item);
        });
        const unsortedBacklogItemPartsWithSprintId: ApiBacklogItemPartWithSprintId[] = [];
        for (const item of itemsToKeep) {
            if (!errorMessage) {
                const newPartIndex = calcNewPartIndex(item.partIndex, partIndexesRemoved);
                unsortedBacklogItemPartsWithSprintId.push({
                    ...item,
                    partIndex: newPartIndex
                });
                if (newPartIndex !== item.partIndex) {
                    const backlogItemPartId = item.id;
                    const findItemOptions: FindOptions = buildOptionsWithTransaction(
                        { where: { id: backlogItemPartId } },
                        transaction
                    );
                    const dbBacklogItemPart = await BacklogItemPartDataModel.findOne(findItemOptions);
                    if (!dbBacklogItemPart) {
                        errorMessage = `Backlog item part to keep ("${backlogItemPartId}") was not found`;
                    }
                    const newBacklogItemPart = { ...mapDbToApiBacklogItemPart(dbBacklogItemPart), partIndex: newPartIndex };
                    await dbBacklogItemPart.update(mapApiToDbBacklogItemPart(newBacklogItemPart), { transaction });
                }
            }
        }

        // Update totalParts in backlog item
        const findItemOptions: FindOptions = buildOptionsWithTransaction({ where: { id: queryParamBacklogItemId } }, transaction);
        const dbBacklogItem = await BacklogItemDataModel.findOne(findItemOptions);
        const newApiBacklogItem = { ...mapDbToApiBacklogItem(dbBacklogItem), totalParts: itemsToKeep.length };
        await dbBacklogItem.update(mapApiToDbBacklogItem(newApiBacklogItem), { transaction });

        const backlogItemPartsWithSprintId = unsortedBacklogItemPartsWithSprintId.sort((a, b) => a.partIndex - b.partIndex);
        const extra = {
            backlogItemPartsWithSprintId
        };
        const result = buildResponseWithItem(
            { ...newApiBacklogItem, unallocatedParts: 1, unallocatedPoints: firstItem.points },
            extra
        );
        await handleSuccessResponse(handlerContext, result);
    } catch (err) {
        await handleUnexpectedErrorResponse(handlerContext, err);
    }
};

const handleResponseAndCommit = async (
    originalApiBacklogItem: ApiBacklogItem,
    backlogItem: BacklogItemDataModel,
    res: Response,
    transaction: Transaction
): Promise<void> => {
    let sprintStats: ApiSprintStats;
    const originalBacklogItem = mapApiItemToBacklogItem(originalApiBacklogItem);
    if (transaction) {
        await transaction.commit();
        transaction = null;
    }
    respondWithItem(res, backlogItem, originalBacklogItem, sprintStats ? { sprintStats } : undefined);
};
