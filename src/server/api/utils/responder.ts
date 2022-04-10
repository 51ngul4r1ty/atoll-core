/**
 * Purpose: Provide standard ways to generate REST API responses using the Response object.
 */

// externals
import { logDebug, logError } from "api/handlers/utils/serverLogger";
import { Response } from "express";

// utils
import {
    buildBadRequestResponse,
    buildNotFoundResponse,
    buildNotImplementedResponse,
    buildOkResponse,
    buildResponseFromCatchError,
    buildResponseWithItem,
    RestApiStatusAndMessageOnly
} from "./responseBuilder";
import { getStackFromError } from "./errorUtils";

export const respondWithNotImplemented = (res: Response, message: string) => {
    const responseObj = buildNotImplementedResponse(message);
    respondWithObj(res, responseObj);
};

export const respondWithError = (res: Response, error: Error | string, contextMessage: string = "ERROR") => {
    const responseObj = buildResponseFromCatchError(error);
    const stack = getStackFromError(error);
    if (stack) {
        logError(`${contextMessage}: ${responseObj.message}`);
        logDebug(`STACK: ${stack}`);
    } else {
        logError(`${contextMessage}: ${responseObj.message}`);
    }
    respondWithObj(res, responseObj);
};

export const respondWithNotFound = (res: Response, message: string) => {
    const responseObj = buildNotFoundResponse(message);
    respondWithObj(res, responseObj);
};

export const respondWithFailedValidation = (res: Response, message: string) => {
    const responseObj = buildBadRequestResponse(message);
    respondWithObj(res, responseObj);
};

export const respondWithOk = (res: Response) => {
    const responseObj = buildOkResponse();
    respondWithObj(res, responseObj);
};

export type MetaWithOriginal<T> = {
    original: T;
};

export const respondWithObj = (res: Response, responseObj: any) => {
    if (responseObj.status) {
        res.status(responseObj.status).send(responseObj);
    } else {
        res.send(responseObj);
    }
};

export const respondWithMessageAndStatus = (res: Response, message: string, status: number) => {
    res.status(status).send({
        message,
        status
    });
};

export const respondWithMessage = (res: Response, responseObj: RestApiStatusAndMessageOnly) => {
    res.status(responseObj.status).send(responseObj);
};

/**
 * @deprecated This should not be used- see newer patterns.
 */
export const respondWithItem = (res: Response, data: object, original?: object, extra?: object) => {
    const message = undefined;
    const meta = original ? { original } : undefined;
    const response = buildResponseWithItem(data, extra, meta, message);
    respondWithObj(res, response);
};
