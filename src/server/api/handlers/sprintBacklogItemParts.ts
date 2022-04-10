// externals
import { Request, Response } from "express";

// libraries
import {
    ApiBacklogItem,
    ApiBacklogItemPart,
    ApiSprintBacklogItem,
    ApiSprintStats,
    hasBacklogItemAtMostBeenDone,
    isoDateStringToDate,
    mapApiItemToBacklogItem
} from "@atoll/shared";

// utils
import { getParamsFromRequest } from "../utils/filterHelper";
import {
    abortWithFailedValidationResponse,
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
    filterAndReturnDbBacklogItemAndSprint,
    updateBacklogItemWithPartCount,
    updateNextSprintStats
} from "./helpers/sprintBacklogItemPartsHelper";
import {
    mapDbToApiBacklogItem,
    mapDbToApiBacklogItemPart,
    mapDbToApiSprint,
    mapDbToApiSprintBacklogItem
} from "../../dataaccess/mappers/dataAccessToApiMappers";
import { fetchSprintBacklogItemPartWithLinks } from "./fetchers/sprintBacklogItemFetcher";
import { isRestApiItemResult } from "../utils/responseBuilder";

export const sprintBacklogItemPartGetHandler = async (req: Request, res: Response) => {
    const params = getParamsFromRequest(req);
    const result = await fetchSprintBacklogItemPartWithLinks(params.sprintId, params.backlogItemPartId);
    if (isRestApiItemResult(result)) {
        res.json(result);
    } else {
        res.status(result.status).json(result);
        console.log(`Unable to fetch sprintBacklogItemPart: ${result.message}`);
    }
};

/**
 * Split a backlog item from current sprint into next sprint (by adding an additional part to it).
 * @param req request containing source sprint ID and backlog item ID
 * @param res bject to return restful response
 */
export const sprintBacklogItemPartsPostHandler = async (req: Request, res: Response) => {
    const handlerContext = start("sprintBacklogItemPartsPostHandler", res);

    const params = getParamsFromRequest(req);
    const backlogItemId = params.backlogItemId;
    const sourceSprintId = params.sprintId;

    try {
        await beginSerializableTransaction(handlerContext);

        const sprintBacklogItemsWithNested = await fetchSprintBacklogItemsWithNested(
            sourceSprintId,
            handlerContext.transactionContext.transaction
        );
        if (!sprintBacklogItemsWithNested.length) {
            abortWithNotFoundResponse(
                handlerContext,
                `Unable to find sprint with ID "${sourceSprintId}" never mind the backlog item with ID ` +
                    `"${backlogItemId}" in that sprint!`
            );
        }

        let addedBacklogItemPart: ApiBacklogItemPart;
        let addedSprintBacklogItem: ApiSprintBacklogItem;
        let apiBacklogItemForAddedPart: ApiBacklogItem;
        let sprintStats: ApiSprintStats;
        if (!hasAborted(handlerContext)) {
            const { dbBacklogItem, dbSprint } = filterAndReturnDbBacklogItemAndSprint(sprintBacklogItemsWithNested, backlogItemId);

            apiBacklogItemForAddedPart = mapDbToApiBacklogItem(dbBacklogItem);
            const backlogItemForAddedPart = mapApiItemToBacklogItem(apiBacklogItemForAddedPart);

            if (!hasBacklogItemAtMostBeenDone(backlogItemForAddedPart.status)) {
                abortWithFailedValidationResponse(
                    handlerContext,
                    `Unable to split backlog item with ID "${backlogItemId}" that's in ` +
                        `a "${apiBacklogItemForAddedPart.status}" status`
                );
            } else {
                const backlogItemPart = await addBacklogItemPart(dbBacklogItem, handlerContext.transactionContext.transaction);

                addedBacklogItemPart = mapDbToApiBacklogItemPart(backlogItemPart);
                const addToNextSprintResult = await addBacklogItemPartToNextSprint(
                    addedBacklogItemPart.backlogitemId,
                    addedBacklogItemPart.id,
                    isoDateStringToDate(dbSprint.startdate),
                    handlerContext.transactionContext.transaction
                );
                const { sprintBacklogItem: dbSprintBacklogItem, nextSprint: dbNextSprint } = addToNextSprintResult;
                addedSprintBacklogItem = mapDbToApiSprintBacklogItem(dbSprintBacklogItem);

                const apiNextSprint = mapDbToApiSprint(dbNextSprint);
                sprintStats = await updateNextSprintStats(
                    apiNextSprint,
                    apiBacklogItemForAddedPart,
                    addedBacklogItemPart,
                    handlerContext.transactionContext.transaction
                );
                const totalParts = addedBacklogItemPart.partIndex;
                await updateBacklogItemWithPartCount(backlogItemId, totalParts, handlerContext.transactionContext.transaction);
                // NOTE: We could make a database call to get the latest data, but it makes no sense here because we already have
                //   the backlog item object- so just update the totalParts and return it because this is more efficient.
                apiBacklogItemForAddedPart.totalParts = totalParts;
            }
        }

        await commitWithCreatedResponseIfNotAborted(handlerContext, addedBacklogItemPart, {
            backlogItem: apiBacklogItemForAddedPart,
            sprintBacklogItem: addedSprintBacklogItem,
            sprintStats
        });
        finish(handlerContext);
    } catch (err) {
        await handleUnexpectedErrorResponse(handlerContext, err);
    }
};
