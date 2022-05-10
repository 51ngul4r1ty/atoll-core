// externals
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as jwt from "jsonwebtoken";

// config
import { getAuthKey } from "@atoll/shared";

// interfaces/types
import { ROLE_USER, RefreshTokenContents } from "../../types";

// utils
import { buildAuthToken, buildRefreshToken } from "../utils/tokenHelper";
import { getSimpleUuid } from "../utils/uuidHelper";
import { buildMessageResponse, buildResponseWithItem } from "../utils/responseBuilder";

export const loginPostHandler = async (req: Request, res: Response) => {
    const username = req.body?.username;
    const password = req.body?.password;
    if (!username || !password) {
        const messageResponse = buildMessageResponse(StatusCodes.BAD_REQUEST, "username and password is required");
        res.status(messageResponse.status).send(messageResponse);
        return;
    }
    const authKey = getAuthKey();
    if (!authKey) {
        const messageResponse = buildMessageResponse(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Invalid configuration - auth key has not been set up"
        );
        res.status(messageResponse.status).send(messageResponse);
        return;
    }
    // TODO: Query the database to get list of users
    if (username === "test" && password === "atoll") {
        try {
            const refreshTokenId = getSimpleUuid();
            res.status(StatusCodes.OK).send({
                status: StatusCodes.OK,
                data: {
                    item: {
                        authToken: buildAuthToken("217796f6e1ab455a980263171099533f", username, ROLE_USER),
                        refreshToken: buildRefreshToken("217796f6e1ab455a980263171099533f", username, refreshTokenId)
                    }
                }
            });
            return;
        } catch (err) {
            const messageResponse = buildMessageResponse(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "An unknown error occurred while generating an auth token"
            );
            res.status(messageResponse.status).send(messageResponse);
            return;
        }
    } else {
        const messageResponse = buildMessageResponse(StatusCodes.UNAUTHORIZED, "Either username or password is incorrect");
        res.status(messageResponse.status).send(messageResponse);
        return;
    }
};

export const refreshTokenPostHandler = async (req: Request, res: Response) => {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken) {
        const messageResponse = buildMessageResponse(StatusCodes.BAD_REQUEST, "refreshToken is required");
        res.status(messageResponse.status).send(messageResponse);
        return;
    }
    const authKey = getAuthKey();
    if (!authKey) {
        const messageResponse = buildMessageResponse(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Invalid configuration - auth key has not been set up"
        );
        res.status(messageResponse.status).send(messageResponse);
        return;
    }
    try {
        let decoded: RefreshTokenContents;
        try {
            decoded = jwt.verify(refreshToken, authKey) as RefreshTokenContents;
        } catch (ex) {
            return res.status(StatusCodes.UNAUTHORIZED).send("Invalid refresh token.");
        }

        const responseWithItem = buildResponseWithItem({
            authToken: buildAuthToken("217796f6e1ab455a980263171099533f", decoded.username, ROLE_USER),
            refreshToken: buildRefreshToken("217796f6e1ab455a980263171099533f", decoded.username, decoded.refreshTokenId)
        });
        res.status(responseWithItem.status).send(responseWithItem);

        return;
    } catch (err) {
        const messageResponse = buildMessageResponse(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "An unknown error occurred while generating an auth token"
        );
        res.status(messageResponse.status).send(messageResponse);
        return;
    }
};
