// externals
import { Request, Response } from "express";
import * as core from "express-serve-static-core";
import * as HttpStatus from "http-status-codes";

// libraries
import { ApiBacklogItemRank } from "@atoll/shared";

// data access
import { BacklogItemRankDataModel } from "../../dataaccess";

// consts/enums
import { BACKLOG_ITEM_RANK_RESOURCE_NAME } from "../../resourceNames";

// utils
import { buildSelfLink } from "../../utils/linkBuilder";
import { respondWithNotFound } from "../utils/responder";
import { mapDbToApiBacklogItemRank } from "../../dataaccess/mappers/dataAccessToApiMappers";
import { buildResponseFromCatchError, buildResponseWithItems } from "../utils/responseBuilder";

export const backlogItemRanksGetHandler = async (req: Request, res: Response) => {
    try {
        const items: ApiBacklogItemRank[] = [];
        const backlogItemRanks = await BacklogItemRankDataModel.findAll({});
        backlogItemRanks.forEach((item) => {
            const backlogItemRank = mapDbToApiBacklogItemRank(item);
            const result: ApiBacklogItemRank = {
                ...backlogItemRank,
                links: [buildSelfLink(backlogItemRank, `/api/v1/${BACKLOG_ITEM_RANK_RESOURCE_NAME}/`)]
            };
            items.push(result);
        });
        res.json(buildResponseWithItems(items));
    } catch (error) {
        const errorResponse = buildResponseFromCatchError(error);
        res.status(errorResponse.status).json(errorResponse);
        console.log(`Unable to fetch backlog item ranks: ${error}`);
    }
};

export interface BacklogItemGetParams extends core.ParamsDictionary {
    itemId: string;
}

export const backlogItemRankGetHandler = async (req: Request<BacklogItemGetParams>, res: Response) => {
    try {
        const id = req.params.itemId;
        const backlogItemRank = await BacklogItemRankDataModel.findByPk(id);
        if (!backlogItemRank) {
            respondWithNotFound(res, `Unable to find backlogitemrank by primary key ${id}`);
        } else {
            res.json({
                status: HttpStatus.OK,
                data: {
                    item: mapDbToApiBacklogItemRank(backlogItemRank)
                }
            });
        }
    } catch (error) {
        const errorResponse = buildResponseFromCatchError(error);
        res.status(errorResponse.status).json(errorResponse);
        console.log(`Unable to fetch backlog item rank: ${error}`);
    }
};
