/**
 * Purpose: To offload individual steps in the sprintBacklogItem handler.
 * Reason to change: Data model / logic changes related to the sprint backlogitem API endpoints.
 */

// externals
import { CreateOptions, Transaction } from "sequelize";

// libraries
import {
    ApiBacklogItemPart,
    ApiBacklogItemWithParts,
    ApiSprintBacklogItem,
    ApiSprintStats,
    BacklogItemStatus,
    mapApiItemToBacklogItem
} from "@atoll/shared";

// data access
import { DB_INCLUDE_ALIAS_SPRINTBACKLOGITEMS } from "../../../dataaccess/models/dataModelConsts";
import { BacklogItemDataModel } from "../../../dataaccess/models/BacklogItemDataModel";
import { BacklogItemPartDataModel } from "../../../dataaccess/models/BacklogItemPartDataModel";
import { ProductBacklogItemDataModel } from "../../../dataaccess/models/ProductBacklogItemDataModel";
import { SprintBacklogItemPartDataModel } from "../../../dataaccess/models/SprintBacklogItemPartDataModel";

// utils
import {
    mapDbSprintBacklogWithNestedToApiBacklogItemInSprint,
    mapDbToApiBacklogItemPart,
    mapDbToApiBacklogItemWithParts,
    mapDbToApiSprintBacklogItem
} from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { handleSprintStatUpdate } from "../updaters/sprintStatUpdater";
import { buildOptionsFromParams, buildOptionsWithTransaction } from "../../utils/sequelizeHelper";
import { addIdToBody } from "../../utils/uuidHelper";
import { buildBacklogItemFindOptionsIncludeForNested, computeUnallocatedPointsUsingDbObjs } from "./backlogItemHelper";

export const fetchSprintBacklogItemsForBacklogItemWithNested = async (
    sprintId: string,
    backlogItemId: string,
    transaction?: Transaction
) => {
    const options = buildOptionsWithTransaction(
        {
            where: { sprintId },
            include: { all: true, nested: true }
        },
        transaction
    );
    const sprintBacklogItems = await SprintBacklogItemPartDataModel.findAll(options);
    const matchingItems = sprintBacklogItems.filter((item) => {
        return (item as any).backlogitempart?.backlogitemId === backlogItemId;
    });
    return matchingItems;
};

export const isItemInProductBacklog = async (backlogItemId: string, transaction?: Transaction) => {
    const options = buildOptionsWithTransaction(
        {
            where: { backlogitemId: backlogItemId },
            include: []
        },
        transaction
    );
    const productBacklogItems = await ProductBacklogItemDataModel.findAll(options);
    const itemInProductBacklog = productBacklogItems.length > 0;
    return itemInProductBacklog;
};

export const removeSprintBacklogItemAndUpdateStats = async (
    sprintId: string,
    sprintBacklogItemWithNested: SprintBacklogItemPartDataModel,
    sprintStats: ApiSprintStats,
    transaction?: Transaction
): Promise<ApiSprintStats> => {
    const backlogitempartId = (sprintBacklogItemWithNested as any).backlogitempartId;
    const apiBacklogItemInSprint = mapDbSprintBacklogWithNestedToApiBacklogItemInSprint(sprintBacklogItemWithNested);
    const backlogItemTyped = mapApiItemToBacklogItem(apiBacklogItemInSprint);
    const options = buildOptionsWithTransaction(
        {
            where: { sprintId, backlogitempartId }
        },
        transaction
    );
    await SprintBacklogItemPartDataModel.destroy(options);
    sprintStats = await handleSprintStatUpdate(
        sprintId,
        backlogItemTyped.status,
        BacklogItemStatus.None,
        backlogItemTyped.estimate,
        apiBacklogItemInSprint.storyEstimate,
        null,
        null,
        transaction
    );
    return sprintStats;
};

export const fetchSprintBacklogItems = async (
    sprintId: string,
    transaction?: Transaction
): Promise<SprintBacklogItemPartDataModel[]> => {
    const baseOptions = buildOptionsFromParams({ sprintId });
    const options = buildOptionsWithTransaction(
        {
            ...baseOptions,
            order: [["displayindex", "ASC"]]
        },
        transaction
    );
    const sprintBacklogs = await SprintBacklogItemPartDataModel.findAll(options);
    return sprintBacklogs;
};

export const determineNextSprintIndex = (sprintBacklogs: SprintBacklogItemPartDataModel[]): number => {
    let displayIndex: number;
    if (sprintBacklogs && sprintBacklogs.length) {
        const lastSprintBacklogItem = mapDbToApiSprintBacklogItem(sprintBacklogs[sprintBacklogs.length - 1]);
        displayIndex = lastSprintBacklogItem.displayindex + 1;
    } else {
        displayIndex = 0;
    }
    return displayIndex;
};

export interface ApiBacklogItemPartWithSprintId extends ApiBacklogItemPart {
    sprintId: string | null;
}

export const fetchAllocatedAndUnallocatedBacklogItemParts = async (
    allBacklogItemParts: ApiBacklogItemPart[],
    transaction?: Transaction
): Promise<ApiBacklogItemPartWithSprintId[]> => {
    const allBacklogItemPartIds = allBacklogItemParts.map((item) => item.id);
    const options = buildOptionsWithTransaction(
        {
            where: { backlogitempartId: allBacklogItemPartIds },
            order: [["displayindex", "ASC"]]
        },
        transaction
    );
    const sprintBacklogItems = await SprintBacklogItemPartDataModel.findAll(options);
    const backlogItemPartsInSprints = sprintBacklogItems.map((item) => mapDbToApiSprintBacklogItem(item));
    let backlogItemPartIdsInSprints: { [backlogItemPartId: string]: ApiSprintBacklogItem } = {};
    backlogItemPartsInSprints.forEach((item) => {
        backlogItemPartIdsInSprints[item.backlogitempartId] = item;
    });
    const result = allBacklogItemParts.map((backlogItemPart) => {
        const sprintInfo = backlogItemPartIdsInSprints[backlogItemPart.id];
        return {
            ...backlogItemPart,
            sprintId: sprintInfo?.sprintId ?? null
        };
    });
    return result;
};

export const fetchAssociatedBacklogItemWithParts = async (
    backlogItemId: string,
    transaction?: Transaction
): Promise<ApiBacklogItemWithParts> => {
    const options = buildOptionsWithTransaction(
        {
            include: buildBacklogItemFindOptionsIncludeForNested()
        },
        transaction
    );
    const dbBacklogItemWithParts = await BacklogItemDataModel.findByPk(backlogItemId, options);
    const backlogItemParts = (dbBacklogItemWithParts as any).dataValues.backlogitemparts as any;
    const backlogItem = mapDbToApiBacklogItemWithParts(dbBacklogItemWithParts);
    backlogItem.unallocatedPoints = computeUnallocatedPointsUsingDbObjs(dbBacklogItemWithParts, backlogItemParts);
    return backlogItem;
};

/**
 * Uses backlogItemId to find a matching backlogItemParts in the specified sprint.
 */
export const fetchSprintBacklogItemsPartByItemId = async (
    sprintId: string,
    backlogItemId: string,
    transaction?: Transaction
): Promise<ApiBacklogItemPart[]> => {
    const options = buildOptionsWithTransaction(
        {
            where: { backlogitemId: backlogItemId },
            include: [
                {
                    model: SprintBacklogItemPartDataModel,
                    as: DB_INCLUDE_ALIAS_SPRINTBACKLOGITEMS,
                    where: { sprintId }
                }
            ]
        },
        transaction
    );
    const dbBacklogItemPartsWithSprintItems = await BacklogItemPartDataModel.findAll(options);
    if (dbBacklogItemPartsWithSprintItems.length === 0) {
        return [];
    } else {
        const backlogItemParts = dbBacklogItemPartsWithSprintItems.map((item) => mapDbToApiBacklogItemPart(item));
        return backlogItemParts;
    }
};

/**
 * Allocates the backlog item to the sprint.
 * @returns Database model sprint backlog object.
 */
export const allocateBacklogItemToSprint = async (
    sprintId: string,
    backlogItemPartId: string,
    displayIndex: number,
    transaction?: Transaction
): Promise<SprintBacklogItemPartDataModel> => {
    const bodyWithId = addIdToBody({
        sprintId,
        backlogitempartId: backlogItemPartId,
        displayindex: displayIndex
    });
    const options: CreateOptions = {};
    if (transaction) {
        options.transaction = transaction;
    }
    const addedSprintBacklog = await SprintBacklogItemPartDataModel.create(bodyWithId, options);
    return addedSprintBacklog;
};
