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
import {
    buildBacklogItemFindOptionsIncludeForNested,
    computeUnallocatedParts,
    computeUnallocatedPointsUsingDbObjs
} from "../helpers/backlogItemHelper";
import {
    buildNotFoundResponse,
    buildResponseFromCatchError,
    buildResponseWithItem,
    buildResponseWithItems
} from "../../utils/responseBuilder";

// interfaces/types
import { RestApiCollectionResult, RestApiErrorResult, RestApiItemResult } from "../../utils/responseBuilder";

export type BacklogItemsResult = RestApiCollectionResult<ApiBacklogItem>;

export type BacklogItemResult = RestApiItemResult<ApiBacklogItem>;

const buildApiItemFromDbItemWithParts = (dbItemWithParts: BacklogItemDataModel): ApiBacklogItem => {
    const backlogItem = mapDbToApiBacklogItem(dbItemWithParts);
    const dbBacklogItemParts = (dbItemWithParts as any).backlogitemparts;
    backlogItem.unallocatedParts = computeUnallocatedParts(dbBacklogItemParts);
    backlogItem.unallocatedPoints = computeUnallocatedPointsUsingDbObjs(dbItemWithParts, dbBacklogItemParts);
    const result: ApiBacklogItem = {
        ...backlogItem,
        links: [buildSelfLink(backlogItem, `/api/v1/${BACKLOG_ITEM_RESOURCE_NAME}/`)]
    };
    return result;
};

export type BacklogItemParams = {
    projectId?: string;
    externalId?: string;
};

export const buildFindOptionsForBacklogItems = (params: BacklogItemParams): FindOptions => {
    const options = buildOptionsFromParams(params);
    const backlogItemsOptions: FindOptions = {
        ...options,
        include: buildBacklogItemFindOptionsIncludeForNested()
    };
    return backlogItemsOptions;
};

export const fetchBacklogItem = async (backlogItemId: string): Promise<BacklogItemResult | RestApiErrorResult> => {
    try {
        const backlogItemsOptions = buildFindOptionsForBacklogItems({});
        const dbBacklogItem = await BacklogItemDataModel.findByPk(backlogItemId, backlogItemsOptions);
        if (!dbBacklogItem) {
            return buildNotFoundResponse(`Unable to find backlog item by ID ${backlogItemId}`);
        }
        const item = buildApiItemFromDbItemWithParts(dbBacklogItem);
        return buildResponseWithItem(item);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export const fetchBacklogItemsByDisplayId = async (
    projectId: string,
    backlogItemDisplayId: string
): Promise<BacklogItemsResult | RestApiErrorResult> => {
    try {
        const backlogItemsOptions = buildFindOptionsForBacklogItems({ projectId, externalId: backlogItemDisplayId });
        const dbBacklogItemsByExternalId = await BacklogItemDataModel.findAll(backlogItemsOptions);
        const getBacklogItemsResult = (backlogItems) => {
            const items: ApiBacklogItem[] = backlogItems.map((item) => {
                const result = buildApiItemFromDbItemWithParts(item);
                return result;
            });
            return buildResponseWithItems(items);
        };
        if (dbBacklogItemsByExternalId.length >= 1) {
            return getBacklogItemsResult(dbBacklogItemsByExternalId);
        } else {
            const options = buildOptionsFromParams({ projectId, friendlyId: backlogItemDisplayId });
            const dbBacklogItemsByFriendlyId = await BacklogItemDataModel.findAll(options);
            return getBacklogItemsResult(dbBacklogItemsByFriendlyId);
        }
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export const fetchBacklogItems = async (projectId: string | null): Promise<BacklogItemsResult | RestApiErrorResult> => {
    try {
        const params = { projectId };
        const options = buildOptionsFromParams(params);
        const dbBacklogItemRanks = await BacklogItemRankDataModel.findAll(options);
        const rankList = new LinkedList<ApiBacklogItem>();
        if (dbBacklogItemRanks.length) {
            const backlogItemRanksMapped = dbBacklogItemRanks.map((item) => mapDbToApiBacklogItemRank(item));
            backlogItemRanksMapped.forEach((item) => {
                rankList.addInitialLink(item.backlogitemId, item.nextbacklogitemId);
            });
        }
        const backlogItemsOptions = buildFindOptionsForBacklogItems(params);
        const dbBacklogItemsWithParts = await BacklogItemDataModel.findAll(backlogItemsOptions);
        dbBacklogItemsWithParts.forEach((dbBacklogItemWithParts) => {
            const result = buildApiItemFromDbItemWithParts(dbBacklogItemWithParts);
            rankList.addItemData(result.id, result);
        });
        return buildResponseWithItems(rankList.toArray());
    } catch (error) {
        return buildResponseFromCatchError(error, { includeStack: true });
    }
};
