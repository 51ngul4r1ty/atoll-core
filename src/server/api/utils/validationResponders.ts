// externals
import { Response } from "express";

// utils
import { respondWithFailedValidation } from "./responder";

export const respondedWithMismatchedItemIds = (res: Response, queryParamItemId: string, bodyItemId: string): boolean => {
    if (bodyItemId && bodyItemId !== queryParamItemId) {
        respondWithFailedValidation(
            res,
            `Item ID is optional, but if it is provided it should match the URI path item ID: ${bodyItemId} !== ${queryParamItemId}`
        );
        return true;
    }
    return false;
};
