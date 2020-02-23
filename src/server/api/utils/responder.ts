// externals
import { Response } from "express";
import * as HttpStatus from "http-status-codes";

export const respondWithNotImplemented = (res: Response, message: string) => {
    res.status(HttpStatus.NOT_IMPLEMENTED).send({
        message,
        status: HttpStatus.NOT_IMPLEMENTED
    });
};

export const respondWithOk = (res: Response, data: object) => {
    res.send({ data, status: HttpStatus.OK });
};
