// externals
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";

// libraries
import { ApiSprint, DateOnly, determineSprintStatus, logger, SprintStatus } from "@atoll/shared";

// data access
import { sequelize } from "../../dataaccess/connection";
import { SprintDataModel } from "../../dataaccess/models/SprintDataModel";

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
import {
    beginSerializableTransaction,
    commitWithOkResponseIfNotAborted,
    finish,
    handleSuccessResponse,
    handleUnexpectedErrorResponse,
    rollbackWithMessageAndStatus,
    start
} from "./utils/handlerContext";
import { buildResponseWithItem, isRestApiCollectionResult, isRestApiItemResult } from "api/utils/responseBuilder";

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
    if (result.status === StatusCodes.OK) {
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
        const sprint = await SprintDataModel.findOne(options);
        if (!sprint) {
            respondWithNotFound(res, `Unable to find sprint to patch with ID ${queryParamItemId}`);
        } else {
            const invalidPatchMessage = getInvalidPatchMessage(sprint, body);
            if (invalidPatchMessage) {
                respondWithFailedValidation(res, `Unable to patch: ${invalidPatchMessage}`);
            } else {
                const originalSprint = mapDbToApiSprint(sprint);
                const newItem = getPatchedItem(sprint, body);
                await sprint.update(newItem);
                const apiSprint = mapDbToApiSprint(sprint);
                respondWithItem(res, apiSprint, originalSprint);
            }
        }
    } catch (err) {
        respondWithError(res, err);
    }
};

export const sprintPostHandler = async (req: Request, res) => {
    const sprintDataObject = mapApiToDbSprint({ ...addIdToBody(req.body) });
    try {
        const addedSprint = await SprintDataModel.create(sprintDataObject);
        res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            data: {
                item: addedSprint
            }
        });
    } catch (err) {
        respondWithError(res, err);
    }
};

export const validateSprintOverlap = async (
    newDataItem: ApiSprint,
    transaction: Transaction,
    date: any,
    res: Response,
    functionTag: string
) => {
    const options = {
        where: {
            [Op.and]: [
                {
                    startdate: {
                        [Op.lte]: date
                    }
                },
                {
                    finishdate: {
                        [Op.gte]: date
                    }
                },
                {
                    id: {
                        [Op.ne]: newDataItem.id
                    }
                }
            ]
        },
        transaction
    };
    const existingSprintOverlappingStart = await SprintDataModel.findAll(options);
    if (existingSprintOverlappingStart.length) {
        const firstItem = existingSprintOverlappingStart[0] as any;
        respondWithFailedValidation(
            res,
            `Unable to update sprint because it overlaps an existing sprint ${firstItem.dataValues.name}`
        );
        logger.warn("validation failed- sprint range overlaps", [functionTag]);
        return false;
    }
    return true;
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
    // TODO: Make sure this same validation happens in POST and PATCH
    if (newDataItem.startdate > newDataItem.finishdate) {
        respondWithFailedValidation(
            res,
            `Start date (${newDataItem.startdate}) should come before finish date (${newDataItem.finishdate})`
        );
        return;
    }
    let transaction: Transaction;
    try {
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        if (!(await validateSprintOverlap(newDataItem as ApiSprint, transaction, newDataItem.startdate, res, functionTag))) {
            return;
        }
        if (!(await validateSprintOverlap(newDataItem as ApiSprint, transaction, newDataItem.finishdate, res, functionTag))) {
            return;
        }

        const sprint = await SprintDataModel.findOne({
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
    if (result.status === StatusCodes.OK) {
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
    const handlerContext = start("sprintGetHandler", res);

    try {
        await beginSerializableTransaction(handlerContext);

        const params = getParamsFromRequest(req);
        const result = await fetchSprint(params.sprintId, handlerContext.transactionContext.transaction);
        if (isRestApiItemResult(result)) {
            await handleSuccessResponse(handlerContext, result);
        } else {
            await rollbackWithMessageAndStatus(handlerContext, result.message, result.status);
            console.log(`Unable to fetch sprint: ${result.message}`);
        }
        finish(handlerContext);
    } catch (err) {
        await handleUnexpectedErrorResponse(handlerContext, err);
    }
};

export const projectSprintGetHandler = async (req: Request, res: Response) => {
    const handlerContext = start("projectSprintGetHandler", res);

    try {
        await beginSerializableTransaction(handlerContext);

        const params = getParamsFromRequest(req);
        let descrip: string;
        switch (params.sprintId) {
            case "--curr--": {
                descrip = '"current" sprint';
                break;
            }
            case "--next--": {
                descrip = '"next" sprint';
                break;
            }
            default: {
                descrip = `sprint with ID ${params.sprintId}`;
                break;
            }
        }
        const result = await fetchSprints(params.projectId);
        if (isRestApiCollectionResult(result)) {
            const sprints = result.data.items;
            let matchingSprints: ApiSprint[];
            switch (params.sprintId) {
                case "--curr--": {
                    matchingSprints = sprints.filter((sprint: ApiSprint) => {
                        const status = determineSprintStatus(
                            DateOnly.fromISODate(sprint.startdate),
                            DateOnly.fromISODate(sprint.finishdate)
                        );
                        return status === SprintStatus.InProgress;
                    });
                    break;
                }
                case "--next--": {
                    let firstMatch = true;
                    matchingSprints = sprints.filter((sprint: ApiSprint) => {
                        const status = determineSprintStatus(
                            DateOnly.fromISODate(sprint.startdate),
                            DateOnly.fromISODate(sprint.finishdate)
                        );
                        const match = status === SprintStatus.NotStarted;
                        const result = match && firstMatch;
                        if (match) {
                            firstMatch = false;
                        }
                        return result;
                    });
                    break;
                }
                default: {
                    matchingSprints = sprints.filter((sprint: ApiSprint) => {
                        return sprint.id === params.sprintId;
                    });
                    break;
                }
            }
            const sprintCount = matchingSprints.length;
            if (sprintCount > 1) {
                throw new Error(`Unexpected condition- more than one (${sprintCount}) ${descrip}`);
            } else if (sprintCount === 0) {
                await rollbackWithMessageAndStatus(handlerContext, `Unable to find a ${descrip}!`, StatusCodes.NOT_FOUND);
            } else {
                await handleSuccessResponse(handlerContext, buildResponseWithItem(matchingSprints[0]));
            }
        } else {
            await rollbackWithMessageAndStatus(handlerContext, result.message, result.status);
            console.log(`Unable to fetch ${descrip}: ${result.message}`);
        }
        finish(handlerContext);
    } catch (err) {
        await handleUnexpectedErrorResponse(handlerContext, err);
    }
};
