// externals
import * as HttpStatus from "http-status-codes";
import { Transaction } from "sequelize";

// libraries
import { ApiSprint } from "@atoll/shared";

// utils
import { mapDbToApiSprint, mapDbToApiSprintBacklogItem } from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { buildOptionsFromParams } from "../../utils/sequelizeHelper";
import { buildSelfLink } from "../../../utils/linkBuilder";

// consts/enums
import { SPRINT_RESOURCE_NAME } from "../../../resourceNames";

// data access
import { SprintModel } from "../../../dataaccess/models/Sprint";
import { SprintBacklogItemModel } from "../../../dataaccess/models/SprintBacklogItem";

export const fetchSprints = async (projectId: string | null, archived?: string | null) => {
    try {
        const options = buildOptionsFromParams({ projectId, archived });
        const sprints = await SprintModel.findAll(options);
        const items = sprints.map((item) => {
            const sprint = mapDbToApiSprint(item);
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

export const fetchSprint = async (sprintId: string) => {
    try {
        const sprint = await SprintModel.findByPk(sprintId);
        if (!sprint) {
            return {
                status: HttpStatus.NOT_FOUND,
                message: `Unable to find sprint with ID ${sprintId}.`
            };
        }
        const sprintItem = mapDbToApiSprint(sprint);
        const item: ApiSprint = {
            ...sprintItem,
            links: [buildSelfLink(sprintItem, `/api/v1/${SPRINT_RESOURCE_NAME}/`)]
        };
        return {
            status: HttpStatus.OK,
            data: {
                item
            }
        };
    } catch (error) {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error
        };
    }
};

export const getIdForSprintContainingBacklogItem = async (
    backlogItemId: string,
    transaction?: Transaction
): Promise<string | null> => {
    const dbSprintBacklogItem = await SprintBacklogItemModel.findOne({ where: { backlogitemId: backlogItemId }, transaction });
    const apiSprintBacklogItem = mapDbToApiSprintBacklogItem(dbSprintBacklogItem);
    return apiSprintBacklogItem ? apiSprintBacklogItem.sprintId : null;
};
