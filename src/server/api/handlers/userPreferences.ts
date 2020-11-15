// externals
import { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";

// utils
import { getLoggedInAppUserId } from "../utils/authUtils";
import { FetcherErrorResponse } from "./fetchers/types";
import { userPreferencesFetcher } from "./fetchers/userPreferencesFetcher";

export const userPreferencesHandler = async function(req: Request, res: Response) {
    const userId = req.params.userId || "";
    const result = await userPreferencesFetcher(userId, () => getLoggedInAppUserId(req));
    if (result.status === HttpStatus.OK) {
        res.json(result);
    } else {
        const errorResult = result as FetcherErrorResponse;
        res.status(errorResult.status).json({
            status: errorResult.status,
            message: errorResult.message
        });
        console.log(`Unable to fetch user preferences: ${errorResult.message}`);
    }
};
