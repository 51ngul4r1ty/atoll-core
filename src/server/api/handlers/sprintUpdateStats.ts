// externals
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { Transaction } from "sequelize";

// libraries
import { hasBacklogItemAtLeastBeenAccepted, mapApiStatusToBacklogItem } from "@atoll/shared";

// data access
import { sequelize } from "../../dataaccess/connection";
import { BacklogItemDataModel, mapApiToDbSprint, SprintBacklogItemPartDataModel, SprintDataModel } from "../../dataaccess";

// utils
import { buildOptionsFromParams } from "../utils/sequelizeHelper";
import { buildResponseWithData } from "../utils/responseBuilder";
import { getParamsFromRequest } from "../utils/filterHelper";
import {
    mapDbSprintBacklogWithNestedToApiBacklogItemInSprint,
    mapDbToApiSprint
} from "../../dataaccess/mappers/dataAccessToApiMappers";
import { respondWithError } from "../utils/responder";

export const sprintUpdateStatsPostHandler = async (req: Request, res: Response) => {
    const params = getParamsFromRequest(req);
    const sprintId = params.sprintId;
    const options = buildOptionsFromParams({ sprintId });
    let transaction: Transaction;
    try {
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        const sprintBacklogItems = await SprintBacklogItemPartDataModel.findAll({
            ...options,
            include: [BacklogItemDataModel],
            order: [["displayindex", "ASC"]],
            transaction
        });
        let plannedPoints = 0;
        let acceptedPoints = 0;
        let totalPoints = 0;
        sprintBacklogItems.forEach((sprintBacklogItem) => {
            const sprintBacklogItemTyped = mapDbSprintBacklogWithNestedToApiBacklogItemInSprint(sprintBacklogItem);
            if (sprintBacklogItemTyped.estimate) {
                totalPoints += sprintBacklogItemTyped.estimate;
                plannedPoints += sprintBacklogItemTyped.estimate;
                const status = mapApiStatusToBacklogItem(sprintBacklogItemTyped.status);
                if (hasBacklogItemAtLeastBeenAccepted(status)) {
                    acceptedPoints += sprintBacklogItemTyped.estimate;
                }
            }
        });
        const sprint = await SprintDataModel.findOne({ where: { id: sprintId }, transaction });
        const apiSprint = mapDbToApiSprint(sprint);
        const newSprint = mapApiToDbSprint(apiSprint);
        newSprint.plannedPoints = plannedPoints;
        newSprint.acceptedPoints = acceptedPoints;
        newSprint.totalPoints = totalPoints;
        await sprint.update(newSprint);

        await transaction.commit();
        const response = buildResponseWithData({
            acceptedPoints,
            plannedPoints,
            totalPoints
        });
        res.status(response.status).json(response);
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        respondWithError(res, err);
    }
};
