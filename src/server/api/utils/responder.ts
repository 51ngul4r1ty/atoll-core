// externals
import { Response } from "express";
import * as HttpStatus from "http-status-codes";

export const respondWithStatus = (res: Response, rawMessageOrError: any, status: number) => {
    let message: string;
    if (typeof rawMessageOrError === "string") {
        message = rawMessageOrError;
    } else if (rawMessageOrError.message) {
        message = rawMessageOrError.message;
        console.log(`ERROR: ${message}`);
        console.log(`STACK: ${rawMessageOrError.stack}`);
    } else {
        message = `${rawMessageOrError}`;
    }
    res.status(status).send({
        message,
        status
    });
};

export const respondWithNotImplemented = (res: Response, message: string) => {
    respondWithStatus(res, message, HttpStatus.NOT_IMPLEMENTED);
};

export const respondWithError = (res: Response, message: string) => {
    respondWithStatus(res, message, HttpStatus.INTERNAL_SERVER_ERROR);
};

export const respondWithNotFound = (res: Response, message: string) => {
    respondWithStatus(res, message, HttpStatus.NOT_FOUND);
};

export const respondWithFailedValidation = (res: Response, message: string) => {
    respondWithStatus(res, message, HttpStatus.BAD_REQUEST);
};

export const respondWithOk = (res: Response) => {
    const responseObj = { status: HttpStatus.OK };
    res.send(responseObj);
};

export const respondWithBase = (res: Response, base: string, baseData: object, original?: object, extra?: object) => {
    const responseObj: any = { data: { [base]: baseData }, status: HttpStatus.OK };
    if (extra) {
        responseObj.data.extra = extra;
    }
    if (original) {
        res.send({ ...responseObj, meta: { original } });
    } else {
        res.send(responseObj);
    }
};

export const respondWithItem = (res: Response, data: object, original?: object, extra?: object) => {
    respondWithBase(res, "item", data, original, extra);
};

export const respondWithItems = (res: Response, data: object, original?: object, extra?: object) => {
    respondWithBase(res, "items", data, original, extra);
};
