// externals
import { Request } from "express";
import * as HttpStatus from "http-status-codes";
import { CreateOptions, Transaction } from "sequelize";

// libraries
import { ApiSprintStats, logger, mapApiItemToBacklogItem } from "@atoll/shared";

// data access
import { sequelize } from "../../dataaccess/connection";
import { SprintBacklogItemModel } from "../../dataaccess/models/SprintBacklogItem";
import { BacklogItemModel } from "../../dataaccess/models/BacklogItem";

// utils
import { getParamsFromRequest } from "../utils/filterHelper";
import { buildOptionsFromParams } from "../utils/sequelizeHelper";
import { respondWithError, respondWithNotFound } from "../utils/responder";
import {
    mapDbSprintBacklogToApiBacklogItem,
    mapDbToApiBacklogItem,
    mapDbToApiSprintBacklogItem
} from "../../dataaccess/mappers/dataAccessToApiMappers";
import { addIdToBody } from "../utils/uuidHelper";
import { sprintBacklogItemFetcher } from "./fetchers/sprintBacklogItemFetcher";
import { backlogItemRankFirstItemInserter } from "./inserters/backlogItemRankInserter";
import { handleSprintStatUpdate, StatUpdateMode } from "./updaters/sprintStatUpdater";
import { removeFromProductBacklog } from "./deleters/backlogItemRankDeleter";

export const sprintBacklogItemsGetHandler = async (req: Request, res) => {
    const params = getParamsFromRequest(req);
    const result = await sprintBacklogItemFetcher(params.sprintId);
    if (result.status === HttpStatus.OK) {
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
    const sprintId = params.sprintId;
    let transaction: Transaction;
    try {
        let rolledBack = false;
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        let displayIndex: number;
        const options = buildOptionsFromParams({ sprintId });
        const sprintBacklogs = await SprintBacklogItemModel.findAll({
            ...options,
            order: [["displayindex", "ASC"]]
        });
        if (sprintBacklogs && sprintBacklogs.length) {
            const lastSprintBacklogItem = mapDbToApiSprintBacklogItem(sprintBacklogs[sprintBacklogs.length - 1]);
            displayIndex = lastSprintBacklogItem.displayindex + 1;
        } else {
            displayIndex = 0;
        }
        const bodyWithId = addIdToBody({
            sprintId,
            backlogitemId,
            displayindex: displayIndex
        });
        const addedSprintBacklog = await SprintBacklogItemModel.create(bodyWithId, { transaction } as CreateOptions);
        const removeProductBacklogItemResult = await removeFromProductBacklog(backlogitemId, transaction);
        let sprintStats: ApiSprintStats;
        if (removeProductBacklogItemResult.status !== HttpStatus.OK) {
            await transaction.rollback();
            rolledBack = true;
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message:
                    `Error ${removeProductBacklogItemResult.message} (status ${removeProductBacklogItemResult.status}) ` +
                    "when trying to remove backlog item from the product backlog"
            });
        } else {
            const dbBacklogItem = await BacklogItemModel.findOne({ where: { id: backlogitemId }, transaction });
            const apiBacklogItem = mapDbToApiBacklogItem(dbBacklogItem);
            const backlogItemTyped = mapApiItemToBacklogItem(apiBacklogItem);
            sprintStats = await handleSprintStatUpdate(
                StatUpdateMode.Add,
                sprintId,
                backlogItemTyped.status,
                backlogItemTyped.estimate,
                transaction
            );
        }
        if (!rolledBack) {
            await transaction.commit();
            res.status(HttpStatus.CREATED).json({
                status: HttpStatus.CREATED,
                data: {
                    item: addedSprintBacklog,
                    extra: {
                        sprintStats
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
    const functionTag = "sprintBacklogItemDeleteHandler";
    const params = getParamsFromRequest(req);
    const backlogItemId = params.backlogItemId;
    const sprintId = params.sprintId;
    let transaction: Transaction;
    try {
        let rolledBack = false;
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        let sprintBacklogItem = await SprintBacklogItemModel.findOne({
            where: { sprintId, backlogitemId: backlogItemId },
            include: [BacklogItemModel],
            transaction
        });
        if (!sprintBacklogItem) {
            respondWithNotFound(res, `Unable to find sprint backlog item in sprint "${sprintId}" with ID "${backlogItemId}"`);
        } else {
            let sprintStats: ApiSprintStats;
            const apiBacklogItemTyped = mapDbSprintBacklogToApiBacklogItem(sprintBacklogItem);
            const backlogItemTyped = mapApiItemToBacklogItem(apiBacklogItemTyped);
            const result = await backlogItemRankFirstItemInserter(apiBacklogItemTyped, transaction);
            if (result.status !== HttpStatus.OK) {
                await transaction.rollback();
                rolledBack = true;
                respondWithError(
                    res,
                    `Unable to insert new backlogitemrank entries, aborting move to product backlog for item ID ${backlogItemId}`
                );
            } else {
                await SprintBacklogItemModel.destroy({ where: { sprintId, backlogitemId: backlogItemId }, transaction });
                sprintStats = await handleSprintStatUpdate(
                    StatUpdateMode.Remove,
                    sprintId,
                    backlogItemTyped.status,
                    backlogItemTyped.estimate,
                    transaction
                );
            }
            if (!rolledBack) {
                await transaction.commit();
                res.status(HttpStatus.OK).json({
                    status: HttpStatus.OK,
                    data: {
                        item: apiBacklogItemTyped,
                        extra: {
                            sprintStats
                        }
                    }
                });
            }
        }
    } catch (err) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (err) {
                logger.warn(`roll back failed with error "${err}"`, [functionTag]);
            }
        }
        respondWithError(res, err);
    }
};
