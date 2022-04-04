/**
 * Purpose: To offload individual steps in the sprintBacklogItemParts handler.
 * Reason to change: Data model / logic changes related to the sprint backlogitem parts API endpoints.
 */

// externals
import { CreateOptions, FindOptions, Transaction } from "sequelize";

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
import { SprintBacklogItemPartDataModel } from "../../../dataaccess/models/SprintBacklogItemPartDataModel";
import { SprintDataModel } from "../../../dataaccess/models/SprintDataModel";

// utils
import { buildOptionsFromParams, buildOptionsWithTransaction } from "../../utils/sequelizeHelper";
import { mapApiToDbBacklogItemPart } from "../../../dataaccess/mappers/apiToDataAccessMappers";
import { addIdToBody, getSimpleUuid } from "../../utils/uuidHelper";
import { buildNewSprintStats, buildSprintStatsFromApiSprint } from "./sprintStatsHelper";
import { fetchSprintBacklogItemsPartByItemId } from "./sprintBacklogItemHelper";
import { fetchNextSprint } from "../fetchers/sprintFetcher";

export const fetchSprintBacklogItemsWithNested = async (sprintId: string, transaction?: Transaction) => {
    const baseOptions: FindOptions = { ...buildOptionsFromParams({ sprintId }), include: { all: true, nested: true } };
    const options = buildOptionsWithTransaction(
        {
            ...baseOptions,
            order: [["displayindex", "ASC"]]
        },
        transaction
    );
    const sprintBacklogItems = await SprintBacklogItemPartDataModel.findAll(options);
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

export const fetchBacklogItemPartsMaxPartIndex = async (backlogItemId: string, transaction?: Transaction): Promise<number> => {
    const options = buildOptionsWithTransaction(
        {
            where: { backlogitemId: backlogItemId }
        },
        transaction
    );
    const allBacklogItemParts = await BacklogItemPartDataModel.findAll(options);
    let maxPartIndex: number = 0;
    allBacklogItemParts.forEach((item) => {
        if (item.partIndex > maxPartIndex) {
            maxPartIndex = item.partIndex;
        }
    });
    return maxPartIndex;
};

export const addBacklogItemPart = async (
    backlogItem: BacklogItemDataModel,
    transaction?: Transaction
): Promise<BacklogItemPartDataModel> => {
    const maxPartIndex = await fetchBacklogItemPartsMaxPartIndex(backlogItem.id, transaction);
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
    const options: CreateOptions = {};
    if (transaction) {
        options.transaction = transaction;
    }
    const addedBacklogItemPart = await BacklogItemPartDataModel.create(newBacklogItemPart, options);
    return addedBacklogItemPart;
};

export interface AddBacklogItemPartToNextSprintResult {
    sprintBacklogItem: SprintBacklogItemPartDataModel;
    nextSprint: SprintDataModel;
}

export const addBacklogItemPartToNextSprint = async (
    backlogitemId: string,
    backlogitempartId: string,
    currentSprintStartDate: Date,
    transaction?: Transaction
): Promise<AddBacklogItemPartToNextSprintResult> => {
    const nextSprint = await fetchNextSprint(currentSprintStartDate, transaction);
    const nextSprintId = nextSprint.id;
    const backlogItemParts = await fetchSprintBacklogItemsPartByItemId(nextSprintId, backlogitemId, transaction);
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
    const createOptions: CreateOptions = {};
    if (transaction) {
        createOptions.transaction = transaction;
    }
    const addedSprintBacklogItem = await SprintBacklogItemPartDataModel.create(newSprintBacklogItem, createOptions);
    return {
        sprintBacklogItem: addedSprintBacklogItem,
        nextSprint
    };
};

export const updateNextSprintStats = async (
    apiNextSprint: ApiSprint,
    backlogItem: ApiBacklogItem,
    backlogItemPart: ApiBacklogItemPart,
    transaction?: Transaction
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
    const options = buildOptionsWithTransaction(
        {
            where: {
                id: nextSprint.id
            }
        },
        transaction
    );
    await SprintDataModel.update(
        {
            ...sprintStats
        },
        options
    );
    return sprintStats;
};

export const updateBacklogItemWithPartCount = async (
    backlogItemId: string,
    newTotalPartCount: number,
    transaction?: Transaction
) => {
    const options = buildOptionsWithTransaction(
        {
            where: {
                id: backlogItemId
            }
        },
        transaction
    );
    await BacklogItemDataModel.update(
        {
            totalParts: newTotalPartCount
        },
        options
    );
};
