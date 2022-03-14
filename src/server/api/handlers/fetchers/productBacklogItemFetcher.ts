// externals
import { FindOptions } from "sequelize";

// libraries
import { ApiBacklogItem } from "@atoll/shared";

// data access
import { BacklogItemDataModel } from "../../../dataaccess/models/BacklogItemDataModel";
import { BacklogItemRankDataModel } from "../../../dataaccess/models/BacklogItemRankDataModel";

// consts/enums
import { BACKLOG_ITEM_RESOURCE_NAME } from "../../../resourceNames";

// interfaces/types
import type { RestApiCollectionResult, RestApiErrorResult } from "../../utils/responseBuilder";

// utils
import { mapDbToApiBacklogItem } from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { buildOptionsFromParams } from "../../utils/sequelizeHelper";
import { buildSelfLink } from "../../../utils/linkBuilder";
import {
    buildBacklogItemFindOptionsIncludeForNested,
    computeUnallocatedParts,
    computeUnallocatedPointsUsingDbObjs
} from "../helpers/backlogItemHelper";
import {
    buildInternalServerErrorResponse,
    buildNotFoundResponse,
    buildResponseFromCatchError,
    buildResponseWithItem
} from "../../utils/responseBuilder";

export type ProductBacklogItemResult = RestApiCollectionResult<ApiBacklogItem>;

/**
 * Looks for the item in the product backlog - even if the work item itself exists it must be present in the product backlog
 * specifically for this function to return it.
 */
export const fetchProductBacklogItemById = async (
    backlogItemId: string
): Promise<ProductBacklogItemResult | RestApiErrorResult> => {
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
            include: buildBacklogItemFindOptionsIncludeForNested()
        };
        const dbBacklogItem = await BacklogItemDataModel.findByPk(backlogItemId, backlogItemsOptions);
        const backlogItemPartsAlias = "backlogitemparts";
        const backlogItem = mapDbToApiBacklogItem(dbBacklogItem);
        const dbBacklogItemParts = dbBacklogItem[backlogItemPartsAlias];
        backlogItem.unallocatedParts = computeUnallocatedParts(dbBacklogItemParts);
        backlogItem.unallocatedPoints = computeUnallocatedPointsUsingDbObjs(dbBacklogItem, dbBacklogItemParts);
        const item: ApiBacklogItem = {
            ...backlogItem,
            links: [buildSelfLink(backlogItem, `/api/v1/${BACKLOG_ITEM_RESOURCE_NAME}/`)]
        };
        return buildResponseWithItem(item);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};
