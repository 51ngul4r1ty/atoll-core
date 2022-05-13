// externals
import { StatusCodes } from "http-status-codes";

// libraries
import { ApiBacklogItemInSprint } from "@atoll/shared";

// consts/enums
import {
    SPRINT_BACKLOG_PARENT_RESOURCE_NAME,
    SPRINT_BACKLOG_CHILD_RESOURCE_NAME,
    BACKLOG_ITEM_RESOURCE_NAME,
    BACKLOG_ITEM_PART_RESOURCE_NAME
} from "../../../resourceNames";

// data access
import { DB_INCLUDE_ALIAS_SPRINTBACKLOGITEMS, DB_INCLUDE_ALIAS_BACKLOGITEM } from "../../../dataaccess/models/dataModelConsts";
import { SprintBacklogItemPartDataModel } from "../../../dataaccess/models/SprintBacklogItemPartDataModel";
import { BacklogItemPartDataModel } from "../../../dataaccess/models/BacklogItemPartDataModel";
import { BacklogItemDataModel } from "../../../dataaccess/models/BacklogItemDataModel";

// utils
import { buildOptionsFromParams } from "../../utils/sequelizeHelper";
import {
    buildResponseFromCatchError,
    buildResponseWithItem,
    buildResponseWithItems,
    RestApiCollectionResult,
    RestApiErrorResult,
    RestApiItemResult
} from "../../utils/responseBuilder";
import { buildSelfLink, buildSimpleLink } from "../../../utils/linkBuilder";
import {
    mapDbBacklogPartsWithSprintItemsToApiBacklogItemInSprint,
    mapDbSprintBacklogWithNestedToApiBacklogItemInSprint
} from "../../../dataaccess/mappers/dataAccessToApiMappers";

export type SprintBacklogItemsResult = RestApiCollectionResult<ApiBacklogItemInSprint>;
export type SprintBacklogItemResult = RestApiItemResult<ApiBacklogItemInSprint>;

export type SprintBacklogsResult = SprintBacklogItemsResult | RestApiErrorResult;
export type SprintBacklogResult = SprintBacklogItemResult | RestApiErrorResult;

export const fetchSprintBacklogItemsWithLinks = async (sprintId: string | null): Promise<SprintBacklogsResult> => {
    try {
        const options = buildOptionsFromParams({ sprintId });
        const sprintBacklogs = await SprintBacklogItemPartDataModel.findAll({
            ...options,
            include: { all: true, nested: true },
            order: [["displayindex", "ASC"]]
        });
        const items = sprintBacklogs.map((item) => {
            const sprintBacklog = mapDbSprintBacklogWithNestedToApiBacklogItemInSprint(item);
            return buildBacklogItemPartForResponse(sprintId, sprintBacklog);
        });
        const result: SprintBacklogItemsResult = buildResponseWithItems(items);
        return result;
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export const fetchSprintBacklogItemWithLinks = async (
    sprintId: string | null,
    backlogItemId: string | null
): Promise<SprintBacklogResult> => {
    try {
        const options = {
            where: { backlogitemId: backlogItemId },
            include: [
                {
                    model: SprintBacklogItemPartDataModel,
                    as: DB_INCLUDE_ALIAS_SPRINTBACKLOGITEMS,
                    where: { sprintId }
                },
                {
                    model: BacklogItemDataModel,
                    as: DB_INCLUDE_ALIAS_BACKLOGITEM,
                    where: { id: backlogItemId }
                }
            ]
        };
        const dbBacklogItemPartsWithSprintItems = await BacklogItemPartDataModel.findAll(options);

        if (!dbBacklogItemPartsWithSprintItems.length) {
            return {
                status: StatusCodes.NOT_FOUND
            };
        }
        if (dbBacklogItemPartsWithSprintItems.length > 1) {
            return {
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: `Multiple matches for Backog Item ID ${backlogItemId}`
            };
        }
        const sprintBacklog = mapDbBacklogPartsWithSprintItemsToApiBacklogItemInSprint(dbBacklogItemPartsWithSprintItems[0]);
        const item = buildBacklogItemPartForResponse(sprintId, sprintBacklog);
        const result: SprintBacklogItemResult = buildResponseWithItem(item);
        return result;
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export const fetchSprintBacklogItemPartWithLinks = async (
    sprintId: string | null,
    backlogItemPartId: string | null
): Promise<SprintBacklogResult> => {
    try {
        const options = buildOptionsFromParams({ sprintId, backlogitempartId: backlogItemPartId });
        const sprintBacklogItems = await SprintBacklogItemPartDataModel.findAll({
            ...options,
            include: { all: true, nested: true }
        });
        if (!sprintBacklogItems.length) {
            return {
                status: StatusCodes.NOT_FOUND
            };
        }
        if (sprintBacklogItems.length > 1) {
            return {
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: `Multiple matches for Backog Item Part ID ${backlogItemPartId}`
            };
        }
        const sprintBacklog = mapDbSprintBacklogWithNestedToApiBacklogItemInSprint(sprintBacklogItems[0]);
        const item = buildBacklogItemPartForResponse(sprintId, sprintBacklog);
        const result: SprintBacklogItemResult = buildResponseWithItem(item);
        return result;
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export const buildBacklogItemPartForResponse = (
    sprintId: string,
    sprintBacklogItem: ApiBacklogItemInSprint
): ApiBacklogItemInSprint => {
    return {
        ...sprintBacklogItem,
        links: [
            buildSelfLink(
                sprintBacklogItem,
                `/api/v1/${SPRINT_BACKLOG_PARENT_RESOURCE_NAME}/${sprintId}/${SPRINT_BACKLOG_CHILD_RESOURCE_NAME}`
            ),
            buildSimpleLink(`/api/v1/${BACKLOG_ITEM_RESOURCE_NAME}/${sprintBacklogItem.id}`, "related:backlog-item"),
            buildSimpleLink(
                `/api/v1/${BACKLOG_ITEM_PART_RESOURCE_NAME}/${sprintBacklogItem.backlogItemPartId}`,
                "related:backlog-item-part"
            )
        ]
    };
};
