// externals
import * as HttpStatus from "http-status-codes";

// utils
import { getMessageFromError } from "./errorUtils";
import { isStatusError } from "./httpStatusHelper";

export type RestApiErrorResult = {
    status: number;
    message?: string;
};

export type RestApiBaseResult<T, U = undefined> = {
    status: number;
    data: T;
    extra?: U;
    message?: string;
};

export type RestApiDataResult<T, U = undefined> = RestApiBaseResult<T, U>;
export type RestApiItemResult<T, U = undefined> = RestApiBaseResult<{ item: T }, U>;
export type RestApiCollectionResult<T, U = undefined> = RestApiBaseResult<{ items: T[] }, U>;

export const buildResponseWithData = <T, U = undefined>(data: T, extra?: U, message?: string): RestApiDataResult<T, U> => {
    const result: RestApiDataResult<T, U> = {
        status: HttpStatus.OK,
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
        status: HttpStatus.OK,
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

export const buildResponseWithItem = <T, U = undefined>(item: T, extra?: U, message?: string): RestApiItemResult<T, U> => {
    const result: RestApiItemResult<T, U> = {
        status: HttpStatus.OK,
        data: {
            item
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

export const buildNotFoundResponse = (message?: string): RestApiErrorResult => {
    return {
        status: HttpStatus.NOT_FOUND,
        message
    };
};

export const buildInternalServerErrorResponse = (message: string): RestApiErrorResult => {
    return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message
    };
};

export const buildResponseFromCatchError = (error: Error): RestApiErrorResult => {
    return buildInternalServerErrorResponse(getMessageFromError(error));
};

export const isRestApiErrorResult = (response: RestApiBaseResult<any> | RestApiErrorResult): response is RestApiErrorResult =>
    isStatusError(response.status);

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
