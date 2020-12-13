// externals
import * as HttpStatus from "http-status-codes";
import { Request, Response } from "express";
import { Transaction } from "sequelize";

// libraries
import { BacklogItemStatus, mapApiStatusToBacklogItem } from "@atoll/shared";

// data access
import { sequelize } from "../../dataaccess/connection";
import { BacklogItemModel, mapApiToDbSprint, SprintBacklogItemModel, SprintModel } from "../../dataaccess";

// utils
import { respondWithError } from "../utils/responder";
import { buildOptionsFromParams } from "../utils/sequelizeHelper";
import { getParamsFromRequest } from "../utils/filterHelper";
import { mapDbSprintBacklogToApiBacklogItem, mapDbToApiSprint } from "../../dataaccess/mappers/dataAccessToApiMappers";

export const sprintUpdateStatsPostHandler = async (req: Request, res: Response) => {
    const params = getParamsFromRequest(req);
    const sprintId = params.sprintId;
    const options = buildOptionsFromParams({ sprintId });
    let transaction: Transaction;
    try {
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        const sprintBacklogItems = await SprintBacklogItemModel.findAll({
            ...options,
            include: [BacklogItemModel],
            order: [["displayindex", "ASC"]],
            transaction
        });
        let plannedPoints = 0;
        let acceptedPoints = 0;
        sprintBacklogItems.forEach((sprintBacklogItem) => {
            const sprintBacklogItemTyped = mapDbSprintBacklogToApiBacklogItem(sprintBacklogItem);
            if (sprintBacklogItemTyped.estimate) {
                plannedPoints += sprintBacklogItemTyped.estimate;
                const status = mapApiStatusToBacklogItem(sprintBacklogItemTyped.status);
                if (status === BacklogItemStatus.Accepted) {
                    acceptedPoints += sprintBacklogItemTyped.estimate;
                }
            }
        });
        const sprint = await SprintModel.findOne({ where: { id: sprintId }, transaction });
        const apiSprint = mapDbToApiSprint(sprint);
        const newSprint = mapApiToDbSprint(apiSprint);
        newSprint.plannedPoints = plannedPoints;
        newSprint.acceptedPoints = acceptedPoints;
        await sprint.update(newSprint);

        await transaction.commit();
        res.status(HttpStatus.OK).json({
            status: HttpStatus.OK,
            data: {
                plannedPoints,
                acceptedPoints
            }
        });
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        respondWithError(res, err);
    }
};
