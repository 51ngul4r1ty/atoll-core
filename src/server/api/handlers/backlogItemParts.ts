// externals
import { Request, Response } from "express";
import { Transaction } from "sequelize";

// libraries
import { ApiBacklogItem, ApiBacklogItemPart, ApiSprintStats, mapApiItemToBacklogItemPart } from "@atoll/shared";

// data access
import { BacklogItemDataModel } from "../../dataaccess/models/BacklogItemDataModel";
import { BacklogItemPartDataModel } from "../../dataaccess/models/BacklogItemPartDataModel";

// utils
import { buildResponseWithItem } from "../utils/responseBuilder";
import { getInvalidPatchMessage, getPatchedItem } from "../utils/patcher";
import { getUpdatedBacklogItemPartWhenStatusChanges, getUpdatedBacklogItemWhenStatusChanges } from "../utils/statusChangeUtils";
import { getIdForSprintContainingBacklogItemPart } from "./fetchers/sprintFetcher";
import { handleSprintStatUpdate } from "./updaters/sprintStatUpdater";
import { mapDbToApiBacklogItem, mapDbToApiBacklogItemPart } from "../../dataaccess/mappers/dataAccessToApiMappers";
import { respondWithFailedValidation, respondWithObj } from "../utils/responder";
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
                        handlerContext.transactionContext.transaction
                    );
                }
            }
        }
    } catch (err) {
        await handleUnexpectedErrorResponse(handlerContext, err);
    }
    finish(handlerContext);
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
    let result: ApiBacklogItem;
    if (reqBody.status) {
        newDataItem = getPatchedItem(originalApiBacklogItem, { status: reqBody.status });
        const updateBacklogItemResult = getUpdatedBacklogItemWhenStatusChanges(originalApiBacklogItem, newDataItem);
        newDataItem = updateBacklogItemResult.changed ? updateBacklogItemResult.backlogItem : newDataItem;
        await dbBacklogItem.update(newDataItem, {
            transaction: handlerContext.transactionContext.transaction
        });
        result = mapDbToApiBacklogItem(dbBacklogItem);
    }
    return result;
};

const handleResponseWithUpdatedStatsAndCommit = async (
    newApiBacklogItemPart: ApiBacklogItemPart,
    originalApiBacklogItemPart: ApiBacklogItemPart,
    newApiBacklogItem: ApiBacklogItem,
    originalApiBacklogItem: ApiBacklogItem,
    res: Response,
    transaction: Transaction
): Promise<void> => {
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
        transaction = null;
    }
    const extra = sprintStats ? { sprintStats, backlogItem: newApiBacklogItem } : { backlogItem: newApiBacklogItem };
    const meta = originalBacklogItemPart ? { original: originalBacklogItemPart } : undefined;
    respondWithObj(res, buildResponseWithItem(newApiBacklogItemPart, extra, meta));
};
