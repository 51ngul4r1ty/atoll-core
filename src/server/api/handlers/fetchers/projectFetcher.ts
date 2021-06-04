// externals
import * as HttpStatus from "http-status-codes";
import { Op } from "sequelize";

// libraries
import { ApiProject } from "@atoll/shared";

// utils
import { mapDbToApiProject } from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { buildSelfLink } from "../../../utils/linkBuilder";
import { getMessageFromError } from "../../utils/errorUtils";

// data access
import { ProjectDataModel } from "../../../dataaccess/models/Project";

// consts/enums
import { PROJECT_RESOURCE_NAME } from "../../../resourceNames";

export interface ProjectsResult {
    status: number;
    data?: {
        items: any[];
    };
    message?: string;
}

export const projectByDisplayIdFetcher = async (projectDisplayId: string): Promise<ProjectsResult> => {
    try {
        // const options = buildOptionsFromParams({ externalId: projectDisplayId });
        const options = {
            where: {
                name: {
                    [Op.iLike]: projectDisplayId
                }
            }
        };
        const projects = await ProjectDataModel.findAll(options);
        const getProjectsResult = (projects) => {
            const items = projects.map((item) => {
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
        return getProjectsResult(projects);
    } catch (error) {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: getMessageFromError(error)
        };
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

export const fetchProject = async (projectId: string) => {
    try {
        const project = await ProjectDataModel.findByPk(projectId);
        const projectItem = mapDbToApiProject(project);
        const item = { ...projectItem, links: [buildSelfLink(projectItem, `/api/v1/${PROJECT_RESOURCE_NAME}/`)] };
        return {
            status: HttpStatus.OK,
            data: {
                item
            }
        };
    } catch (error) {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: getMessageFromError(error)
        };
    }
};
