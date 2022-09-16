// externals
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as findPackageJson from "find-package-json";

// libraries
import { timeNow } from "@atoll/shared";

// interfaces/types
import { buildNotFoundResponse, buildResponseWithItem, RestApiErrorResult } from "../utils/responseBuilder";

// utils
import { getLoggedInAppUserId } from "../utils/authUtils";
import { getUserPreferences } from "./fetchers/userPreferencesFetcher";
import { mapDbToApiUserSettings } from "../../dataaccess/mappers/dataAccessToApiMappers";
import { UserSettingsDataModel } from "../../dataaccess/models/UserSettingsDataModel";
import { patchUserPreferences } from "./updaters/userPreferencesUpdater";
import {
    beginSerializableTransaction,
    finish,
    handleFailedValidationResponse,
    handleSuccessResponse,
    handleUnexpectedErrorResponse,
    start
} from "./utils/handlerContext";
import { respondWithObj } from "api/utils/responder";

export const userPreferencesGetHandler = async function (req: Request, res: Response) {
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

export const userPreferencesPatchHandler = async function (req: Request, res: Response) {
    const handlerContext = start("userPreferencesPatchHandler", res);
    try {
        const userId = req.params.userId || "";
        if (userId !== "--self--") {
            await handleFailedValidationResponse(
                handlerContext,
                "This endpoint is intended as an admin endpoint, so a typical user would not be able to use it."
            );
        } else {
            await beginSerializableTransaction(handlerContext);
            const appuserId = getLoggedInAppUserId(req);
            let dbUserSettings: any = await UserSettingsDataModel.findOne({
                where: { appuserId }
            });
            if (dbUserSettings) {
                const originalApiUserSettings = mapDbToApiUserSettings(dbUserSettings);
                const newDataItem = await patchUserPreferences(
                    handlerContext,
                    req.body,
                    originalApiUserSettings,
                    dbUserSettings,
                    userId
                );

                const extra = undefined;
                const meta = undefined;
                await handleSuccessResponse(handlerContext, buildResponseWithItem(newDataItem, extra, meta));
            } else {
                return buildNotFoundResponse("Unable to patch user settings- object was not found for this user");
            }
            finish(handlerContext);
        }
    } catch (err) {
        await handleUnexpectedErrorResponse(handlerContext, err);
    }
};
