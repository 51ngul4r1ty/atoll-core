/**
 * Purpose: To offload individual steps in the sprintBacklogItem handler.
 * Reason to change: Data model / logic changes related to the sprint backlogitem API endpoints.
 */

// externals
import { CreateOptions, FindOptions } from "sequelize";

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
import { BacklogItemDataModel } from "../../../dataaccess/models/BacklogItemDataModel";
import { BacklogItemPartDataModel } from "../../../dataaccess/models/BacklogItemPartDataModel";
import { BacklogItemRankDataModel } from "../../../dataaccess/models/BacklogItemRankDataModel";
import { SprintBacklogItemDataModel } from "../../../dataaccess/models/SprintBacklogItem";

// interfaces/types
import { HandlerContext } from "../utils/handlerContext";

// utils
import {
    mapDbSprintBacklogWithNestedToApiBacklogItemInSprint,
    mapDbToApiBacklogItemPart,
    mapDbToApiBacklogItemWithParts,
    mapDbToApiSprintBacklogItem
} from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { handleSprintStatUpdate } from "../updaters/sprintStatUpdater";
import { buildOptionsFromParams } from "../../utils/sequelizeHelper";
import { addIdToBody } from "../../utils/uuidHelper";
import { buildBacklogItemFindOptionsIncludeForNested, computeUnallocatedPointsUsingDbObjs } from "./backlogItemHelper";

export const fetchSprintBacklogItemsForBacklogItemWithNested = async (
    handlerContext: HandlerContext,
    sprintId: string,
    backlogItemId: string
) => {
    const sprintBacklogItems = await SprintBacklogItemDataModel.findAll({
        where: { sprintId },
        include: { all: true, nested: true },
        transaction: handlerContext.transactionContext.transaction
    });
    const matchingItems = sprintBacklogItems.filter((item) => {
        return (item as any).backlogitempart?.backlogitemId === backlogItemId;
    });
    return matchingItems;
};

export const isItemInProductBacklog = async (handlerContext: HandlerContext, backlogItemId: string) => {
    const productBacklogItems = await BacklogItemRankDataModel.findAll({
        where: { backlogitemId: backlogItemId },
        include: [],
        transaction: handlerContext.transactionContext.transaction
    });
    const itemInProductBacklog = productBacklogItems.length > 0;
    return itemInProductBacklog;
};

export const removeSprintBacklogItemAndUpdateStats = async (
    handlerContext: HandlerContext,
    sprintId: string,
    sprintBacklogItemWithNested: SprintBacklogItemDataModel,
    sprintStats: ApiSprintStats
): Promise<ApiSprintStats> => {
    const backlogitempartId = (sprintBacklogItemWithNested as any).backlogitempartId;
    const apiBacklogItemInSprint = mapDbSprintBacklogWithNestedToApiBacklogItemInSprint(sprintBacklogItemWithNested);
    const backlogItemTyped = mapApiItemToBacklogItem(apiBacklogItemInSprint);
    await SprintBacklogItemDataModel.destroy({
        where: { sprintId, backlogitempartId },
        transaction: handlerContext.transactionContext.transaction
    });
    sprintStats = await handleSprintStatUpdate(
        sprintId,
        backlogItemTyped.status,
        BacklogItemStatus.None,
        backlogItemTyped.estimate,
        apiBacklogItemInSprint.storyEstimate,
        null,
        null,
        handlerContext.transactionContext.transaction
    );
    return sprintStats;
};

export const fetchSprintBacklogItems = async (
    handlerContext: HandlerContext,
    sprintId: string
): Promise<SprintBacklogItemDataModel[]> => {
    const options = buildOptionsFromParams({ sprintId });
    const sprintBacklogs = await SprintBacklogItemDataModel.findAll({
        ...options,
        order: [["displayindex", "ASC"]],
        transaction: handlerContext.transactionContext.transaction
    });
    return sprintBacklogs;
};

export const determineNextSprintIndex = (sprintBacklogs: SprintBacklogItemDataModel[]): number => {
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
    handlerContext: HandlerContext,
    allBacklogItemParts: ApiBacklogItemPart[]
): Promise<ApiBacklogItemPartWithSprintId[]> => {
    const allBacklogItemPartIds = allBacklogItemParts.map((item) => item.id);
    const options: FindOptions = {
        where: { backlogitempartId: allBacklogItemPartIds },
        order: [["displayindex", "ASC"]],
        transaction: handlerContext.transactionContext.transaction
    };
    const sprintBacklogItems = await SprintBacklogItemDataModel.findAll(options);
    const backlogItemPartsInSprints = sprintBacklogItems.map((item) => mapDbToApiSprintBacklogItem(item));
    let backlogItemPartIdsInSprints: { [backlogItemPartId: string]: ApiSprintBacklogItem } = {};
    backlogItemPartsInSprints.forEach((item) => {
        backlogItemPartIdsInSprints[item.backlogitempartId] = item;
    });
    const result = allBacklogItemParts.map((backlogItemPart) => {
        const sprintInfo = backlogItemPartIdsInSprints[backlogItemPart.id];
        return {
            ...backlogItemPart,
            sprintId: sprintInfo?.sprintId || null
        };
    });
    return result;
};

export const fetchAssociatedBacklogItemWithParts = async (
    handlerContext: HandlerContext,
    backlogItemId: string
): Promise<ApiBacklogItemWithParts> => {
    const dbBacklogItemWithParts = await BacklogItemDataModel.findByPk(backlogItemId, {
        include: buildBacklogItemFindOptionsIncludeForNested(),
        transaction: handlerContext.transactionContext.transaction
    });
    const backlogItemParts = (dbBacklogItemWithParts as any).dataValues.backlogitemparts as any;
    const backlogItem = mapDbToApiBacklogItemWithParts(dbBacklogItemWithParts);
    backlogItem.unallocatedPoints = computeUnallocatedPointsUsingDbObjs(dbBacklogItemWithParts, backlogItemParts);
    return backlogItem;
};

/**
 * Uses backlogItemId to find a matching backlogItemParts in the specified sprint.
 */
export const fetchSprintBacklogItemsPartByItemId = async (
    handlerContext: HandlerContext,
    sprintId: string,
    backlogItemId: string
): Promise<ApiBacklogItemPart[]> => {
    const dbBacklogItemPartsWithSprintItems = await BacklogItemPartDataModel.findAll({
        where: { backlogitemId: backlogItemId },
        include: [
            {
                model: SprintBacklogItemDataModel,
                as: "sprintbacklogitems",
                where: { sprintId }
            }
        ],
        transaction: handlerContext.transactionContext.transaction
    });
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
    handlerContext: HandlerContext,
    sprintId: string,
    backlogItemPartId: string,
    displayIndex: number
): Promise<SprintBacklogItemDataModel> => {
    const bodyWithId = addIdToBody({
        sprintId,
        backlogitempartId: backlogItemPartId,
        displayindex: displayIndex
    });
    const addedSprintBacklog = await SprintBacklogItemDataModel.create(bodyWithId, {
        transaction: handlerContext.transactionContext.transaction
    } as CreateOptions);
    return addedSprintBacklog;
};
