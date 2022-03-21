// externals
import { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";

// interfaces/types
import type { RestApiErrorResult } from "../utils/responseBuilder";

// utils
import { getLoggedInAppUserId } from "../utils/authUtils";
import { getUserPreferences } from "./fetchers/userPreferencesFetcher";

export const userPreferencesHandler = async function (req: Request, res: Response) {
    const userId = req.params.userId || "";
    const result = await getUserPreferences(userId, () => getLoggedInAppUserId(req));
    if (result.status === HttpStatus.OK) {
        res.json(result);
    } else {
        const errorResult = result as RestApiErrorResult;
        res.status(errorResult.status).json({
            status: errorResult.status,
            message: errorResult.message
        });
        console.log(`Unable to fetch user preferences: ${errorResult.message}`);
    }
};
