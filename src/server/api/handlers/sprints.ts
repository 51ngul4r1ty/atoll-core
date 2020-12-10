// externals
import { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";

// data access
import { SprintModel } from "../../dataaccess/models/Sprint";

// consts/enums
import { fetchSprints } from "./fetchers/sprintFetcher";
import { deleteSprint } from "./deleters/sprintDeleter";

// utils
import { getParamFromRequest, getParamsFromRequest } from "../utils/filterHelper";
import { addIdToBody } from "../utils/uuidHelper";
import { respondWithError, respondWithFailedValidation, respondWithItem, respondWithNotFound } from "../utils/responder";
import { mapFromSprint, ApiToDataAccessMapOptions, mapToSprint } from "../../dataaccess/mappers/apiToDataAcessMappers";
import { respondedWithMismatchedItemIds } from "../utils/validationResponders";
import { getInvalidPatchMessage, getPatchedItem } from "../utils/patcher";

export const sprintsGetHandler = async (req: Request, res) => {
    const params = getParamsFromRequest(req);
    const archived = getParamFromRequest(req, "archived");
    let archivedValue: string;
    switch (archived) {
        case "true":
            archivedValue = "Y";
            break;
        case "false":
            archivedValue = "N";
            break;
        case null:
            archivedValue = null;
            break;
    }
    const result = await fetchSprints(params.projectId, archivedValue);
    if (result.status === HttpStatus.OK) {
        res.json(result);
    } else {
        res.status(result.status).json({
            status: result.status,
            message: result.message
        });
        console.log(`Unable to fetch sprints: ${result.message}`);
    }
};

export const sprintPatchHandler = async (req: Request, res: Response) => {
    const queryParamItemId = req.params.sprintId;
    if (!queryParamItemId) {
        respondWithFailedValidation(res, "Item ID is required in URI path for this operation");
        return;
    }
    const body = mapFromSprint(req.body, ApiToDataAccessMapOptions.ForPatch);
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
        const sprint = await SprintModel.findOne(options);
        if (!sprint) {
            respondWithNotFound(res, `Unable to find sprint to patch with ID ${queryParamItemId}`);
        } else {
            const originalSprint = mapToSprint(sprint);
            const invalidPatchMessage = getInvalidPatchMessage(originalSprint, body);
            if (invalidPatchMessage) {
                respondWithFailedValidation(res, `Unable to patch: ${invalidPatchMessage}`);
            } else {
                const newItem = getPatchedItem(originalSprint, body);
                await sprint.update(newItem);
                respondWithItem(res, sprint, originalSprint);
            }
        }
    } catch (err) {
        respondWithError(res, err);
    }
};

export const sprintPostHandler = async (req: Request, res) => {
    const sprintDataObject = mapFromSprint({ ...addIdToBody(req.body) });
    try {
        const addedBacklogItem = await SprintModel.create(sprintDataObject);
        res.status(HttpStatus.CREATED).json({
            status: HttpStatus.CREATED,
            data: {
                item: addedBacklogItem
            }
        });
    } catch (err) {
        respondWithError(res, err);
    }
};

export const sprintDeleteHandler = async (req: Request, res) => {
    const params = getParamsFromRequest(req);
    const result = await deleteSprint(params.sprintId);
    if (result.status === HttpStatus.OK) {
        res.json(result);
    } else {
        res.status(result.status).json({
            status: result.status,
            message: result.message
        });
        console.log(`Unable to delete sprint: ${result.message}`);
    }
};
