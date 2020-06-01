// externals
import { Request, Response } from "express";

// libraries
import { respondWithNotImplemented, respondWithItem } from "../utils/responder";

export const userPreferencesHandler = function(req: Request, res: Response) {
    const userId = req.params.userId || "";
    if (userId !== "{self}") {
        respondWithNotImplemented(
            res,
            "This endpoint is intended as an admin endpoint, so a typical user would not be able to use it."
        );
    } else {
        respondWithItem(res, {
            /* NOTE: To test browser dark mode prefs on/off just toggle this - it will move to DB later */
            detectBrowserDarkMode: true
        });
    }
};
