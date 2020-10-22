// externals
import { Request } from "express";
import * as HttpStatus from "http-status-codes";

// utils
import { getParamsFromRequest } from "../utils/filterHelper";

// consts/enums
import { sprintBacklogItemFetcher } from "./fetchers/sprintBacklogItemFetcher";

export const sprintBacklogItemsGetHandler = async (req: Request, res) => {
    const params = getParamsFromRequest(req);
    const result = await sprintBacklogItemFetcher(params.sprintId);
    if (result.status === HttpStatus.OK) {
        res.json(result);
    } else {
        res.status(result.status).json({
            status: result.status,
            error: {
                msg: result.error.msg
            }
        });
        console.log(`Unable to fetch sprintBacklogItems: ${result.error.msg}`);
    }
};
