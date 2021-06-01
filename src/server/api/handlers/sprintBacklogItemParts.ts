// externals
import { Request, Response } from "express";

// libraries
import { ApiBacklogItem, ApiBacklogItemPart, ApiSprintBacklogItem, ApiSprintStats } from "@atoll/shared";

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
    updateBacklogItemWithPartCount,
    updateNextSprintStats
} from "./helpers/sprintBacklogItemPartsHelper";
import {
    mapDbToApiBacklogItem,
    mapDbToApiBacklogItemPart,
    mapDbToApiSprint,
    mapDbToApiSprintBacklogItem
} from "../../dataaccess/mappers/dataAccessToApiMappers";

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
            const { dbBacklogItem, dbSprint } = getBacklogItemAndSprint(sprintBacklogItemsWithNested, backlogItemId);

            backlogItemForAddedPart = mapDbToApiBacklogItem(dbBacklogItem);
            const backlogItemPart = await addBacklogItemPart(handlerContext, dbBacklogItem);

            addedBacklogItemPart = mapDbToApiBacklogItemPart(backlogItemPart);
            const addToNextSprintResult = await addBacklogItemPartToNextSprint(
                handlerContext,
                addedBacklogItemPart.id,
                dbSprint.startdate
            );
            const { sprintBacklogItem: dbSprintBacklogItem, nextSprint: dbNextSprint } = addToNextSprintResult;
            addedSprintBacklogItem = mapDbToApiSprintBacklogItem(dbSprintBacklogItem);

            const apiNextSprint = mapDbToApiSprint(dbNextSprint);
            sprintStats = await updateNextSprintStats(handlerContext, apiNextSprint, addedBacklogItemPart);

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
