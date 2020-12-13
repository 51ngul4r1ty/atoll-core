// externals
import { Request, Response } from "express";
import * as core from "express-serve-static-core";
import * as HttpStatus from "http-status-codes";
import { CreateOptions, Transaction } from "sequelize";

// libraries
import {
    getValidStatuses,
    isValidStatus,
    ApiBacklogItem,
    ApiBacklogItemRank,
    logger,
    ApiSprintStats,
    mapApiItemToBacklogItem
} from "@atoll/shared";

// data access
import { sequelize } from "../../dataaccess/connection";
import { BacklogItemModel } from "../../dataaccess/models/BacklogItem";
import { BacklogItemRankModel } from "../../dataaccess/models/BacklogItemRank";
import { CounterModel } from "../../dataaccess/models/Counter";
import { ProjectSettingsModel } from "../../dataaccess/models/ProjectSettings";

// utils
import {
    respondWithFailedValidation,
    respondWithNotFound,
    respondWithError,
    respondWithOk,
    respondWithItem
} from "../utils/responder";
import { getParamsFromRequest } from "../utils/filterHelper";
import { backlogItemFetcher } from "./fetchers/backlogItemFetcher";
import { addIdToBody } from "../utils/uuidHelper";
import { getInvalidPatchMessage, getPatchedItem } from "../utils/patcher";
import { backlogItemRankFirstItemInserter } from "./inserters/backlogItemRankInserter";
import { respondedWithMismatchedItemIds } from "../utils/validationResponders";
import {
    mapDbToApiBacklogItem,
    mapDbToApiCounter,
    mapDbToApiProjectSettings
} from "../../dataaccess/mappers/dataAccessToApiMappers";
import { handleSprintStatUpdate } from "./updaters/sprintStatUpdater";
import { getIdForSprintContainingBacklogItem } from "./fetchers/sprintFetcher";

export const backlogItemsGetHandler = async (req: Request, res: Response) => {
    const params = getParamsFromRequest(req);
    const result = await backlogItemFetcher(params.projectId);
    if (result.status === HttpStatus.OK) {
        res.json(result);
    } else {
        res.status(result.status).json({
            status: result.status,
            message: result.message
        });
        console.log(`Unable to fetch backlog items: ${result.message}`);
    }
};

export interface BacklogItemGetParams extends core.ParamsDictionary {
    itemId: string;
}

export const backlogItemGetHandler = async (req: Request<BacklogItemGetParams>, res: Response) => {
    try {
        const id = req.params.itemId;
        const backlogItem = await BacklogItemModel.findByPk(id);
        if (!backlogItem) {
            respondWithNotFound(res, `Unable to find backlogitem by primary key ${id}`);
        } else {
            res.json({
                status: HttpStatus.OK,
                data: {
                    item: mapDbToApiBacklogItem(backlogItem)
                }
            });
        }
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error
        });
        console.log(`Unable to fetch backlog item: ${error}`);
    }
};

export const backlogItemsDeleteHandler = async (req: Request, res: Response) => {
    let committing = false;
    let transaction: Transaction;
    try {
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        await sequelize.query('SET CONSTRAINTS "backlogitemrank_backlogitemId_fkey" DEFERRED;', { transaction });
        await sequelize.query('SET CONSTRAINTS "backlogitemrank_nextbacklogitemId_fkey" DEFERRED;', { transaction });
        const id = req.params.itemId;
        let abort = true;
        if (!id) {
            respondWithFailedValidation(res, "backlog item ID is required for DELETE");
        }
        let backlogItemTyped: ApiBacklogItem = null;
        let backlogItem: BacklogItemModel = await BacklogItemModel.findByPk(id, { transaction });
        if (!backlogItem) {
            respondWithNotFound(res, `Unable to find backlogitem by primary key ${id}`);
        } else {
            backlogItemTyped = mapDbToApiBacklogItem(backlogItem);
            abort = false;
        }
        if (!abort) {
            const firstLink = await BacklogItemRankModel.findOne({
                where: { nextbacklogitemId: id },
                transaction
            });
            let firstLinkTyped: ApiBacklogItemRank = null;
            if (!firstLink) {
                respondWithNotFound(res, `Unable to find backlogitemrank entry with next = ${id}`);
                abort = true;
            } else {
                firstLinkTyped = (firstLink as unknown) as ApiBacklogItemRank;
            }

            let secondLink: BacklogItemRankModel = null;
            let secondLinkTyped: ApiBacklogItemRank = null;

            if (!abort) {
                secondLink = await BacklogItemRankModel.findOne({
                    where: { backlogitemId: id },
                    transaction
                });
                if (!secondLink) {
                    respondWithNotFound(res, `Unable to find backlogitemrank entry with id = ${id}`);
                    abort = true;
                } else {
                    secondLinkTyped = (secondLink as unknown) as ApiBacklogItemRank;
                }
            }

            if (!abort) {
                if (!firstLinkTyped.backlogitemId && !secondLinkTyped.nextbacklogitemId) {
                    // we'll end up with one null-null row, just remove it instead
                    await BacklogItemRankModel.destroy({ where: { id: firstLinkTyped.id }, transaction });
                } else {
                    await firstLink.update({ nextbacklogitemId: secondLinkTyped.nextbacklogitemId }, { transaction });
                }
                await BacklogItemRankModel.destroy({ where: { id: secondLinkTyped.id }, transaction });
                await BacklogItemModel.destroy({ where: { id: backlogItemTyped.id }, transaction });
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

const formatNumber = (value: number, length: number | undefined) => {
    if (!length) {
        return `${value}`;
    } else {
        let result = `${value}`;
        while (result.length < length) {
            result = "0" + result;
        }
        return result;
    }
};

const getNewCounterValue = async (projectId: string, backlogItemType: string) => {
    let result: string;
    const entitySubtype = backlogItemType === "story" ? "story" : "issue";
    //    const projectId = "69a9288264964568beb5dd243dc29008";
    let transaction: Transaction;
    try {
        let rolledBack = false;
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        let projectSettingsItem: any = await ProjectSettingsModel.findOne({
            where: { projectId: projectId },
            transaction
        });
        if (!projectSettingsItem) {
            projectSettingsItem = await ProjectSettingsModel.findOne({
                where: { projectId: null },
                transaction
            });
        }
        if (projectSettingsItem) {
            const projectSettingsItemTyped = mapDbToApiProjectSettings(projectSettingsItem);
            const counterSettings = projectSettingsItemTyped.settings.counters[entitySubtype];
            const entityNumberPrefix = counterSettings.prefix;
            const entityNumberSuffix = counterSettings.suffix;
            const counterItem: any = await CounterModel.findOne({
                where: { entity: "project", entityId: projectId, entitySubtype },
                transaction
            });
            if (counterItem) {
                const counterItemTyped = mapDbToApiCounter(counterItem);
                counterItemTyped.lastNumber++;
                let counterValue = entityNumberPrefix || "";
                counterValue += formatNumber(counterItemTyped.lastNumber, counterSettings.totalFixedLength);
                counterValue += entityNumberSuffix || "";
                counterItemTyped.lastCounterValue = counterValue;
                await counterItem.update(counterItemTyped);
                result = counterItem.lastCounterValue;
            }
        }
        if (!rolledBack) {
            await transaction.commit();
        }
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        throw new Error(`Unable to get new ID value, ${err}`);
    }
    if (!result) {
        throw new Error("Unable to get new ID value - could not retrieve counter item");
    }
    return result;
};

export const backlogItemsPostHandler = async (req: Request, res: Response) => {
    const bodyWithId = { ...addIdToBody(req.body) };
    if (!bodyWithId.friendlyId) {
        const friendlyIdValue = await getNewCounterValue(req.body.projectId, req.body.type);
        bodyWithId.friendlyId = friendlyIdValue;
    }
    const prevBacklogItemId = bodyWithId.prevBacklogItemId;
    delete bodyWithId.prevBacklogItemId;
    let transaction: Transaction;
    try {
        let rolledBack = false;
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        await sequelize.query('SET CONSTRAINTS "backlogitemrank_backlogitemId_fkey" DEFERRED;', { transaction });
        await sequelize.query('SET CONSTRAINTS "backlogitemrank_nextbacklogitemId_fkey" DEFERRED;', { transaction });
        const addedBacklogItem = await BacklogItemModel.create(bodyWithId, { transaction } as CreateOptions);
        if (!prevBacklogItemId) {
            await backlogItemRankFirstItemInserter(bodyWithId, transaction);
        } else {
            // 1. if there is a single item in database then we'll have this entry:
            //   backlogitemId=null, nextbacklogitemId=item1
            //   backlogitemId=item1, nextbacklogitemId=null
            // in this example, prevBacklogItemId will be item1, so we must end up with:
            //   backlogitemId=null, nextbacklogitemId=item1     (NO CHANGE)
            //   backlogitemId=item1, nextbacklogitemId=NEWITEM  (UPDATE "item1" entry to have new "next")
            //   backlogitemId=NEWITEM, nextbacklogitemId=null   (ADD "NEWITEM" entry with old "new")
            // this means:
            // (1) get entry (as prevBacklogItem) with backlogItemId = prevBacklogItemId
            const prevBacklogItems = await BacklogItemRankModel.findAll({
                where: { backlogitemId: prevBacklogItemId },
                transaction
            });
            if (!prevBacklogItems.length) {
                respondWithFailedValidation(
                    res,
                    `Invalid previous backlog item - can't find entries with ID ${prevBacklogItemId} in database`
                );
                await transaction.rollback();
                rolledBack = true;
            } else {
                const prevBacklogItem = prevBacklogItems[0];
                // (2) oldNextItemId = prevBacklogItem.nextbacklogitemId
                const oldNextItemId = ((prevBacklogItem as unknown) as ApiBacklogItemRank).nextbacklogitemId;
                // (3) update existing entry with nextbacklogitemId = bodyWithId.id
                await prevBacklogItem.update({ nextbacklogitemId: bodyWithId.id }, { transaction });
                // (4) add new row with backlogitemId = bodyWithId.id, nextbacklogitemId = oldNextItemId
                await BacklogItemRankModel.create(
                    {
                        ...addIdToBody({
                            projectId: bodyWithId.projectId,
                            backlogitemId: bodyWithId.id,
                            nextbacklogitemId: oldNextItemId
                        })
                    },
                    {
                        transaction
                    } as CreateOptions
                );
            }
            // TODO: Write unit tests to try and mimick this and test that the logic handles it as well:
            // 2. if there are multiple items in database then we'll have these entries:
            // backlogitemId=null, nextbacklogitemId=item1
            // backlogitemId=item1, nextbacklogitemId=item2
            // backlogitemId=item2, nextbacklogitemId=null
        }
        if (!rolledBack) {
            await transaction.commit();
            res.status(HttpStatus.CREATED).json({
                status: HttpStatus.CREATED,
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
    try {
        const backlogItem = await BacklogItemModel.findOne({
            where: { id: bodyItemId }
        });
        if (!backlogItem) {
            respondWithNotFound(res, `Unable to find backlogitem to update with ID ${req.body.id}`);
        } else {
            const originalBacklogItem = mapDbToApiBacklogItem(backlogItem);

            await backlogItem.update(req.body);
            respondWithItem(res, backlogItem, originalBacklogItem);
        }
    } catch (err) {
        respondWithError(res, err);
    }
};

export const backlogItemPatchHandler = async (req: Request, res: Response) => {
    const functionTag = "backlogItemPatchHandler";
    const logContext = logger.info("starting call", [functionTag]);
    const queryParamItemId = req.params.itemId;
    if (!queryParamItemId) {
        respondWithFailedValidation(res, "Item ID is required in URI path for this operation");
        return;
    }
    const bodyItemId = req.body.id;
    if (respondedWithMismatchedItemIds(res, queryParamItemId, bodyItemId)) {
        return;
    }
    let sprintStats: ApiSprintStats;
    let transaction: Transaction;
    try {
        let rolledBack = false;
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        const backlogItem = await BacklogItemModel.findOne({
            where: { id: queryParamItemId },
            transaction
        });
        if (!backlogItem) {
            respondWithNotFound(res, `Unable to find backlogitem to patch with ID ${queryParamItemId}`);
        } else {
            const originalApiBacklogItem = mapDbToApiBacklogItem(backlogItem);
            const invalidPatchMessage = getInvalidPatchMessage(originalApiBacklogItem, req.body);
            if (invalidPatchMessage) {
                respondWithFailedValidation(res, `Unable to patch: ${invalidPatchMessage}`);
            } else {
                const newDataItem = getPatchedItem(originalApiBacklogItem, req.body);
                await backlogItem.update(newDataItem);
                const newBacklogItem = mapApiItemToBacklogItem(newDataItem);
                const originalBacklogItem = mapApiItemToBacklogItem(originalApiBacklogItem);
                if (
                    originalBacklogItem.estimate !== newBacklogItem.estimate ||
                    originalBacklogItem.status !== newBacklogItem.status
                ) {
                    const sprintId = await getIdForSprintContainingBacklogItem(originalBacklogItem.id, transaction);
                    sprintStats = await handleSprintStatUpdate(
                        sprintId,
                        originalBacklogItem.status,
                        newBacklogItem.status,
                        originalBacklogItem.estimate,
                        newBacklogItem.estimate,
                        transaction
                    );
                }
                if (!rolledBack) {
                    await transaction.commit();
                    respondWithItem(res, backlogItem, originalBacklogItem, { sprintStats });
                }
            }
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
    logger.info("finishing call", [functionTag]);
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
        const sourceItemPrevLink = await BacklogItemRankModel.findOne({
            where: { nextbacklogitemId: sourceItemId }
        });
        const sourceItemNextLink = await BacklogItemRankModel.findOne({
            where: { backlogitemId: sourceItemId }
        });
        const oldNextItemId = (sourceItemNextLink as any).dataValues.nextbacklogitemId;
        const sourceItemPrevLinkId = (sourceItemPrevLink as any).dataValues.backlogitemId;
        if (sourceItemPrevLinkId === oldNextItemId) {
            throw new Error(`sourceItemPrevLink with ${sourceItemPrevLinkId} linked to self!`);
        }
        await sourceItemPrevLink.update({ nextbacklogitemId: oldNextItemId }, { transaction });

        // 2. Re-link source item in new location
        const targetItemPrevLink = await BacklogItemRankModel.findOne({
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
