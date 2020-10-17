// externals
import { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";

// utils
import { getLoggedInAppUserId } from "../utils/authUtils";
import { userPreferencesFetcher } from "./fetchers/userPreferencesFetcher";

export const userPreferencesHandler = async function(req: Request, res: Response) {
    const userId = req.params.userId || "";
    const result = await userPreferencesFetcher(userId, () => getLoggedInAppUserId(req));
    if (result.status === HttpStatus.OK) {
        res.json(result);
    } else {
        res.status(result.status).json({
            status: result.status,
            error: {
                msg: result.error.msg
            }
        });
        console.log(`Unable to fetch user preferences: ${result.error.msg}`);
    }
};
