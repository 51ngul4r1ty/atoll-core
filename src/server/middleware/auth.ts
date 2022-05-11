// externals
import * as jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

// libraries
import { getAuthKey, timeNow } from "@atoll/shared";

// interfaces/types
import { AuthTokenContents } from "../types";

export default function (req, res, next) {
    const authHeader: string = req.headers["x-auth-token"] || req.headers["authorization"];
    if (!authHeader) {
        return res.status(StatusCodes.UNAUTHORIZED).send("Access denied. No token provided.");
    }
    const authHeaderPrefix = "Bearer  ";
    let token: string;
    if (authHeader.startsWith(authHeaderPrefix)) {
        token = authHeader.substr(authHeaderPrefix.length);
    } else {
        token = "";
    }

    const authKey = getAuthKey();
    if (!authKey) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Invalid configuration - auth key has not been set up");
        return;
    }

    let decoded: any;
    try {
        decoded = jwt.verify(token, authKey) as AuthTokenContents;
    } catch (ex) {
        return res.status(StatusCodes.UNAUTHORIZED).send("Invalid token.");
    }
    let expirationDate: Date;
    try {
        expirationDate = new Date(decoded.expirationDate);
    } catch (ex) {
        return res.status(StatusCodes.UNAUTHORIZED).send("Invalid expirated date in token.");
    }
    const nowDate = timeNow();
    const stillValid = expirationDate.getTime() >= nowDate.getTime();
    if (!stillValid) {
        return res.status(StatusCodes.UNAUTHORIZED).send("Token has expired.");
    }
    req.user = decoded;
    next();
}
