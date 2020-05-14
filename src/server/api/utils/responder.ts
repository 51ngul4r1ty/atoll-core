// externals
import { Response } from "express";
import * as HttpStatus from "http-status-codes";

export const respondWithStatus = (res: Response, message: string, status: number) => {
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

export const respondWithOk = (res: Response, data?: object) => {
    res.send({ data, status: HttpStatus.OK });
};
