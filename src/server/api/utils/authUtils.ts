// externals
import * as jwt from "jsonwebtoken";
import { Request } from "express";

// libraries
import { getAuthKey, timeNow } from "@atoll/shared";

// interfaces/types
import { AuthTokenContents } from "../../types";

export const getLoggedInAppUserId = (req: Request) => {
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
    const nowDate = timeNow();
    const stillValid = expirationDate.getTime() >= nowDate.getTime();
    if (!stillValid) {
        return null;
    }
    return decoded.userId;
};
