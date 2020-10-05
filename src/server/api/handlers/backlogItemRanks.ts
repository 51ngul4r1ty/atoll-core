// externals
import { Request, Response } from "express";
import * as core from "express-serve-static-core";
import * as HttpStatus from "http-status-codes";

// libraries
import { ApiBacklogItemRank } from "@atoll/shared";

// utils
import { buildSelfLink } from "../../utils/linkBuilder";
import {
    respondWithFailedValidation,
    respondWithNotFound,
    respondWithError,
    respondWithOk,
    respondWithItem
} from "../utils/responder";

// data access
import { BacklogItemRankModel, mapToBacklogItemRank } from "../../dataaccess";

export const BACKLOG_ITEM_RANK_RESOURCE_NAME = "backlog-item-ranks";

export const backlogItemRanksGetHandler = async (req: Request, res: Response) => {
    try {
        const items: ApiBacklogItemRank[] = [];
        const backlogItemRanks = await BacklogItemRankModel.findAll({});
        backlogItemRanks.forEach((item) => {
            const backlogItemRank = mapToBacklogItemRank(item);
            const result: ApiBacklogItemRank = {
                ...backlogItemRank,
                links: [buildSelfLink(backlogItemRank, `/api/v1/${BACKLOG_ITEM_RANK_RESOURCE_NAME}/`)]
            };
            items.push(result);
        });
        res.json({
            status: HttpStatus.OK,
            data: {
                items
            }
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: {
                msg: error
            }
        });
        console.log(`Unable to fetch backlog item ranks: ${error}`);
    }
};

export interface BacklogItemGetParams extends core.ParamsDictionary {
    itemId: string;
}

export const backlogItemRankGetHandler = async (req: Request<BacklogItemGetParams>, res: Response) => {
    try {
        const id = req.params.itemId;
        const backlogItemRank = await BacklogItemRankModel.findByPk(id);
        if (!backlogItemRank) {
            respondWithNotFound(res, `Unable to find backlogitemrank by primary key ${id}`);
        } else {
            res.json({
                status: HttpStatus.OK,
                data: {
                    item: mapToBacklogItemRank(backlogItemRank)
                }
            });
        }
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: {
                msg: error
            }
        });
        console.log(`Unable to fetch backlog item rank: ${error}`);
    }
};
