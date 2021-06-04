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
import { BacklogItemDataModel } from "../../../dataaccess/models/BacklogItem";
import { BacklogItemPartDataModel } from "../../../dataaccess/models/BacklogItemPart";
import { BacklogItemRankDataModel } from "../../../dataaccess/models/BacklogItemRank";
import { SprintBacklogItemDataModel } from "../../../dataaccess/models/SprintBacklogItem";

// interfaces/types
import { HandlerContext } from "../utils/handlerContext";

// utils
import {
    mapDbSprintBacklogToApiBacklogItem,
    mapDbToApiBacklogItemWithParts,
    mapDbToApiSprintBacklogItem
} from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { handleSprintStatUpdate } from "../updaters/sprintStatUpdater";
import { buildOptionsFromParams } from "../../utils/sequelizeHelper";
import { addIdToBody } from "../../utils/uuidHelper";

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
    const apiBacklogItemTyped = mapDbSprintBacklogToApiBacklogItem(sprintBacklogItemWithNested);
    const backlogItemTyped = mapApiItemToBacklogItem(apiBacklogItemTyped);
    await SprintBacklogItemDataModel.destroy({
        where: { sprintId, backlogitempartId },
        transaction: handlerContext.transactionContext.transaction
    });
    sprintStats = await handleSprintStatUpdate(
        sprintId,
        backlogItemTyped.status,
        BacklogItemStatus.None,
        backlogItemTyped.estimate,
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
        include: [
            {
                model: BacklogItemPartDataModel,
                as: "backlogitemparts"
            }
        ],
        transaction: handlerContext.transactionContext.transaction
    });
    const backlogItem = mapDbToApiBacklogItemWithParts(dbBacklogItemWithParts);
    return backlogItem;
};

export const allocateBacklogItemToSprint = async (
    handlerContext: HandlerContext,
    sprintId: string,
    backlogItemPartId: string,
    displayIndex: number
) => {
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
