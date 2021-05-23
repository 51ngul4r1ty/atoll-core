// externals
import { Request, Response } from "express";

// data access
import { SprintBacklogItemDataModel } from "../../dataaccess/models/SprintBacklogItem";
import { BacklogItemPartDataModel } from "../../dataaccess/models/BacklogItemPart";

// utils
import { getParamsFromRequest } from "../utils/filterHelper";
import {
    abortWithNotFoundResponse,
    beginSerializableTransaction,
    commitWithCreatedResponse,
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

export const sprintBacklogItemPartsPostHandler = async (req: Request, res: Response) => {
    const handlerContext = start("sprintBacklogItemPartsPostHandler", res);
    const params = getParamsFromRequest(req);
    const backlogItemId = params.backlogItemId;
    const sprintId = params.sprintId;
    try {
        await beginSerializableTransaction(handlerContext);
        const sprintBacklogItemsWithNested = await fetchSprintBacklogItemsWithNested(sprintId, handlerContext);
        if (!sprintBacklogItemsWithNested.length) {
            abortWithNotFoundResponse(
                handlerContext,
                `Unable to find sprint with ID "${sprintId}" never mind the backlog item with ID "${backlogItemId}" in that sprint!`
            );
        }
        let addedBacklogItemPart: BacklogItemPartDataModel;
        let addedSprintBacklogItem: SprintBacklogItemDataModel;
        if (!hasAborted(handlerContext)) {
            const { backlogItem, sprint } = getBacklogItemAndSprint(sprintBacklogItemsWithNested, backlogItemId);
            addedBacklogItemPart = await addBacklogItemPart(handlerContext, backlogItem);
            addedSprintBacklogItem = await addBacklogItemPartToNextSprint(
                handlerContext,
                addedBacklogItemPart.id,
                sprint.startdate
            );
            await updateBacklogItemWithPartCount(handlerContext, backlogItemId, addedBacklogItemPart.partindex);
        }
        await commitWithCreatedResponse(handlerContext, {
            backlogItemPart: addedBacklogItemPart,
            sprintBacklogItem: addedSprintBacklogItem
        });
    } catch (err) {
        await handleUnexpectedErrorResponse(handlerContext, err);
    }
    finish(handlerContext);
};
