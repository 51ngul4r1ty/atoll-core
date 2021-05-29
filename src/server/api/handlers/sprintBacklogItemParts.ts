// externals
import { Request, Response } from "express";

// libraries
import { ApiBacklogItem, ApiBacklogItemPart, ApiSprintBacklogItem } from "@atoll/shared";

// data access
import { SprintBacklogItemDataModel } from "../../dataaccess/models/SprintBacklogItem";
import { BacklogItemPartDataModel } from "../../dataaccess/models/BacklogItemPart";

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
        if (!hasAborted(handlerContext)) {
            const { backlogItem, sprint } = getBacklogItemAndSprint(sprintBacklogItemsWithNested, backlogItemId);
            backlogItemForAddedPart = mapDbToApiBacklogItem(backlogItem);
            const backlogItemPart = await addBacklogItemPart(handlerContext, backlogItem);
            addedBacklogItemPart = mapDbToApiBacklogItemPart(backlogItemPart);

            const sprintBacklogItem = await addBacklogItemPartToNextSprint(
                handlerContext,
                addedBacklogItemPart.id,
                sprint.startdate
            );
            addedSprintBacklogItem = mapDbToApiSprintBacklogItem(sprintBacklogItem);

            await updateBacklogItemWithPartCount(handlerContext, backlogItemId, addedBacklogItemPart.partIndex);
        }

        await commitWithCreatedResponseIfNotAborted(handlerContext, addedBacklogItemPart, {
            backlogItem: backlogItemForAddedPart,
            sprintBacklogItem: addedSprintBacklogItem
        });
    } catch (err) {
        await handleUnexpectedErrorResponse(handlerContext, err);
    }
    finish(handlerContext);
};
