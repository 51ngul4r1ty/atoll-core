// externals
import * as HttpStatus from "http-status-codes";
import { Op } from "sequelize";

// libraries
import { ApiProject } from "@atoll/shared";

// data access
import { ProjectDataModel } from "../../../dataaccess/models/ProjectDataModel";

// consts/enums
import { PROJECT_RESOURCE_NAME } from "../../../resourceNames";

// interfaces/types
import { RestApiCollectionResult, RestApiErrorResult } from "../../utils/responseBuilder";

// utils
import { buildResponseFromCatchError, buildResponseWithItem, buildResponseWithItems } from "../../utils/responseBuilder";
import { buildSelfLink } from "../../../utils/linkBuilder";
import { mapDbToApiProject } from "../../../dataaccess/mappers/dataAccessToApiMappers";

export type ProjectItemsResult = RestApiCollectionResult<ApiProject>;

export type ProjectsResult = ProjectItemsResult | RestApiErrorResult;

const buildProjectsResult = (dbProjects): ProjectItemsResult => {
    const items = dbProjects.map((item) => {
        const project = mapDbToApiProject(item);
        const result: ApiProject = {
            ...project,
            links: [buildSelfLink(project, `/api/v1/${PROJECT_RESOURCE_NAME}/`)]
        };
        return result;
    });
    return {
        status: HttpStatus.OK,
        data: {
            items
        }
    };
};

export const projectByDisplayIdFetcher = async (projectDisplayId: string): Promise<ProjectsResult> => {
    try {
        const options = {
            where: {
                name: {
                    [Op.iLike]: projectDisplayId
                }
            }
        };
        const projects = await ProjectDataModel.findAll(options);
        const result: ProjectItemsResult = buildProjectsResult(projects);
        return result;
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export const fetchProjects = async () => {
    try {
        const projects = await ProjectDataModel.findAll();
        const items = projects.map((item) => {
            const project = mapDbToApiProject(item);
            const result: ApiProject = {
                ...project,
                links: [buildSelfLink(project, `/api/v1/${PROJECT_RESOURCE_NAME}/`)]
            };
            return result;
        });
        return buildResponseWithItems(items);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export const fetchProject = async (projectId: string) => {
    try {
        const project = await ProjectDataModel.findByPk(projectId);
        const projectItem = mapDbToApiProject(project);
        const item = { ...projectItem, links: [buildSelfLink(projectItem, `/api/v1/${PROJECT_RESOURCE_NAME}/`)] };
        return buildResponseWithItem(item);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};
