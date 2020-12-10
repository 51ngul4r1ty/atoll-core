// externals
import { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";
import { Transaction } from "sequelize";

// libraries
import { BacklogItemStatus, mapApiStatusToBacklogItem } from "@atoll/shared";

// data access
import { sequelize } from "../../dataaccess/connection";
import { BacklogItemModel, mapFromSprint, SprintBacklogItemModel, SprintModel } from "../../dataaccess";

// utils
import { respondWithError } from "../utils/responder";
import { buildOptionsFromParams } from "../utils/sequelizeHelper";
import { getParamsFromRequest } from "../utils/filterHelper";
import { mapSprintBacklogToBacklogItem, mapToSprint } from "../../dataaccess/mappers/dataAccessToApiMappers";

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
        let plannedTotal = 0;
        let acceptedTotal = 0;
        sprintBacklogItems.forEach((sprintBacklogItem) => {
            const sprintBacklogItemTyped = mapSprintBacklogToBacklogItem(sprintBacklogItem);
            if (sprintBacklogItemTyped.estimate) {
                plannedTotal += sprintBacklogItemTyped.estimate;
                const status = mapApiStatusToBacklogItem(sprintBacklogItemTyped.status);
                if (status === BacklogItemStatus.Accepted) {
                    acceptedTotal += sprintBacklogItemTyped.estimate;
                }
            }
        });
        const sprint = await SprintModel.findOne({ where: { id: sprintId }, transaction });
        const apiSprint = mapToSprint(sprint);
        const newSprint = mapFromSprint(apiSprint);
        newSprint.plannedPoints = plannedTotal;
        newSprint.acceptedPoints = acceptedTotal;
        await sprint.update(newSprint);

        await transaction.commit();
        res.status(HttpStatus.OK).json({
            status: HttpStatus.OK,
            data: {
                plannedTotal,
                acceptedTotal
            }
        });
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        respondWithError(res, err);
    }
};
