/**
 * Purpose: An aggregator's responsibility is to combine the results of multiple fetchers into a single response.  This particular
 *   aggregator returns backlog items with additional information so that multiple endpoints can return the same payload- think of
 *   the BFF endpoints and the REST API endpoints that need the same response structure.
 */

// externals
import * as HttpStatus from "http-status-codes";

// libraries
import type { ApiBacklogItem } from "@atoll/shared";

// utils
import { fetchBacklogItem } from "../fetchers/backlogItemFetcher";
import {
    buildInternalServerErrorResponse,
    buildMessageResponse,
    buildNotFoundResponse,
    buildResponseWithItem,
    isRestApiCollectionResult,
    isRestApiItemResult
} from "../../utils/responseBuilder";
import { fetchProductBacklogItemById } from "../fetchers/productBacklogItemFetcher";
import { fetchPartAndSprintInfoForBacklogItem } from "../fetchers/sprintFetcher";

// interfaces/types
import type { BacklogItemResult } from "../fetchers/backlogItemFetcher";
import type { RestApiErrorResult, RestApiItemResult } from "../../utils/responseBuilder";

export type BacklogItemWithSprintAllocationInfoExtra = {
    inProductBacklog: boolean;
    sprintIds: string[];
};

export type BacklogItemWithSprintAllocationInfoResult = RestApiItemResult<ApiBacklogItem, BacklogItemWithSprintAllocationInfoExtra>;

export const fetchBacklogItemWithSprintAllocationInfo = async (
    backlogItemId: string
): Promise<BacklogItemResult | RestApiErrorResult> => {
    const backlogItemFetchResult = await fetchBacklogItem(backlogItemId);
    if (backlogItemFetchResult.status === HttpStatus.NOT_FOUND) {
        return buildNotFoundResponse(backlogItemFetchResult.message);
    } else if (isRestApiItemResult(backlogItemFetchResult)) {
        const item = backlogItemFetchResult.data.item;
        const productBacklogItem = await fetchProductBacklogItemById(backlogItemId);
        let inProductBacklog: boolean;
        if (productBacklogItem.status === HttpStatus.OK) {
            inProductBacklog = true;
        } else if (productBacklogItem.status === HttpStatus.NOT_FOUND) {
            inProductBacklog = false;
        } else {
            const error = `Unable to fetch product backlog item by ID ${backlogItemId}: ${productBacklogItem.message}`;
            const errorResponse = buildInternalServerErrorResponse(error);
            return errorResponse;
        }
        const sprintsResult = await fetchPartAndSprintInfoForBacklogItem(backlogItemId);
        if (!isRestApiCollectionResult(sprintsResult)) {
            const error = `Error retrieving sprints for backlog item ID ${backlogItemId}: ${sprintsResult.message}`;
            const errorResponse = buildInternalServerErrorResponse(error);
            return errorResponse;
        } else {
            const sprintIds = sprintsResult.data.items.reduce((result, item) => {
                if (item.sprint) {
                    result.push(item.sprint.id);
                }
                return result;
            }, []);
            const backlogItemParts = sprintsResult.data.items.map((item) => item.backlogItemPart);
            const sprints = sprintsResult.data.items.map((item) => item.sprint || null);
            const extra = {
                inProductBacklog,
                sprintIds,
                backlogItemParts,
                sprints
            };
            const responseObj = buildResponseWithItem(item, extra);
            return responseObj;
        }
    } else {
        return buildMessageResponse(backlogItemFetchResult.status, backlogItemFetchResult.message);
    }
};
