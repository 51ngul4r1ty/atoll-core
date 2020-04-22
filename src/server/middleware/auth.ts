// externals
import * as jwt from "jsonwebtoken";
import * as HttpStatus from "http-status-codes";

// libraries
import { getAuthKey } from "@atoll/shared";

export default function(req, res, next) {
    const token = req.headers["x-auth-token"] || req.headers["authorization"];
    if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).send("Access denied. No token provided.");
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
