// libraries
import { ApiSprintStats, BacklogItemStatus, mapApiItemToBacklogItem } from "@atoll/shared";

// data access
import { BacklogItemRankDataModel } from "../../../dataaccess/models/BacklogItemRank";
import { SprintBacklogItemDataModel } from "../../../dataaccess/models/SprintBacklogItem";

// interfaces/types
import { HandlerContext } from "../utils/handlerContext";

// utils
import { mapDbSprintBacklogToApiBacklogItem } from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { handleSprintStatUpdate } from "../updaters/sprintStatUpdater";

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
