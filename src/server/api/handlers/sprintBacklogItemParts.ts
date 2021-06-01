// externals
import { Request, Response } from "express";

// libraries
import {
    ApiBacklogItem,
    ApiBacklogItemPart,
    ApiSprintBacklogItem,
    ApiSprintStats,
    BacklogItemStatus,
    determineSprintStatus,
    mapApiItemToSprint,
    mapApiStatusToBacklogItem
} from "@atoll/shared";

// data access
import { SprintDataModel } from "../../dataaccess/models/Sprint";

// utils
import { getParamsFromRequest } from "../utils/filterHelper";
import {
    abortWithNotFoundResponse,
    beginSerializableTransaction,
    commitWithCreatedResponseIfNotAborted,
    finish,
    handleUnexpectedErrorResponse,
    hasAborted,
    start
} from "./utils/handlerContext";
import {
    addBacklogItemPart,
    addBacklogItemPartToNextSprint,
    fetchSprintBacklogItemsWithNested,
    getBacklogItemAndSprint,
    updateBacklogItemWithPartCount
} from "./helpers/sprintBacklogItemPartsHelper";
import {
    mapDbToApiBacklogItem,
    mapDbToApiBacklogItemPart,
    mapDbToApiSprint,
    mapDbToApiSprintBacklogItem
} from "../../dataaccess/mappers/dataAccessToApiMappers";
import { buildNewSprintStats, buildSprintStatsFromApiSprint } from "./helpers/sprintStatsHelper";

export const sprintBacklogItemPartsPostHandler = async (req: Request, res: Response) => {
    const handlerContext = start("sprintBacklogItemPartsPostHandler", res);

    const params = getParamsFromRequest(req);
    const backlogItemId = params.backlogItemId;
    const sprintId = params.sprintId;

    try {
        await beginSerializableTransaction(handlerContext);

        const sprintBacklogItemsWithNested = await fetchSprintBacklogItemsWithNested(handlerContext, sprintId);
        if (!sprintBacklogItemsWithNested.length) {
            abortWithNotFoundResponse(
                handlerContext,
                `Unable to find sprint with ID "${sprintId}" never mind the backlog item with ID "${backlogItemId}" in that sprint!`
            );
        }

        let addedBacklogItemPart: ApiBacklogItemPart;
        let addedSprintBacklogItem: ApiSprintBacklogItem;
        let backlogItemForAddedPart: ApiBacklogItem;
        let sprintStats: ApiSprintStats;
        if (!hasAborted(handlerContext)) {
            const { backlogItem, sprint: dbSprint } = getBacklogItemAndSprint(sprintBacklogItemsWithNested, backlogItemId);

            backlogItemForAddedPart = mapDbToApiBacklogItem(backlogItem);
            const backlogItemPart = await addBacklogItemPart(handlerContext, backlogItem);
            addedBacklogItemPart = mapDbToApiBacklogItemPart(backlogItemPart);

            const { sprintBacklogItem: dbSprintBacklogItem, nextSprint: dbNextSprint } = await addBacklogItemPartToNextSprint(
                handlerContext,
                addedBacklogItemPart.id,
                dbSprint.startdate
            );
            addedSprintBacklogItem = mapDbToApiSprintBacklogItem(dbSprintBacklogItem);

            const apiNextSprint = mapDbToApiSprint(dbNextSprint);
            const nextSprint = mapApiItemToSprint(apiNextSprint);

            const nextSprintStatus = determineSprintStatus(nextSprint.startDate, nextSprint.finishDate);
            const originalBacklogItemEstimate = 0; // adding to sprint, so no original estimate counted in this sprint
            const originalBacklogItemStatus = BacklogItemStatus.None; // same as above, use None to indicate this
            const backlogItemEstimate = backlogItemPart.points;
            const backlogItemStatus = mapApiStatusToBacklogItem(backlogItemPart.status);
            const newSprintStatsResult = buildNewSprintStats(
                buildSprintStatsFromApiSprint(apiNextSprint),
                nextSprintStatus,
                originalBacklogItemEstimate,
                originalBacklogItemStatus,
                backlogItemEstimate,
                backlogItemStatus
            );
            sprintStats = newSprintStatsResult.sprintStats;
            await SprintDataModel.update(
                { ...sprintStats },
                { where: { id: nextSprint.id }, transaction: handlerContext.transactionContext.transaction }
            );

            await updateBacklogItemWithPartCount(handlerContext, backlogItemId, addedBacklogItemPart.partIndex);
        }

        await commitWithCreatedResponseIfNotAborted(handlerContext, addedBacklogItemPart, {
            backlogItem: backlogItemForAddedPart,
            sprintBacklogItem: addedSprintBacklogItem,
            sprintStats
        });
    } catch (err) {
        await handleUnexpectedErrorResponse(handlerContext, err);
    }
    finish(handlerContext);
};
