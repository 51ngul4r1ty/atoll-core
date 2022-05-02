/**
 * Purpose: An aggregator's responsibility is to combine the results of multiple fetchers into a single response.  This particular
 *   aggregator returns backlog items with additional information so that multiple endpoints can return the same payload- think of
 *   the BFF endpoints and the REST API endpoints that need the same response structure.
 */

// externals
import { StatusCodes } from "http-status-codes";
import { Transaction } from "sequelize";

// libraries
import type { ApiBacklogItem, ApiBacklogItemPart, ApiSprint } from "@atoll/shared";

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
import type { RestApiErrorResult, RestApiItemResult } from "../../utils/responseBuilder";

export type ApiBacklogItemPartAndSprint = { part: ApiBacklogItemPart; sprint: ApiSprint };

export type BacklogItemWithSprintAllocationInfoExtra = {
    inProductBacklog: boolean;
    sprintIds: string[];
    backlogItemPartsAndSprints: ApiBacklogItemPartAndSprint[];
};

export type BacklogItemWithSprintAllocationInfoResult = RestApiItemResult<ApiBacklogItem, BacklogItemWithSprintAllocationInfoExtra>;

export const fetchBacklogItemWithSprintAllocationInfo = async (
    backlogItemId: string,
    transaction?: Transaction
): Promise<BacklogItemWithSprintAllocationInfoResult | RestApiErrorResult> => {
    const backlogItemFetchResult = await fetchBacklogItem(backlogItemId, transaction);
    if (backlogItemFetchResult.status === StatusCodes.NOT_FOUND) {
        return buildNotFoundResponse(backlogItemFetchResult.message);
    } else if (isRestApiItemResult(backlogItemFetchResult)) {
        const item = backlogItemFetchResult.data.item;
        const productBacklogItem = await fetchProductBacklogItemById(backlogItemId, transaction);
        let inProductBacklog: boolean;
        if (productBacklogItem.status === StatusCodes.OK) {
            inProductBacklog = true;
        } else if (productBacklogItem.status === StatusCodes.NOT_FOUND) {
            inProductBacklog = false;
        } else {
            const error = `Unable to fetch product backlog item by ID ${backlogItemId}: ${productBacklogItem.message}`;
            const errorResponse = buildInternalServerErrorResponse(error);
            return errorResponse;
        }
        const sprintsResult = await fetchPartAndSprintInfoForBacklogItem(backlogItemId, transaction);
        if (!isRestApiCollectionResult(sprintsResult)) {
            const error = `Error retrieving sprints for backlog item ID ${backlogItemId}: ${sprintsResult.message}`;
            const errorResponse = buildInternalServerErrorResponse(error);
            return errorResponse;
        } else {
            const backlogItemParts = sprintsResult.data.items.map((item) => item.backlogItemPart);
            const sprints = sprintsResult.data.items.map((item) => item.sprint ?? null);
            const backlogItemPartsAndSprints: ApiBacklogItemPartAndSprint[] = [];
            if (sprints.length !== backlogItemParts.length) {
                return buildInternalServerErrorResponse(
                    "Unexpected result- mismatching number of items: " +
                        `${backlogItemParts.length} backlog item parts vs ${sprints.length} sprints`
                );
            }
            sprints.forEach((sprint, index) => {
                backlogItemPartsAndSprints.push({ sprint, part: backlogItemParts[index] });
            });
            backlogItemPartsAndSprints.sort((a, b) => a.part.partIndex - b.part.partIndex);
            const sprintIds = backlogItemPartsAndSprints.reduce((result, item) => {
                if (item.sprint) {
                    result.push(item.sprint.id);
                }
                return result;
            }, []);
            const extra = {
                inProductBacklog,
                sprintIds,
                backlogItemPartsAndSprints
            };
            const responseObj = buildResponseWithItem(item, extra);
            return responseObj;
        }
    } else {
        return buildMessageResponse(backlogItemFetchResult.status, backlogItemFetchResult.message);
    }
};
