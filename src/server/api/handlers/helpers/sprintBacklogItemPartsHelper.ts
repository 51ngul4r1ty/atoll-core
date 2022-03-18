/**
 * Purpose: To offload individual steps in the sprintBacklogItemParts handler.
 * Reason to change: Data model / logic changes related to the sprint backlogitem parts API endpoints.
 */

// externals
import { FindOptions } from "sequelize";

// libraries
import {
    ApiBacklogItem,
    ApiBacklogItemPart,
    ApiSprint,
    ApiSprintStats,
    BacklogItemStatus,
    determineSprintStatus,
    mapApiItemToSprint,
    mapApiStatusToBacklogItem
} from "@atoll/shared";

// data access
import { BacklogItemPartDataModel } from "../../../dataaccess/models/BacklogItemPartDataModel";
import { BacklogItemDataModel } from "../../../dataaccess/models/BacklogItemDataModel";
import { SprintBacklogItemDataModel } from "../../../dataaccess/models/SprintBacklogItemModel";
import { SprintDataModel } from "../../../dataaccess/models/SprintDataModel";

// interfaces/types
import { HandlerContext } from "../utils/handlerContext";

// utils
import { buildOptionsFromParams } from "../../utils/sequelizeHelper";
import { mapApiToDbBacklogItemPart } from "../../../dataaccess/mappers/apiToDataAccessMappers";
import { addIdToBody, getSimpleUuid } from "../../utils/uuidHelper";
import { buildNewSprintStats, buildSprintStatsFromApiSprint } from "./sprintStatsHelper";
import { fetchSprintBacklogItemsPartByItemId } from "./sprintBacklogItemHelper";
import { fetchNextSprint } from "../fetchers/sprintFetcher";

export const fetchSprintBacklogItemsWithNested = async (handlerContext: HandlerContext, sprintId: string) => {
    const options: FindOptions = { ...buildOptionsFromParams({ sprintId }), include: { all: true, nested: true } };
    const sprintBacklogItems = await SprintBacklogItemDataModel.findAll({
        ...options,
        order: [["displayindex", "ASC"]],
        transaction: handlerContext.transactionContext.transaction
    });
    return sprintBacklogItems;
};

export interface GetBacklogItemAndSprintResult {
    dbBacklogItem: BacklogItemDataModel;
    dbSprint: SprintDataModel;
}

/**
 * Finds Backlog Item in DB Sprint Backlog Items list.
 * @returns dbBacklogItem and dbSprint
 */
export const filterAndReturnDbBacklogItemAndSprint = (
    sprintBacklogItemsWithNested,
    backlogItemId: string
): GetBacklogItemAndSprintResult => {
    const matchingItemsWithNested = sprintBacklogItemsWithNested.filter((sprintBacklogItem) => {
        const backlogItemPart = (sprintBacklogItem as any).backlogitempart;
        if (backlogItemPart) {
            const backlogItem = backlogItemPart.backlogitem;
            return backlogItem.id === backlogItemId;
        }
        return false;
    });
    const sprintBacklogItemWithNested = matchingItemsWithNested[0];
    const backlogItemPart: BacklogItemPartDataModel = (sprintBacklogItemWithNested as any).backlogitempart;
    const dbBacklogItem = (backlogItemPart as any).backlogitem as BacklogItemDataModel;
    const dbSprint = (sprintBacklogItemWithNested as any).sprint as SprintDataModel;
    return { dbBacklogItem, dbSprint };
};

export const fetchBacklogItemPartsMaxPartIndex = async (backlogItemId: string, handlerContext: HandlerContext): Promise<number> => {
    const allBacklogItemParts = await BacklogItemPartDataModel.findAll({
        where: { backlogitemId: backlogItemId },
        transaction: handlerContext.transactionContext.transaction
    });
    let maxPartIndex: number = 0;
    allBacklogItemParts.forEach((item) => {
        if (item.partIndex > maxPartIndex) {
            maxPartIndex = item.partIndex;
        }
    });
    return maxPartIndex;
};

export const addBacklogItemPart = async (
    handlerContext: HandlerContext,
    backlogItem: BacklogItemDataModel
): Promise<BacklogItemPartDataModel> => {
    const maxPartIndex = await fetchBacklogItemPartsMaxPartIndex(backlogItem.id, handlerContext);
    const percentage = 20; // Apply the default rule that there's often 20% of the work remaining (unless estimate was off)
    const newApiBacklogItemPart: ApiBacklogItemPart = {
        id: null,
        externalId: null,
        backlogitemId: backlogItem.id,
        partIndex: maxPartIndex + 1,
        percentage,
        points: Math.ceil(backlogItem.estimate * (percentage / 100)),
        startedAt: null,
        finishedAt: null,
        status: "N" /* this part has not been started yet */
    };
    const newBacklogItemPart = mapApiToDbBacklogItemPart({ ...addIdToBody(newApiBacklogItemPart), version: 0 });
    const addedBacklogItemPart = await BacklogItemPartDataModel.create(newBacklogItemPart, {
        transaction: handlerContext.transactionContext.transaction
    });
    return addedBacklogItemPart;
};

export interface AddBacklogItemPartToNextSprintResult {
    sprintBacklogItem: SprintBacklogItemDataModel;
    nextSprint: SprintDataModel;
}

export const addBacklogItemPartToNextSprint = async (
    handlerContext: HandlerContext,
    backlogitemId: string,
    backlogitempartId: string,
    currentSprintStartDate: Date
): Promise<AddBacklogItemPartToNextSprintResult> => {
    const nextSprint = await fetchNextSprint(handlerContext, currentSprintStartDate);
    const nextSprintId = nextSprint.id;
    const backlogItemParts = await fetchSprintBacklogItemsPartByItemId(handlerContext, nextSprintId, backlogitemId);
    if (backlogItemParts.length > 0) {
        throw new Error(
            `Unable to add backlog item part to next sprint because parts already exist ` +
                `for the same backlog item ID ${backlogitemId}`
        );
    }
    const newSprintBacklogItem = {
        id: getSimpleUuid(),
        sprintId: nextSprintId,
        backlogitempartId: backlogitempartId
    };
    const addedSprintBacklogItem = await SprintBacklogItemDataModel.create(newSprintBacklogItem, {
        transaction: handlerContext.transactionContext.transaction
    });
    return {
        sprintBacklogItem: addedSprintBacklogItem,
        nextSprint
    };
};

export const updateNextSprintStats = async (
    handlerContext: HandlerContext,
    apiNextSprint: ApiSprint,
    backlogItem: ApiBacklogItem,
    backlogItemPart: ApiBacklogItemPart
): Promise<ApiSprintStats> => {
    const nextSprint = mapApiItemToSprint(apiNextSprint);

    const nextSprintStatus = determineSprintStatus(nextSprint.startDate, nextSprint.finishDate);
    const originalBacklogItemPartEstimate = null; // adding to sprint, so no original estimate counted in this sprint for part
    const originalBacklogItemEstimate = null; // adding to sprint, so no original estimate counted in this sprint for story
    const originalBacklogItemStatus = BacklogItemStatus.None; // same as above, use None to indicate this
    const backlogItemPartEstimate = backlogItemPart.points;
    const backlogItemEstimate = backlogItem.estimate;
    const backlogItemStatus = mapApiStatusToBacklogItem(backlogItemPart.status);
    const newSprintStatsResult = buildNewSprintStats(
        buildSprintStatsFromApiSprint(apiNextSprint),
        nextSprintStatus,
        originalBacklogItemPartEstimate,
        originalBacklogItemEstimate,
        originalBacklogItemStatus,
        backlogItemPartEstimate,
        backlogItemEstimate,
        backlogItemStatus
    );
    const sprintStats = newSprintStatsResult.sprintStats;
    await SprintDataModel.update(
        {
            ...sprintStats
        },
        {
            where: {
                id: nextSprint.id
            },
            transaction: handlerContext.transactionContext.transaction
        }
    );
    return sprintStats;
};

export const updateBacklogItemWithPartCount = async (
    handlerContext: HandlerContext,
    backlogItemId: string,
    newTotalPartCount: number
) => {
    await BacklogItemDataModel.update(
        {
            totalParts: newTotalPartCount
        },
        {
            where: {
                id: backlogItemId
            },
            transaction: handlerContext.transactionContext.transaction
        }
    );
};
