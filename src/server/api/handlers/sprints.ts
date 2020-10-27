// externals
import { Request } from "express";
import * as HttpStatus from "http-status-codes";

// utils
import { getParamsFromRequest } from "../utils/filterHelper";

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
            message: result.error.msg
        });
        console.log(`Unable to fetch sprints: ${result.error.msg}`);
    }
};
