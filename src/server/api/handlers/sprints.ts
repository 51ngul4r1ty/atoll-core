// externals
import { Request } from "express";
import * as HttpStatus from "http-status-codes";

// utils
import { getParamsFromRequest } from "../utils/filterHelper";
import { addIdToBody } from "../utils/uuidHelper";
import { respondWithError } from "../utils/responder";

// data access
import { SprintModel } from "../../dataaccess/models/Sprint";

// consts/enums
import { sprintFetcher } from "./fetchers/sprintFetcher";

export const sprintsGetHandler = async (req: Request, res) => {
    const params = getParamsFromRequest(req);
    const result = await sprintFetcher(params.projectId);
    if (result.status === HttpStatus.OK) {
        res.json(result);
    } else {
        res.status(result.status).json({
            status: result.status,
            message: result.message
        });
        console.log(`Unable to fetch sprints: ${result.message}`);
    }
};

export const sprintPostHandler = async (req: Request, res) => {
    const bodyWithId = { ...addIdToBody(req.body) };
    try {
        const addedBacklogItem = await SprintModel.create(bodyWithId);
        res.status(HttpStatus.CREATED).json({
            status: HttpStatus.CREATED,
            data: {
                item: addedBacklogItem
            }
        });
    } catch (err) {
        respondWithError(res, err);
    }
};
