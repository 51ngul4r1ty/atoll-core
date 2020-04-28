// externals
import * as jwt from "jsonwebtoken";
import * as HttpStatus from "http-status-codes";

// libraries
import { getAuthKey } from "@atoll/shared";

export default function(req, res, next) {
    const authHeader: string = req.headers["x-auth-token"] || req.headers["authorization"];
    if (!authHeader) {
        return res.status(HttpStatus.UNAUTHORIZED).send("Access denied. No token provided.");
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
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Invalid configuration - auth key has not been set up");
        return;
    }

    try {
        const decoded = jwt.verify(token, authKey);
        req.user = decoded;
        next();
    } catch (ex) {
        // if invalid token
        res.status(HttpStatus.BAD_REQUEST).send("Invalid token.");
    }
}
