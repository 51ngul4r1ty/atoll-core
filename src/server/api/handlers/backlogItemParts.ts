// externals
import { Request, Response } from "express";
import { Transaction } from "sequelize";

// libraries
import { ApiBacklogItem, ApiBacklogItemPart, ApiSprintStats, mapApiItemToBacklogItemPart } from "@atoll/shared";

// data access
import { BacklogItemPartDataModel } from "dataaccess/models/BacklogItemPart";

// utils
import { respondWithFailedValidation, respondWithItem } from "../utils/responder";
import { respondedWithMismatchedItemIds } from "../utils/validationResponders";
import {
    abortWithErrorResponse,
    abortWithNotFoundResponse,
    beginSerializableTransaction,
    finish,
    handleUnexpectedErrorResponse,
    hasAborted,
    start
} from "./utils/handlerContext";
import { mapDbToApiBacklogItem, mapDbToApiBacklogItemPart } from "dataaccess/mappers/dataAccessToApiMappers";
import { getInvalidPatchMessage, getPatchedItem } from "../utils/patcher";
import { getUpdatedBacklogItemPartWhenStatusChanges } from "../utils/statusChangeUtils";
import { getIdForSprintContainingBacklogItemPart } from "./fetchers/sprintFetcher";
import { handleSprintStatUpdate } from "./updaters/sprintStatUpdater";
import { BacklogItemDataModel } from "dataaccess/models/BacklogItem";

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
            const apiBacklogItem = mapDbToApiBacklogItem(dbBacklogItem);

            if (!hasAborted(handlerContext)) {
                const originalApiBacklogItemPart = mapDbToApiBacklogItemPart(dbBacklogItemPart);
                const invalidPatchMessage = getInvalidPatchMessage(originalApiBacklogItemPart, req.body);
                if (invalidPatchMessage) {
                    respondWithFailedValidation(res, `Unable to patch: ${invalidPatchMessage}`);
                } else {
                    let newDataItem = getPatchedItem(originalApiBacklogItemPart, req.body);
                    newDataItem = getUpdatedBacklogItemPartWhenStatusChanges(originalApiBacklogItemPart, newDataItem);
                    await dbBacklogItemPart.update(newDataItem, { transaction: handlerContext.transactionContext.transaction });

                    await handleResponseWithUpdatedStatsAndCommit(
                        newDataItem,
                        originalApiBacklogItemPart,
                        dbBacklogItemPart,
                        apiBacklogItem,
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

const handleResponseWithUpdatedStatsAndCommit = async (
    newApiBacklogItemPart: ApiBacklogItemPart,
    originalApiBacklogItemPart: ApiBacklogItemPart,
    dbBacklogItemPart: BacklogItemPartDataModel,
    apiBacklogItem: ApiBacklogItem,
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
        const originalBacklogItemEstimate = apiBacklogItem.estimate;
        const backlogItemEstimate = apiBacklogItem.estimate;
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
    respondWithItem(res, dbBacklogItemPart, originalBacklogItemPart, sprintStats ? { sprintStats } : undefined);
};
