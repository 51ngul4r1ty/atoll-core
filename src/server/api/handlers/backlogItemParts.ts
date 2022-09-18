// externals
import { Request, Response } from "express";
import { Transaction } from "sequelize";
import * as core from "express-serve-static-core";

// libraries
import { ApiBacklogItem, ApiBacklogItemPart, ApiSprintStats, mapApiItemToBacklogItemPart } from "@atoll/shared";

// data access
import { BacklogItemDataModel } from "../../dataaccess/models/BacklogItemDataModel";
import { BacklogItemPartDataModel } from "../../dataaccess/models/BacklogItemPartDataModel";

// utils
import { buildResponseWithItem, isRestApiItemResult } from "../utils/responseBuilder";
import { getInvalidPatchMessage, getPatchedItem } from "../utils/patcher";
import { getUpdatedBacklogItemPartWhenStatusChanges, getUpdatedBacklogItemWhenStatusChanges } from "../utils/statusChangeUtils";
import { getIdForSprintContainingBacklogItemPart } from "./fetchers/sprintFetcher";
import { handleSprintStatUpdate } from "./updaters/sprintStatUpdater";
import { mapDbToApiBacklogItem, mapDbToApiBacklogItemPart } from "../../dataaccess/mappers/dataAccessToApiMappers";
import { respondWithError, respondWithFailedValidation, respondWithObj } from "../utils/responder";
import { respondedWithMismatchedItemIds } from "../utils/validationResponders";
import {
    abortWithErrorResponse,
    abortWithNotFoundResponse,
    beginSerializableTransaction,
    finish,
    HandlerContext,
    handleUnexpectedErrorResponse,
    hasAborted,
    start
} from "./utils/handlerContext";
import { logError } from "./utils/serverLogger";
import { fetchBacklogItemPart } from "./fetchers/backlogItemPartFetcher";

export interface BacklogItemPartGetParams extends core.ParamsDictionary {
    itemId: string;
}

export const backlogItemPartGetHandler = async (req: Request<BacklogItemPartGetParams>, res: Response) => {
    try {
        const id = req.params.itemId;
        const itemOrErrorResult = await fetchBacklogItemPart(id);
        if (isRestApiItemResult(itemOrErrorResult)) {
            respondWithObj(res, itemOrErrorResult);
        } else {
            respondWithObj(res, itemOrErrorResult);
            logError(`backlogItemGetHandler: ${itemOrErrorResult.message} (error)`);
        }
    } catch (error) {
        respondWithError(res, error, "Unable to fetch backlog item part");
    }
};

export const backlogItemPartPatchHandler = async (req: Request, res: Response) => {
    const handlerContext = start("backlogItemPartPatchHandler", res);

    const queryParamItemId = req.params.itemId;

    if (!queryParamItemId) {
        respondWithFailedValidation(res, "Item ID is required in URI path for this operation");
        return;
    }

    const bodyItemId = req.body.id;
    if (respondedWithMismatchedItemIds(res, queryParamItemId, bodyItemId)) {
        return;
    }

    if (req.body.points !== undefined && req.body.percentage === undefined) {
        respondWithFailedValidation(res, 'If "points" field is provided, "percentage" must also be provided.');
    } else if (req.body.points === undefined && req.body.percentage !== undefined) {
        respondWithFailedValidation(res, 'If "percentage" field is provided, "points" must also be provided.');
    }

    try {
        await beginSerializableTransaction(handlerContext);
        const dbBacklogItemPart = await BacklogItemPartDataModel.findOne({
            where: { id: queryParamItemId },
            transaction: handlerContext.transactionContext.transaction
        });
        if (!dbBacklogItemPart) {
            abortWithNotFoundResponse(handlerContext, `Unable to find backlogitempart to patch with ID ${queryParamItemId}`);
        }
        if (!hasAborted(handlerContext)) {
            const backlogItemId = dbBacklogItemPart.backlogitemId;
            const dbBacklogItem = await BacklogItemDataModel.findOne({
                where: { id: backlogItemId },
                transaction: handlerContext.transactionContext.transaction
            });
            if (!dbBacklogItem) {
                abortWithErrorResponse(
                    handlerContext,
                    `Unable to find backlogitem with ID ${backlogItemId}, ` +
                        `needed to patch backlogitempart with ID ${queryParamItemId}`
                );
            }
            const originalApiBacklogItem = mapDbToApiBacklogItem(dbBacklogItem);

            if (!hasAborted(handlerContext)) {
                const originalApiBacklogItemPart = mapDbToApiBacklogItemPart(dbBacklogItemPart);
                const invalidPatchMessage = getInvalidPatchMessage(originalApiBacklogItemPart, req.body);
                if (invalidPatchMessage) {
                    respondWithFailedValidation(res, `Unable to patch: ${invalidPatchMessage}`);
                } else {
                    const newDataItemPart = await patchBacklogItemPart(
                        handlerContext,
                        req.body,
                        originalApiBacklogItemPart,
                        dbBacklogItemPart
                    );

                    const newDataItem = await patchBacklogItem(handlerContext, req.body, originalApiBacklogItem, dbBacklogItem);

                    await handleResponseWithUpdatedStatsAndCommit(
                        newDataItemPart,
                        originalApiBacklogItemPart,
                        newDataItem,
                        originalApiBacklogItem,
                        res,
                        handlerContext
                    );
                }
            }
        }
        finish(handlerContext);
    } catch (err) {
        await handleUnexpectedErrorResponse(handlerContext, err);
    }
};

const patchBacklogItemPart = async (
    handlerContext: HandlerContext,
    reqBody: any,
    originalApiBacklogItemPart: ApiBacklogItemPart,
    dbBacklogItemPart: BacklogItemPartDataModel
) => {
    let newDataItemPart = getPatchedItem(originalApiBacklogItemPart, reqBody);
    const updateBacklogItemPartResult = getUpdatedBacklogItemPartWhenStatusChanges(originalApiBacklogItemPart, newDataItemPart);
    newDataItemPart = updateBacklogItemPartResult.changed ? updateBacklogItemPartResult.backlogItemPart : newDataItemPart;
    await dbBacklogItemPart.update(newDataItemPart, { transaction: handlerContext.transactionContext.transaction });
    return mapDbToApiBacklogItemPart(dbBacklogItemPart);
};

const patchBacklogItem = async (
    handlerContext: HandlerContext,
    reqBody: any,
    originalApiBacklogItem: ApiBacklogItem,
    dbBacklogItem: BacklogItemDataModel
) => {
    let newDataItem: ApiBacklogItem;
    if (reqBody.status) {
        newDataItem = getPatchedItem(originalApiBacklogItem, { status: reqBody.status });
        const updateBacklogItemResult = getUpdatedBacklogItemWhenStatusChanges(originalApiBacklogItem, newDataItem);
        newDataItem = updateBacklogItemResult.changed ? updateBacklogItemResult.backlogItem : newDataItem;
        await dbBacklogItem.update(newDataItem, {
            transaction: handlerContext.transactionContext.transaction
        });
        return mapDbToApiBacklogItem(dbBacklogItem);
    }
    return originalApiBacklogItem;
};

const handleResponseWithUpdatedStatsAndCommit = async (
    newApiBacklogItemPart: ApiBacklogItemPart,
    originalApiBacklogItemPart: ApiBacklogItemPart,
    newApiBacklogItem: ApiBacklogItem,
    originalApiBacklogItem: ApiBacklogItem,
    res: Response,
    handlerContext: HandlerContext
): Promise<void> => {
    const transaction = handlerContext.transactionContext.transaction;
    let sprintStats: ApiSprintStats;
    const newBacklogItemPart = mapApiItemToBacklogItemPart(newApiBacklogItemPart);
    const originalBacklogItemPart = mapApiItemToBacklogItemPart(originalApiBacklogItemPart);
    if (
        originalBacklogItemPart.points !== newBacklogItemPart.points ||
        originalBacklogItemPart.status !== newBacklogItemPart.status
    ) {
        const sprintId = await getIdForSprintContainingBacklogItemPart(originalBacklogItemPart.id, transaction);
        const originalBacklogItemEstimate = originalApiBacklogItem.estimate;
        const backlogItemEstimate = originalApiBacklogItem.estimate;
        sprintStats = await handleSprintStatUpdate(
            sprintId,
            originalBacklogItemPart.status,
            newBacklogItemPart.status,
            originalBacklogItemPart.points,
            originalBacklogItemEstimate,
            newBacklogItemPart.points,
            backlogItemEstimate,
            transaction
        );
    }
    if (transaction) {
        await transaction.commit();
        handlerContext.transactionContext.transaction = null;
    }
    const extra = sprintStats ? { sprintStats, backlogItem: newApiBacklogItem } : { backlogItem: newApiBacklogItem };
    const meta = originalBacklogItemPart ? { original: originalBacklogItemPart } : undefined;
    respondWithObj(res, buildResponseWithItem(newApiBacklogItemPart, extra, meta));
};
