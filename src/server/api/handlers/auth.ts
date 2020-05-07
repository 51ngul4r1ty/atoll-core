// externals
import { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";
import * as jwt from "jsonwebtoken";

// config
import { getAuthKey } from "@atoll/shared";

// interfaces/types
import { ROLE_USER, RefreshTokenContents } from "../../types";
import { buildAuthToken, buildRefreshToken } from "api/utils/tokenHelper";
import { getSimpleUuid } from "api/utils/uuidHelper";

export const loginPostHandler = async (req: Request, res: Response) => {
    const username = req.body?.username;
    const password = req.body?.password;
    if (!username || !password) {
        res.status(HttpStatus.BAD_REQUEST).send("username and password is required");
        return;
    }
    const authKey = getAuthKey();
    if (!authKey) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Invalid configuration - auth key has not been set up");
        return;
    }
    if (username === "test" && password === "atoll") {
        try {
            const refreshTokenId = getSimpleUuid();
            res.status(HttpStatus.OK).send({
                status: HttpStatus.OK,
                data: {
                    item: {
                        authToken: buildAuthToken("test-id", username, ROLE_USER),
                        refreshToken: buildRefreshToken("test-id", username, refreshTokenId)
                    }
                }
            });
            return;
        } catch (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("An unknown error occurred while generating an auth token");
            return;
        }
    } else {
        res.status(HttpStatus.UNAUTHORIZED).send("Either username or password is incorrect");
        return;
    }
};

export const refreshTokenPostHandler = async (req: Request, res: Response) => {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken) {
        res.status(HttpStatus.BAD_REQUEST).send("refreshToken is required");
        return;
    }
    const authKey = getAuthKey();
    if (!authKey) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Invalid configuration - auth key has not been set up");
        return;
    }
    try {
        let decoded: RefreshTokenContents;
        try {
            decoded = jwt.verify(refreshToken, authKey) as RefreshTokenContents;
        } catch (ex) {
            return res.status(HttpStatus.FORBIDDEN).send("Invalid refresh token.");
        }

        res.status(HttpStatus.OK).send({
            status: HttpStatus.OK,
            data: {
                item: {
                    authToken: buildAuthToken("test-id", decoded.username, ROLE_USER),
                    refreshToken: buildRefreshToken("test-id", decoded.username, decoded.refreshTokenId)
                }
            }
        });
        return;
    } catch (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("An unknown error occurred while generating an auth token");
        return;
    }
};
