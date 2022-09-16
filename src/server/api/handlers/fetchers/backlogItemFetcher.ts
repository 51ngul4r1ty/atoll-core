// externals
import { FindOptions, Transaction } from "sequelize";

// libraries
import type { ApiBacklogItem, ApiProductBacklogItem } from "@atoll/shared";
import { asyncForEach, LinkedList } from "@atoll/shared";

// data access
import { DB_INCLUDE_ALIAS_BACKLOGITEMPARTS } from "../../../dataaccess/models/dataModelConsts";
import { BacklogItemDataModel } from "../../../dataaccess/models/BacklogItemDataModel";
import { ProductBacklogItemDataModel } from "../../../dataaccess/models/ProductBacklogItemDataModel";

// consts/enums
import { BACKLOG_ITEM_RESOURCE_NAME } from "../../../resourceNames";

// utils
import { mapDbToApiBacklogItem, mapDbToApiProductBacklogItem } from "../../../dataaccess/mappers/dataAccessToApiMappers";
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
    const dbBacklogItemParts = dbItemWithParts[DB_INCLUDE_ALIAS_BACKLOGITEMPARTS];
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
    friendlyId?: string;
};

export const buildBacklogItemFindOptionsForNested = (params: BacklogItemParams, transaction?: Transaction): FindOptions => {
    const options = buildOptionsFromParams(params);
    const backlogItemsOptions: FindOptions = {
        ...options,
        include: buildBacklogItemFindOptionsIncludeForNested()
    };
    return backlogItemsOptions;
};

/**
 * @returns backlog item with
 */
export const fetchBacklogItem = async (
    backlogItemId: string,
    transaction?: Transaction
): Promise<BacklogItemResult | RestApiErrorResult> => {
    try {
        const backlogItemsOptions = buildBacklogItemFindOptionsForNested({}, transaction);
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

const buildBacklogItemsResult = (dbBacklogItems) => {
    const items: ApiBacklogItem[] = dbBacklogItems.map((item) => buildApiItemFromDbItemWithParts(item));
    return buildResponseWithItems(items);
};

export const fetchBacklogItemsByDisplayId = async (
    projectId: string,
    backlogItemDisplayId: string
): Promise<BacklogItemsResult | RestApiErrorResult> => {
    try {
        const backlogItemsOptions1 = buildBacklogItemFindOptionsForNested({ projectId, externalId: backlogItemDisplayId });
        const dbBacklogItemsByExternalId = await BacklogItemDataModel.findAll(backlogItemsOptions1);
        if (dbBacklogItemsByExternalId.length >= 1) {
            return buildBacklogItemsResult(dbBacklogItemsByExternalId);
        }
        const options = buildBacklogItemFindOptionsForNested({ projectId, friendlyId: backlogItemDisplayId });
        const dbBacklogItemsByFriendlyId = await BacklogItemDataModel.findAll(options);
        return buildBacklogItemsResult(dbBacklogItemsByFriendlyId);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export const fetchBacklogItems = async (projectId: string | undefined): Promise<BacklogItemsResult | RestApiErrorResult> => {
    try {
        const params = { projectId };
        const options = buildOptionsFromParams(params);
        const dbProductBacklogItems = await ProductBacklogItemDataModel.findAll(options);
        const productBacklogItemsByProjectId: { [projectId: string]: ApiProductBacklogItem[] } = {};
        if (dbProductBacklogItems.length) {
            const productBacklogItemsMapped = dbProductBacklogItems.map((item) => mapDbToApiProductBacklogItem(item));
            productBacklogItemsMapped.forEach((item) => {
                if (!productBacklogItemsByProjectId[item.projectId]) {
                    productBacklogItemsByProjectId[item.projectId] = [];
                }
                productBacklogItemsByProjectId[item.projectId].push(item);
            });
        }
        let combinedRankedLists: ApiBacklogItem[] = [];
        await asyncForEach(Object.keys(productBacklogItemsByProjectId), async (projectId: string) => {
            const projectBacklogItems = productBacklogItemsByProjectId[projectId];
            const rankList = new LinkedList<ApiBacklogItem>();
            projectBacklogItems.forEach((item) => {
                rankList.addInitialLink(item.backlogitemId, item.nextbacklogitemId);
            });
            const backlogItemsOptions = buildBacklogItemFindOptionsForNested(params);
            const dbBacklogItemsWithParts = await BacklogItemDataModel.findAll(backlogItemsOptions);
            dbBacklogItemsWithParts.forEach((dbBacklogItemWithParts) => {
                const result = buildApiItemFromDbItemWithParts(dbBacklogItemWithParts);
                rankList.addItemData(result.id, result);
            });
            combinedRankedLists = combinedRankedLists.concat(rankList.toArray());
        });
        return buildResponseWithItems(combinedRankedLists);
    } catch (error) {
        return buildResponseFromCatchError(error, { includeStack: true });
    }
};
