// externals
import { StatusCodes } from "http-status-codes";

// utils
import { getMessageFromError, getStackFromError } from "./errorUtils";
import { isStatusError } from "./httpStatusHelper";

export type RestApiStatusAndMessageOnly = {
    status: number;
    message?: string;
};

export type RestApiErrorResult = RestApiStatusAndMessageOnly & {
    stack?: string;
};

export type RestApiBaseResult<T, U = undefined, V = undefined> = {
    status: number;
    data: T;
    extra?: U;
    meta?: V;
    message?: string;
};

export type RestApiDataResult<T, U = undefined> = RestApiBaseResult<T, U>;
/**
 * NOTE: extra embedded in the "data" node is a legacy construct and will be removed in future.
 */
export type RestApiItemResult<T, U = undefined, V = undefined> = RestApiBaseResult<{ item: T; extra?: any }, U, V>;
export type RestApiCollectionResult<T, U = undefined, V = undefined> = RestApiBaseResult<{ items: T[] }, U, V>;

export const buildResponseWithData = <T, U = undefined>(data: T, extra?: U, message?: string): RestApiDataResult<T, U> => {
    const result: RestApiDataResult<T, U> = {
        status: StatusCodes.OK,
        data
    };
    if (extra) {
        result.extra = extra;
    }
    if (message) {
        result.message = message;
    }
    return result;
};

export const buildResponseWithItems = <T, U = undefined>(
    items: T[] | null | undefined,
    extra?: U,
    message?: string
): RestApiCollectionResult<T, U> => {
    const result: RestApiCollectionResult<T, U> = {
        status: StatusCodes.OK,
        data: {
            items: items || []
        }
    };
    if (extra) {
        result.extra = extra;
    }
    if (message) {
        result.message = message;
    }
    return result;
};

export const buildResponseWithItem = <T, U = undefined, V = undefined>(
    item: T,
    extra?: U,
    meta?: V,
    message?: string
): RestApiItemResult<T, U, V> => {
    const result: RestApiItemResult<T, U, V> = {
        status: StatusCodes.OK,
        data: {
            item
        }
    };
    if (extra) {
        result.data.extra = extra;
    }
    if (meta) {
        result.meta = meta;
    }
    if (message) {
        result.message = message;
    }
    return result;
};

export const buildMessageResponse = (status: number, message: string): RestApiStatusAndMessageOnly => ({
    status,
    message
});

export const buildOkResponse = (message?: string): RestApiStatusAndMessageOnly => {
    const result: RestApiStatusAndMessageOnly = {
        status: StatusCodes.OK
    };
    if (message) {
        result.message = message;
    }
    return result;
};

export const buildNotImplementedResponse = (message?: string): RestApiErrorResult =>
    buildMessageResponse(StatusCodes.NOT_IMPLEMENTED, message) as RestApiErrorResult;

export const buildBadRequestResponse = (message?: string): RestApiErrorResult =>
    buildMessageResponse(StatusCodes.BAD_REQUEST, message) as RestApiErrorResult;

export const buildNotFoundResponse = (message?: string): RestApiErrorResult =>
    buildMessageResponse(StatusCodes.NOT_FOUND, message) as RestApiErrorResult;

export const buildInternalServerErrorResponse = (message: string): RestApiErrorResult =>
    buildMessageResponse(StatusCodes.INTERNAL_SERVER_ERROR, message) as RestApiErrorResult;

export type ErrorOptions = {
    includeStack?: boolean;
};

export const buildResponseFromCatchError = (error: Error | string, errorOptions: ErrorOptions = {}): RestApiErrorResult => {
    const message = getMessageFromError(error);
    const result = buildInternalServerErrorResponse(message);
    if (errorOptions.includeStack) {
        const stack = getStackFromError(error);
        result.stack = stack;
    }
    return result;
};

export const isRestApiErrorResult = (response: RestApiBaseResult<any> | RestApiErrorResult): response is RestApiErrorResult =>
    isStatusError(response?.status);

/**
 * A type guard that returns whether this result represents a successful item result or not.
 * @returns true if successful result, false if error result
 */
export const isRestApiItemResult = <T, U = undefined>(
    response: RestApiItemResult<T, U> | RestApiErrorResult
): response is RestApiItemResult<T, U> => {
    return !isRestApiErrorResult(response);
};

/**
 * A type guard that returns whether this result represents a successful collection result or not.
 * @returns true if successful result, false if error result
 */
export const isRestApiCollectionResult = <T, U = undefined>(
    response: RestApiCollectionResult<T, U> | RestApiErrorResult
): response is RestApiCollectionResult<T, U> => {
    return !isRestApiErrorResult(response);
};
