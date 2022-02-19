// externals
import { FindOptions } from "sequelize";

// libraries
import { ApiBacklogItem, LinkedList } from "@atoll/shared";

// data access
import { BacklogItemDataModel } from "../../../dataaccess/models/BacklogItem";
import { BacklogItemRankDataModel } from "../../../dataaccess/models/BacklogItemRank";

// consts/enums
import { BACKLOG_ITEM_RESOURCE_NAME } from "../../../resourceNames";

// utils
import { mapDbToApiBacklogItem, mapDbToApiBacklogItemRank } from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { buildOptionsFromParams } from "../../utils/sequelizeHelper";
import { buildSelfLink } from "../../../utils/linkBuilder";
import { buildFindOptionsIncludeForNested, computeUnallocatedParts, computeUnallocatedPoints } from "../helpers/backlogItemHelper";
import { buildResponseFromCatchError, buildResponseWithItems } from "../../utils/responseBuilder";

export interface BacklogItemsResult {
    status: number;
    data?: {
        items: any[];
    };
    message?: string;
}

export const backlogItemFetcher = async (projectId: string, backlogItemDisplayId: string): Promise<BacklogItemsResult> => {
    try {
        const options = buildOptionsFromParams({ projectId, externalId: backlogItemDisplayId });
        const backlogItems = await BacklogItemDataModel.findAll(options);
        const getBacklogItemsResult = (backlogItems) => {
            const items = backlogItems.map((item) => {
                const backlogItem = mapDbToApiBacklogItem(item);
                const result: ApiBacklogItem = {
                    ...backlogItem,
                    links: [buildSelfLink(backlogItem, `/api/v1/${BACKLOG_ITEM_RESOURCE_NAME}/`)]
                };
                return result;
            });
            return buildResponseWithItems(items);
        };
        if (backlogItems.length >= 1) {
            return getBacklogItemsResult(backlogItems);
        } else {
            const options = buildOptionsFromParams({ projectId, friendlyId: backlogItemDisplayId });
            const backlogItems = await BacklogItemDataModel.findAll(options);
            return getBacklogItemsResult(backlogItems);
        }
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export const backlogItemsFetcher = async (projectId: string | null): Promise<BacklogItemsResult> => {
    try {
        const options = buildOptionsFromParams({ projectId });
        const backlogItemRanks = await BacklogItemRankDataModel.findAll(options);
        const rankList = new LinkedList<ApiBacklogItem>();
        if (backlogItemRanks.length) {
            const backlogItemRanksMapped = backlogItemRanks.map((item) => mapDbToApiBacklogItemRank(item));
            backlogItemRanksMapped.forEach((item) => {
                rankList.addInitialLink(item.backlogitemId, item.nextbacklogitemId);
            });
        }
        const backlogItemsOptions: FindOptions = {
            ...options,
            include: buildFindOptionsIncludeForNested()
        };
        const backlogItems = await BacklogItemDataModel.findAll(backlogItemsOptions);
        backlogItems.forEach((item) => {
            const backlogItem = mapDbToApiBacklogItem(item);
            backlogItem.unallocatedParts = computeUnallocatedParts((item as any).backlogitemparts);
            backlogItem.unallocatedPoints = computeUnallocatedPoints(item, (item as any).backlogitemparts);
            const result: ApiBacklogItem = {
                ...backlogItem,
                links: [buildSelfLink(backlogItem, `/api/v1/${BACKLOG_ITEM_RESOURCE_NAME}/`)]
            };
            rankList.addItemData(result.id, result);
        });
        buildResponseWithItems(rankList.toArray());
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};
