// externals
import * as HttpStatus from "http-status-codes";

// libraries
import { ApiSprint } from "@atoll/shared";

// utils
import { mapToSprint } from "../../../dataaccess/mappers";
import { buildOptionsFromParams } from "../../utils/filterHelper";
import { buildSelfLink } from "../../../utils/linkBuilder";

// consts/enums
import { SPRINT_RESOURCE_NAME } from "../../../resourceNames";

// data access
import { SprintModel } from "../../../dataaccess/models/Sprint";

export const sprintFetcher = async (projectId: string | null) => {
    try {
        const options = buildOptionsFromParams({ projectId });
        const sprints = await SprintModel.findAll(options);
        const items = sprints.map((item) => {
            const sprint = mapToSprint(item);
            const result: ApiSprint = {
                ...sprint,
                links: [buildSelfLink(sprint, `/api/v1/${SPRINT_RESOURCE_NAME}/`)]
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
