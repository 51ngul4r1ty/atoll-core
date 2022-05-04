// externals
import { Request, Response } from "express";

// libraries
import { respondWithNotImplemented, respondWithObj } from "../utils/responder";

// consts/enums
import { FEATURE_TOGGLE_LIST } from "../../api/data/featureToggles";
import { buildResponseWithItem } from "api/utils/responseBuilder";

export const featureTogglesHandler = function (req: Request, res: Response) {
    const userId = req.params.userId || "";
    if (userId !== "--self--") {
        respondWithNotImplemented(
            res,
            "This endpoint is intended as an admin endpoint, so a typical user would not be able to use it."
        );
    } else {
        respondWithObj(res, buildResponseWithItem(FEATURE_TOGGLE_LIST));
    }
};
