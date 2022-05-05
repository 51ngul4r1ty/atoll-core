// externals
import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";

// libraries
import { ApiProject } from "@atoll/shared";

// data access
import { ProjectDataModel } from "../../../dataaccess/models/ProjectDataModel";

// consts/enums
import { PROJECT_RESOURCE_NAME, SPRINT_RESOURCE_NAME } from "../../../resourceNames";

// interfaces/types
import { RestApiCollectionResult, RestApiErrorResult } from "../../utils/responseBuilder";

// utils
import { buildResponseFromCatchError, buildResponseWithItem, buildResponseWithItems } from "../../utils/responseBuilder";
import { buildLink, buildSelfLink, buildSimpleLink } from "../../../utils/linkBuilder";
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
        status: StatusCodes.OK,
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

export const buildProjectLinks = (project: ApiProject) => [
    buildSelfLink(project, `/api/v1/${PROJECT_RESOURCE_NAME}/`),
    buildSimpleLink(`/api/v1/${PROJECT_RESOURCE_NAME}/${project.id}/${SPRINT_RESOURCE_NAME}/--curr--`, "related:sprint/current"),
    buildSimpleLink(`/api/v1/${PROJECT_RESOURCE_NAME}/${project.id}/${SPRINT_RESOURCE_NAME}/--next--`, "related:sprint/next")
];

export const fetchProjects = async () => {
    try {
        const dbProjects = await ProjectDataModel.findAll();
        const items = dbProjects.map((item) => {
            const project = mapDbToApiProject(item);
            const result: ApiProject = {
                ...project,
                links: buildProjectLinks(project)
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
        const dbProject = await ProjectDataModel.findByPk(projectId);
        const project = mapDbToApiProject(dbProject);
        const item = {
            ...project,
            links: buildProjectLinks(project)
        };
        return buildResponseWithItem(item);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};
