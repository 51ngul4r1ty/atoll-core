// externals
import { Request } from "express";
import * as HttpStatus from "http-status-codes";
import { Transaction } from "sequelize";

// libraries
import { ApiBacklogItemPart, logger } from "@atoll/shared";

// data access
import { sequelize } from "../../dataaccess/connection";
import { SprintBacklogItemDataModel } from "../../dataaccess/models/SprintBacklogItem";
import { BacklogItemPartDataModel } from "../../dataaccess/models/BacklogItemPart";
import { BacklogItemDataModel } from "../../dataaccess/models/BacklogItem";

// utils
import { getParamsFromRequest } from "../utils/filterHelper";
import { buildOptionsFromParams } from "../utils/sequelizeHelper";
import { respondWithError, respondWithNotFound } from "../utils/responder";
import { addIdToBody } from "../utils/uuidHelper";
import { mapApiToDbBacklogItemPart } from "../../dataaccess/mappers/apiToDataAccessMappers";

export const sprintBacklogItemPartsPostHandler = async (req: Request, res) => {
    const functionTag = "sprintBacklogItemPartsPostHandler";
    const logContext = logger.info("starting call", [functionTag]);
    const params = getParamsFromRequest(req);
    const backlogItemId = params.backlogItemId;
    const sprintId = params.sprintId;
    let transaction: Transaction;
    try {
        let rolledBack = false;
        let aborted = false;
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        const options = buildOptionsFromParams({ sprintId });
        options.include = { all: true, nested: true };
        const sprintBacklogItems = await SprintBacklogItemDataModel.findAll({
            ...options,
            order: [["displayindex", "ASC"]],
            transaction
        });
        if (!sprintBacklogItems.length) {
            respondWithNotFound(res, `Unable to find sprint backlog item in sprint "${sprintId}" with ID "${backlogItemId}"`);
            aborted = true;
        }
        let addedBacklogItemPart: BacklogItemPartDataModel;
        if (!aborted) {
            const matchingItems = sprintBacklogItems.filter((sprintBacklogItem) => {
                const backlogItemPart = (sprintBacklogItem as any).backlogitempart;
                if (backlogItemPart) {
                    const backlogItem = backlogItemPart.backlogitem;
                    return backlogItem.id === backlogItemId;
                }
                return false;
            });
            const sprintBacklogItem = matchingItems[0];
            const backlogItemPart: BacklogItemPartDataModel = (sprintBacklogItem as any).backlogitempart;
            const backlogItem: BacklogItemDataModel = (backlogItemPart as any).backlogitem;
            const percentage = 20; // Apply the default rule that there's often 20% of the work remaining (unless estimate was off)
            const allBacklogItemParts = await BacklogItemPartDataModel.findAll({
                where: { backlogitemId: backlogItemId },
                transaction
            });
            let maxPartIndex: number = 0;
            allBacklogItemParts.forEach((item) => {
                if (item.partindex > maxPartIndex) {
                    maxPartIndex = item.partindex;
                }
            });
            const newApiBacklogItemPart: ApiBacklogItemPart = {
                id: null,
                externalId: null,
                backlogitemId: backlogItemPart.backlogitemId,
                partindex: maxPartIndex + 1,
                percentage,
                points: Math.ceil(backlogItem.estimate * (percentage / 100)),
                startedAt: null,
                finishedAt: null,
                status: "N" /* this part has not been started yet */
            };
            const newBacklogItemPart = mapApiToDbBacklogItemPart({ ...addIdToBody(newApiBacklogItemPart), version: 0 });
            addedBacklogItemPart = await BacklogItemPartDataModel.create(newBacklogItemPart, { transaction });
            // TODO: Allocate this part to the next sprint
        }
        if (!rolledBack) {
            await transaction.commit();
            res.status(HttpStatus.CREATED).json({
                status: HttpStatus.CREATED,
                data: {
                    item: addedBacklogItemPart
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
