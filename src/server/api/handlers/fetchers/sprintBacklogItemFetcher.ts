// externals
import * as HttpStatus from "http-status-codes";

// libraries
import { ApiBacklogItem } from "@atoll/shared";

// utils
import { mapDbSprintBacklogToApiBacklogItem } from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { buildOptionsFromParams } from "../../utils/sequelizeHelper";
import { buildSelfLink } from "../../../utils/linkBuilder";

// consts/enums
import { SPRINT_BACKLOG_PARENT_RESOURCE_NAME, SPRINT_BACKLOG_CHILD_RESOURCE_NAME } from "../../../resourceNames";

// data access
import { SprintBacklogItemModel } from "../../../dataaccess/models/SprintBacklogItem";
import { BacklogItemModel } from "../../../dataaccess/models/BacklogItem";

export interface FetchedSprintBacklogItems {
    status: number;
    message?: string;
    data?: {
        items: ApiBacklogItem[]
    }
}

export const fetchSprintBacklogItems = async (sprintId: string | null): Promise<FetchedSprintBacklogItems> => {
    try {
        const options = buildOptionsFromParams({ sprintId });
        const sprintBacklogs = await SprintBacklogItemModel.findAll({
            ...options,
            include: [BacklogItemModel],
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
            message: error
        };
    }
};
