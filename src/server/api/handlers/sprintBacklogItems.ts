// externals
import { Request } from "express";
import * as HttpStatus from "http-status-codes";
import { CreateOptions, Transaction } from "sequelize";

// utils
import { getParamsFromRequest } from "../utils/filterHelper";
import { buildOptionsFromParams } from "../utils/sequelizeHelper";
import { respondWithError } from "../utils/responder";
import { mapSprintBacklogToBacklogItem, mapToSprintBacklogItem } from "../../dataaccess/mappers/apiToDataAccessMappers";
import { addIdToBody } from "../utils/uuidHelper";
import { sprintBacklogItemFetcher } from "./fetchers/sprintBacklogItemFetcher";

// data access
import { sequelize } from "../../dataaccess/connection";
import { SprintBacklogItemModel } from "../../dataaccess/models/SprintBacklogItem";
import { removeFromProductBacklog } from "./deleters/backlogItemRankDeleter";
import { BacklogItemModel } from "dataaccess/models/BacklogItem";
import { backlogItemRankFirstItemInserter } from "./inserters/backlogItemRankInserter";

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
            const lastSprintBacklogItem = mapToSprintBacklogItem(sprintBacklogs[sprintBacklogs.length - 1]);
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
        if (removeProductBacklogItemResult.status !== HttpStatus.OK) {
            await transaction.rollback();
            rolledBack = true;
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message:
                    `Error ${removeProductBacklogItemResult.message} (status ${removeProductBacklogItemResult.status}) ` +
                    "when trying to remove backlog item from the product backlog"
            });
        }
        if (!rolledBack) {
            await transaction.commit();
            res.status(HttpStatus.CREATED).json({
                status: HttpStatus.CREATED,
                data: {
                    item: addedSprintBacklog
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

export const sprintBacklogItemDeleteHandler = async (req: Request, res) => {
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
        const sprintBacklogItemTyped = mapSprintBacklogToBacklogItem(sprintBacklogItem);
        const result = await backlogItemRankFirstItemInserter(sprintBacklogItemTyped, transaction);
        if (result.status === HttpStatus.OK) {
            await SprintBacklogItemModel.destroy({ where: { sprintId, backlogitemId: backlogItemId }, transaction });
        } else {
            await transaction.rollback();
            rolledBack = true;
            respondWithError(
                res,
                `Unable to insert new backlogitemrank entries, aborting move to product backlog for item ID ${backlogItemId}`
            );
        }
        if (!rolledBack) {
            await transaction.commit();
            res.status(HttpStatus.OK).json({
                status: HttpStatus.OK,
                data: {
                    item: sprintBacklogItemTyped
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
