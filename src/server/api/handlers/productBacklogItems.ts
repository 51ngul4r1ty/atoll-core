// externals
import { Request, Response } from "express";
import * as core from "express-serve-static-core";
import { StatusCodes } from "http-status-codes";

// libraries
import { ApiProductBacklogItem } from "@atoll/shared";

// data access
import { ProductBacklogItemDataModel } from "../../dataaccess";

// consts/enums
import { PRODUCT_BACKLOG_ITEM_RESOURCE_NAME } from "../../resourceNames";

// utils
import { buildSelfLink } from "../../utils/linkBuilder";
import { respondWithNotFound } from "../utils/responder";
import { mapDbToApiProductBacklogItem } from "../../dataaccess/mappers/dataAccessToApiMappers";
import { buildResponseFromCatchError, buildResponseWithItems } from "../utils/responseBuilder";
import { logError } from "./utils/serverLogger";

export const productBacklogItemsGetHandler = async (req: Request, res: Response) => {
    try {
        const items: ApiProductBacklogItem[] = [];
        const productBacklogItems = await ProductBacklogItemDataModel.findAll({});
        productBacklogItems.forEach((item) => {
            const productBacklogItem = mapDbToApiProductBacklogItem(item);
            const result: ApiProductBacklogItem = {
                ...productBacklogItem,
                links: [buildSelfLink(productBacklogItem, `/api/v1/${PRODUCT_BACKLOG_ITEM_RESOURCE_NAME}/`)]
            };
            items.push(result);
        });
        res.json(buildResponseWithItems(items));
    } catch (error) {
        const errorResponse = buildResponseFromCatchError(error);
        res.status(errorResponse.status).json(errorResponse);
        logError(`Unable to fetch product backlog items: ${error}`);
    }
};

export interface BacklogItemGetParams extends core.ParamsDictionary {
    itemId: string;
}

export const productBacklogItemGetHandler = async (req: Request<BacklogItemGetParams>, res: Response) => {
    try {
        const id = req.params.itemId;
        const productBacklogItem = await ProductBacklogItemDataModel.findByPk(id);
        if (!productBacklogItem) {
            respondWithNotFound(res, `Unable to find productbacklogitem by primary key ${id}`);
        } else {
            res.json({
                status: StatusCodes.OK,
                data: {
                    item: mapDbToApiProductBacklogItem(productBacklogItem)
                }
            });
        }
    } catch (error) {
        const errorResponse = buildResponseFromCatchError(error);
        res.status(errorResponse.status).json(errorResponse);
        logError(`Unable to fetch product backlog item: ${error}`);
    }
};
