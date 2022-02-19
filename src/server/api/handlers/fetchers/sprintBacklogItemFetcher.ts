// externals
import * as HttpStatus from "http-status-codes";

// libraries
import { ApiBacklogItemInSprint } from "@atoll/shared";

// consts/enums
import { SPRINT_BACKLOG_PARENT_RESOURCE_NAME, SPRINT_BACKLOG_CHILD_RESOURCE_NAME } from "../../../resourceNames";

// data access
import { SprintBacklogItemDataModel } from "../../../dataaccess/models/SprintBacklogItem";

// utils
import { buildOptionsFromParams } from "../../utils/sequelizeHelper";
import { buildResponseFromCatchError, buildResponseWithItem, buildResponseWithItems } from "../../utils/responseBuilder";
import { buildSelfLink } from "../../../utils/linkBuilder";
import { mapDbSprintBacklogWithNestedToApiBacklogItemInSprint } from "../../../dataaccess/mappers/dataAccessToApiMappers";

export interface FetchedSprintBacklogItems {
    status: number;
    message?: string;
    data?: {
        items: ApiBacklogItemInSprint[];
    };
}

export const fetchSprintBacklogItemsWithLinks = async (sprintId: string | null): Promise<FetchedSprintBacklogItems> => {
    try {
        const options = buildOptionsFromParams({ sprintId });
        const sprintBacklogs = await SprintBacklogItemDataModel.findAll({
            ...options,
            include: { all: true, nested: true },
            order: [["displayindex", "ASC"]]
        });
        const items = sprintBacklogs.map((item) => {
            const sprintBacklog = mapDbSprintBacklogWithNestedToApiBacklogItemInSprint(item);
            return buildBacklogItemPartForResponse(sprintId, sprintBacklog);
        });
        return buildResponseWithItems(items);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export interface FetchedSprintBacklogItem {
    status: number;
    message?: string;
    data?: {
        item: ApiBacklogItemInSprint;
    };
}

export const fetchSprintBacklogItemPartWithLinks = async (
    sprintId: string | null,
    backlogItemPartId: string | null
): Promise<FetchedSprintBacklogItem> => {
    try {
        const options = buildOptionsFromParams({ sprintId, backlogitempartId: backlogItemPartId });
        const sprintBacklogItems = await SprintBacklogItemDataModel.findAll({
            ...options,
            include: { all: true, nested: true }
        });
        if (!sprintBacklogItems.length) {
            return {
                status: HttpStatus.NOT_FOUND
            };
        }
        if (sprintBacklogItems.length > 1) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Multiple matches for Backog Item Part ID ${backlogItemPartId}`
            };
        }
        const sprintBacklog = mapDbSprintBacklogWithNestedToApiBacklogItemInSprint(sprintBacklogItems[0]);
        const item = buildBacklogItemPartForResponse(sprintId, sprintBacklog);
        return buildResponseWithItem(item);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export const buildBacklogItemPartForResponse = (
    sprintId: string,
    sprintBacklog: ApiBacklogItemInSprint
): ApiBacklogItemInSprint => {
    return {
        ...sprintBacklog,
        links: [
            buildSelfLink(
                sprintBacklog,
                `/api/v1/${SPRINT_BACKLOG_PARENT_RESOURCE_NAME}/${sprintId}/${SPRINT_BACKLOG_CHILD_RESOURCE_NAME}`
            )
        ]
    };
};
