// externals
import { FindOptions } from "sequelize";

// libraries
import { ApiBacklogItem, LinkedList } from "@atoll/shared";

// data access
import { BacklogItemDataModel } from "../../../dataaccess/models/BacklogItemDataModel";
import { BacklogItemRankDataModel } from "../../../dataaccess/models/BacklogItemRankDataModel";

// consts/enums
import { BACKLOG_ITEM_RESOURCE_NAME } from "../../../resourceNames";

// utils
import { mapDbToApiBacklogItem, mapDbToApiBacklogItemRank } from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { buildOptionsFromParams } from "../../utils/sequelizeHelper";
import { buildSelfLink } from "../../../utils/linkBuilder";
import { buildFindOptionsIncludeForNested, computeUnallocatedParts, computeUnallocatedPoints } from "../helpers/backlogItemHelper";
import {
    buildInternalServerErrorResponse,
    buildNotFoundResponse,
    buildResponseFromCatchError,
    buildResponseWithItem,
    buildResponseWithItems,
    RestApiCollectionResult,
    RestApiErrorResult
} from "../../utils/responseBuilder";

export type BacklogItemResult = RestApiCollectionResult<ApiBacklogItem>;

export interface BacklogItemsResult {
    status: number;
    data?: {
        items: any[];
    };
    message?: string;
}

export const fetchBacklogItem = async (projectId: string, backlogItemDisplayId: string): Promise<BacklogItemsResult> => {
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

export const fetchBacklogItems = async (projectId: string | null): Promise<BacklogItemsResult> => {
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
        return buildResponseWithItems(rankList.toArray());
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export const fetchBacklogItemById = async (backlogItemId: string): Promise<BacklogItemResult | RestApiErrorResult> => {
    try {
        const options = buildOptionsFromParams({ backlogitemId: backlogItemId });
        const backlogItemRanks = await BacklogItemRankDataModel.findAll(options);
        if (backlogItemRanks.length === 0) {
            return buildNotFoundResponse(`Unable to find backlog item by ID ${backlogItemId}`);
        } else if (backlogItemRanks.length > 1) {
            return buildInternalServerErrorResponse(`Found backlog item by ID ${backlogItemId} multiple times in product backlog`);
        }
        const backlogItemsOptions: FindOptions = {
            ...options,
            include: buildFindOptionsIncludeForNested()
        };
        const dbBacklogItem = await BacklogItemDataModel.findByPk(backlogItemId, backlogItemsOptions);
        const backlogItemPartsAlias = "backlogitemparts";
        const backlogItem = mapDbToApiBacklogItem(dbBacklogItem);
        const dbBacklogItemParts = dbBacklogItem[backlogItemPartsAlias];
        backlogItem.unallocatedParts = computeUnallocatedParts(dbBacklogItemParts);
        backlogItem.unallocatedPoints = computeUnallocatedPoints(dbBacklogItem, dbBacklogItemParts);
        const item: ApiBacklogItem = {
            ...backlogItem,
            links: [buildSelfLink(backlogItem, `/api/v1/${BACKLOG_ITEM_RESOURCE_NAME}/`)]
        };
        return buildResponseWithItem(item);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};
