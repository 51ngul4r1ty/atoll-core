// externals
import * as jwt from "jsonwebtoken";

// config
import { getAuthKey, getAuthTokenExpirationSeconds, timeNow, addSeconds } from "@atoll/shared";

// interfaces/types
import { AuthTokenContents, Role, RefreshTokenContents } from "../../types";

export const buildAuthToken = (userId: string, username: string, role: Role) => {
    const authKey = getAuthKey();
    const expirationDate = addSeconds(timeNow(), getAuthTokenExpirationSeconds());
    const authTokenContents: AuthTokenContents = {
        userId,
        username,
        expirationDate: expirationDate.toISOString(),
        role
    };
    const token = jwt.sign(authTokenContents, authKey);
    return token;
};

export const buildRefreshToken = (userId: string, username: string, refreshTokenId: string) => {
    const authKey = getAuthKey();
    const authTokenContents: RefreshTokenContents = {
        userId,
        username,
        refreshTokenId
    };
    const token = jwt.sign(authTokenContents, authKey);
    return token;
};
