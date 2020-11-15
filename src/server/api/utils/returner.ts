// externals
import * as HttpStatus from "http-status-codes";

export const returnWithStatus = (message: string, status: number) => {
    return {
        message,
        status
    };
};

export const returnWithNotImplemented = (message: string) => {
    return returnWithStatus(message, HttpStatus.NOT_IMPLEMENTED);
};

export const returnWithError = (message: string) => {
    return returnWithStatus(message, HttpStatus.INTERNAL_SERVER_ERROR);
};

export const returnWithNotFound = (message: string) => {
    return returnWithStatus(message, HttpStatus.NOT_FOUND);
};

export const returnWithFailedValidation = (message: string) => {
    return returnWithStatus(message, HttpStatus.BAD_REQUEST);
};

export const returnWithOk = () => {
    return { status: HttpStatus.OK };
};

export type ResponseBase = "item" | "items";

export interface ResponseItemStructure<T> {
    data: {
        item: T;
    };
    status: number;
    meta?: {
        original: T;
    };
}

export interface ResponseCollectionStructure<T> {
    data: {
        items: T[];
    };
    status: number;
    meta?: {
        original: T[];
    };
}

export type ResponseStructure<T> = ResponseItemStructure<T> | ResponseCollectionStructure<T>;

export const returnWithItem = <T>(data: T, original?: T): ResponseItemStructure<T> => {
    const responseObj: ResponseItemStructure<T> = { data: { item: data }, status: HttpStatus.OK };
    if (original) {
        return { ...responseObj, meta: { original } };
    } else {
        return responseObj;
    }
};

export const returnWithItems = <T>(data: T[], original?: T[]): ResponseCollectionStructure<T> => {
    const responseObj: ResponseCollectionStructure<T> = { data: { items: data }, status: HttpStatus.OK };
    if (original) {
        return { ...responseObj, meta: { original } };
    } else {
        return responseObj;
    }
};
