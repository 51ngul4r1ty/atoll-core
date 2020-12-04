// externals
import * as HttpStatus from "http-status-codes";

// libraries
import { ApiSprint } from "@atoll/shared";

// utils
import { mapToSprint } from "../../../dataaccess/mappers";
import { buildOptionsFromParams } from "../../utils/sequelizeHelper";
import { buildSelfLink } from "../../../utils/linkBuilder";

// consts/enums
import { SPRINT_RESOURCE_NAME } from "../../../resourceNames";

// data access
import { SprintModel } from "../../../dataaccess/models/Sprint";

export const fetchSprints = async (projectId: string | null, archived?: string | null) => {
    try {
        const options = buildOptionsFromParams({ projectId, archived });
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
            message: error
        };
    }
};
