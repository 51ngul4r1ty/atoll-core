// externals
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// data access
import { ProjectDataModel } from "../../dataaccess/models/ProjectDataModel";

// consts/enums
import { fetchProject, fetchProjects } from "./fetchers/projectFetcher";
import { deleteProject } from "./deleters/projectDeleter";

// utils
import { getParamsFromRequest } from "../utils/filterHelper";
import { addIdToBody } from "../utils/uuidHelper";
import { respondWithError, respondWithFailedValidation, respondWithItem, respondWithNotFound } from "../utils/responder";
import { mapApiToDbProject, ApiToDataAccessMapOptions } from "../../dataaccess/mappers/apiToDataAccessMappers";
import { mapDbToApiProject } from "../../dataaccess/mappers/dataAccessToApiMappers";
import { respondedWithMismatchedItemIds } from "../utils/validationResponders";
import { getInvalidPatchMessage, getPatchedItem } from "../utils/patcher";

export const projectsGetHandler = async (req: Request, res) => {
    const result = await fetchProjects();
    if (result.status === StatusCodes.OK) {
        res.json(result);
    } else {
        res.status(result.status).json({
            status: result.status,
            message: result.message
        });
        console.log(`Unable to fetch projects: ${result.message}`);
    }
};

export const projectPatchHandler = async (req: Request, res: Response) => {
    const queryParamItemId = req.params.projectId;
    if (!queryParamItemId) {
        respondWithFailedValidation(res, "Item ID is required in URI path for this operation");
        return;
    }
    const body = mapApiToDbProject(req.body, ApiToDataAccessMapOptions.ForPatch);
    const bodyItemId = body.id;
    if (respondedWithMismatchedItemIds(res, queryParamItemId, bodyItemId)) {
        return;
    }
    if (bodyItemId && bodyItemId !== queryParamItemId) {
        respondWithFailedValidation(
            res,
            `Item ID is optional, but if it is provided it should match the URI path item ID: ${bodyItemId} !== ${queryParamItemId}`
        );
        return;
    }
    try {
        const options = {
            where: { id: queryParamItemId }
        };
        const project = await ProjectDataModel.findOne(options);
        if (!project) {
            respondWithNotFound(res, `Unable to find project to patch with ID ${queryParamItemId}`);
        } else {
            const originalProject = mapDbToApiProject(project);
            const invalidPatchMessage = getInvalidPatchMessage(originalProject, body);
            if (invalidPatchMessage) {
                respondWithFailedValidation(res, `Unable to patch: ${invalidPatchMessage}`);
            } else {
                const newItem = getPatchedItem(originalProject, body);
                await project.update(newItem);
                respondWithItem(res, project, originalProject);
            }
        }
    } catch (err) {
        respondWithError(res, err);
    }
};

export const projectPostHandler = async (req: Request, res) => {
    const projectDataObject = mapApiToDbProject({ ...addIdToBody(req.body) });
    try {
        const addedProject = await ProjectDataModel.create(projectDataObject);
        res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            data: {
                item: addedProject
            }
        });
    } catch (err) {
        respondWithError(res, err);
    }
};

export const projectDeleteHandler = async (req: Request, res) => {
    const params = getParamsFromRequest(req);
    const result = await deleteProject(params.projectId);
    if (result.status === StatusCodes.OK) {
        res.json(result);
    } else {
        res.status(result.status).json({
            status: result.status,
            message: result.message
        });
        console.log(`Unable to delete project: ${result.message}`);
    }
};

export const projectGetHandler = async (req: Request, res: Response) => {
    const params = getParamsFromRequest(req);
    const result = await fetchProject(params.projectId);
    if (result.status === StatusCodes.OK) {
        res.json(result);
    } else {
        res.status(result.status).json({
            status: result.status,
            message: result.message
        });
        console.log(`Unable to fetch project: ${result.message}`);
    }
};
