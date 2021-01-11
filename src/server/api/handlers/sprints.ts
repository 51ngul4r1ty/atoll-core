// externals
import { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";

// libraries
import { logger } from "@atoll/shared";

// data access
import { sequelize } from "../../dataaccess/connection";
import { SprintModel } from "../../dataaccess/models/Sprint";

// consts/enums
import { fetchSprint, fetchSprints } from "./fetchers/sprintFetcher";
import { deleteSprint } from "./deleters/sprintDeleter";

// utils
import { getParamFromRequest, getParamsFromRequest } from "../utils/filterHelper";
import { addIdToBody } from "../utils/uuidHelper";
import { respondWithError, respondWithFailedValidation, respondWithItem, respondWithNotFound } from "../utils/responder";
import { mapApiToDbSprint, ApiToDataAccessMapOptions } from "../../dataaccess/mappers/apiToDataAccessMappers";
import { mapDbToApiSprint } from "../../dataaccess/mappers/dataAccessToApiMappers";
import { respondedWithMismatchedItemIds } from "../utils/validationResponders";
import { getInvalidPatchMessage, getPatchedItem } from "../utils/patcher";
import { Transaction } from "sequelize";

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
    const body = mapApiToDbSprint(req.body, ApiToDataAccessMapOptions.ForPatch);
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
            const originalSprint = mapDbToApiSprint(sprint);
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
    const sprintDataObject = mapApiToDbSprint({ ...addIdToBody(req.body) });
    try {
        const addedSprint = await SprintModel.create(sprintDataObject);
        res.status(HttpStatus.CREATED).json({
            status: HttpStatus.CREATED,
            data: {
                item: addedSprint
            }
        });
    } catch (err) {
        respondWithError(res, err);
    }
};

export const sprintPutHandler = async (req: Request, res) => {
    const functionTag = "sprintPutHandler";
    const logContext = logger.info("starting call", [functionTag]);
    const queryParamItemId = req.params.sprintId;
    if (!queryParamItemId) {
        respondWithFailedValidation(res, "Item ID is required in URI path for this operation");
        return;
    }
    const bodyItemId = req.body.id;
    if (queryParamItemId != bodyItemId) {
        respondWithFailedValidation(
            res,
            `Item ID in URI path (${queryParamItemId}) should match Item ID in payload (${bodyItemId})`
        );
        return;
    }
    const newDataItem = mapApiToDbSprint(req.body);
    let transaction: Transaction;
    try {
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        const sprint = await SprintModel.findOne({
            where: { id: bodyItemId },
            transaction
        });
        if (!sprint) {
            if (transaction) {
                await transaction.commit();
                transaction = null;
            }
            respondWithNotFound(res, `Unable to find sprint to update with ID ${req.body.id}`);
        } else {
            const originalApiBacklogItem = mapDbToApiSprint(sprint);
            await sprint.update(newDataItem, { transaction });
            if (transaction) {
                await transaction.commit();
                transaction = null;
            }
            respondWithItem(res, newDataItem);
        }
        logger.info("completed call", [functionTag]);
    } catch (err) {
        const errLogContext = logger.warn(`handling error "${err}"`, [functionTag], logContext);
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

export const sprintGetHandler = async (req: Request, res: Response) => {
    const params = getParamsFromRequest(req);
    const result = await fetchSprint(params.sprintId);
    if (result.status === HttpStatus.OK) {
        res.json(result);
    } else {
        res.status(result.status).json({
            status: result.status,
            message: result.message
        });
        console.log(`Unable to fetch sprint: ${result.message}`);
    }
};
