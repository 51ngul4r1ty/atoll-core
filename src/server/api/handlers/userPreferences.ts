// externals
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as findPackageJson from "find-package-json";

// libraries
import { timeNow } from "@atoll/shared";

// interfaces/types
import type { RestApiErrorResult } from "../utils/responseBuilder";

// utils
import { getLoggedInAppUserId } from "../utils/authUtils";
import { getUserPreferences } from "./fetchers/userPreferencesFetcher";

export const userPreferencesHandler = async function (req: Request, res: Response) {
    const packageJson = findPackageJson(__dirname);
    const packageJsonContents = packageJson.next().value;
    const version = packageJsonContents.version;
    const userId = req.params.userId || "";
    const result = await getUserPreferences(userId, () => getLoggedInAppUserId(req));
    if (result.status === StatusCodes.OK) {
        // NOTE: X-Atoll-Info also reports version info (app & library versions) at api/vi endpoint.
        res.header("x-app-version", version).header("x-server-time", timeNow().toISOString()).json(result);
    } else {
        const errorResult = result as RestApiErrorResult;
        res.status(errorResult.status).json({
            status: errorResult.status,
            message: errorResult.message
        });
        console.log(`Unable to fetch user preferences: ${errorResult.message}`);
    }
};
