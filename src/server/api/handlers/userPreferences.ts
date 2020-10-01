// externals
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";

// libraries
import { respondWithNotImplemented, respondWithItem } from "../utils/responder";
import { AuthTokenContents } from "types";
import { getAuthKey } from "@atoll/shared";
import { UserSettingsModel, mapToUserSettings } from "dataaccess";

// TODO: Move this to a utility file
const getLoggedInAppUserId = (req: Request) => {
    const authKey = getAuthKey();
    if (!authKey) {
        return null;
    }
    const authHeader = (req.headers["x-auth-token"] as string) || (req.headers["authorization"] as string);
    if (!authHeader) {
        return null;
    }
    const authHeaderPrefix = "Bearer  ";
    if (!authHeader.startsWith(authHeaderPrefix)) {
        return null;
    }
    const token = authHeader.substr(authHeaderPrefix.length);
    let decoded: AuthTokenContents;
    try {
        decoded = jwt.verify(token, authKey) as AuthTokenContents;
    } catch (ex) {
        decoded = null;
    }
    if (!decoded) {
        return null;
    }
    let expirationDate: Date;
    try {
        expirationDate = new Date(decoded.expirationDate);
    } catch (ex) {
        expirationDate = null;
    }
    if (!expirationDate) {
        return null;
    }
    const now = new Date();
    const stillValid = expirationDate.getTime() >= now.getTime();
    if (!stillValid) {
        return null;
    }
    return decoded.userId;
};

export const userPreferencesHandler = async function(req: Request, res: Response) {
    const userId = req.params.userId || "";
    if (userId !== "{self}") {
        respondWithNotImplemented(
            res,
            "This endpoint is intended as an admin endpoint, so a typical user would not be able to use it."
        );
    } else {
        const appuserId = getLoggedInAppUserId(req);
        let userSettingsItem: any = await UserSettingsModel.findOne({
            where: { appuserId }
        });
        if (userSettingsItem) {
            const userSettingsItemTyped = mapToUserSettings(userSettingsItem);
            respondWithItem(res, userSettingsItemTyped);
        } else {
            respondWithItem(res, {
                /* NOTE: To test browser dark mode prefs on/off just toggle this - it will move to DB later */
                detectBrowserDarkMode: true
            });
        }
    }
};
