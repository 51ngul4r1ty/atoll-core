// externals
import * as HttpStatus from "http-status-codes";

// libraries
import { ApiBacklogItem } from "@atoll/shared";

// utils
import { mapDbSprintBacklogToApiBacklogItem } from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { buildOptionsFromParams } from "../../utils/sequelizeHelper";
import { buildSelfLink } from "../../../utils/linkBuilder";
import { getMessageFromError } from "../../utils/errorUtils";

// consts/enums
import { SPRINT_BACKLOG_PARENT_RESOURCE_NAME, SPRINT_BACKLOG_CHILD_RESOURCE_NAME } from "../../../resourceNames";

// data access
import { SprintBacklogItemDataModel } from "../../../dataaccess/models/SprintBacklogItem";

export interface FetchedSprintBacklogItems {
    status: number;
    message?: string;
    data?: {
        items: ApiBacklogItem[];
    };
}

export const fetchSprintBacklogItems = async (sprintId: string | null): Promise<FetchedSprintBacklogItems> => {
    try {
        const options = buildOptionsFromParams({ sprintId });
        const sprintBacklogs = await SprintBacklogItemDataModel.findAll({
            ...options,
            include: { all: true, nested: true },
            order: [["displayindex", "ASC"]]
        });
        const items = sprintBacklogs.map((item) => {
            const sprintBacklog = mapDbSprintBacklogToApiBacklogItem(item);
            const result: ApiBacklogItem = {
                ...sprintBacklog,
                links: [
                    buildSelfLink(
                        sprintBacklog,
                        `/api/v1/${SPRINT_BACKLOG_PARENT_RESOURCE_NAME}/${sprintId}/${SPRINT_BACKLOG_CHILD_RESOURCE_NAME}`
                    )
                ]
            };
            return result;
        });
        return {
            status: HttpStatus.OK,
            data: {
                items
            }
        };
    } catch (error) {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: getMessageFromError(error)
        };
    }
};
