// externals
import * as HttpStatus from "http-status-codes";

// libraries
import { ApiBacklogItem } from "@atoll/shared";

// utils
import { mapSprintBacklogToBacklogItem } from "../../../dataaccess/mappers";
import { buildOptionsFromParams } from "../../utils/filterHelper";
import { buildSelfLink } from "../../../utils/linkBuilder";

// consts/enums
import { SPRINT_BACKLOG_PARENT_RESOURCE_NAME, SPRINT_BACKLOG_CHILD_RESOURCE_NAME } from "../../../resourceNames";

// data access
import { SprintBacklogItemModel } from "../../../dataaccess/models/SprintBacklogItem";
import { BacklogItemModel } from "../../../dataaccess/models/BacklogItem";

export const sprintBacklogItemFetcher = async (sprintId: string | null) => {
    try {
        const options = buildOptionsFromParams({ sprintId });
        const sprintBacklogs = await SprintBacklogItemModel.findAll({
            ...options,
            include: [BacklogItemModel],
            order: [["displayindex", "ASC"]]
        });
        const items = sprintBacklogs.map((item) => {
            const sprintBacklog = mapSprintBacklogToBacklogItem(item);
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
            error: {
                msg: error
            }
        };
    }
};
