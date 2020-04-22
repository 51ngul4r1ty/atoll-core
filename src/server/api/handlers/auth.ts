// externals
import { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";

// config
import { getAuthKey } from "@atoll/shared";

// interfaces/types
import { ROLE_USER } from "../../types";
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
                authToken: buildAuthToken("test-id", username, ROLE_USER),
                refreshToken: buildRefreshToken("test-id", username, refreshTokenId)
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

export const createUserPostHandler = async (req: Request, res: Response) => {
    res.status(HttpStatus.NOT_IMPLEMENTED).send("Unable to create new user - not implemented yet.");
    // validate the request body first
    // const { error } = validate(req.body);
    // if (error) return res.status(400).send(error.details[0].message);

    // //find an existing user
    // let user = await User.findOne({ email: req.body.email });
    // if (user) return res.status(400).send("User already registered.");

    // user = new User({
    //     name: req.body.name,
    //     password: req.body.password,
    //     email: req.body.email
    // });
    // user.password = await bcrypt.hash(user.password, 10);
    // await user.save();

    // const token = user.generateAuthToken();
    // res.header("x-auth-token", token).send({
    //     _id: user._id,
    //     name: user.name,
    //     email: user.email
    // });
};
