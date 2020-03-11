// externals
import { Request, Response } from "express";
import { CreateOptions, FindOptions, Order, OrderItem } from "sequelize/types";
import * as HttpStatus from "http-status-codes";

// utils
import { buildSelfLink } from "../../utils/linkBuilder";

// data access
import { mapToBacklogItem, BacklogItemModel } from "../../dataaccess";

// interfaces/types
import { BacklogItem } from "../../dataaccess/types";
import { addIdToBody } from "../utils/uuidHelper";

export const backlogItemsGetHandler = function(req: Request, res: Response) {
    const order: Order = [["displayIndex", "ASC"]];
    const options: FindOptions = { order };
    BacklogItemModel.findAll(options)
        .then((backlogItems) => {
            const items = backlogItems.map((item) => {
                const backlogItem = mapToBacklogItem(item);
                const result: BacklogItem = {
                    ...backlogItem,
                    links: [buildSelfLink(backlogItem, "/api/v1/backlog-items/")]
                };
                return result;
            });
            res.json({
                status: HttpStatus.OK,
                data: {
                    items
                }
            });
        })
        .catch((error) => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: {
                    msg: error
                }
            });
            console.log(`unable to fetch backlog items: ${error}`);
        });
};

export const backlogItemsPostHandler = function(req: Request, res: Response) {
    const bodyWithId = addIdToBody(req.body);
    BacklogItemModel.create(bodyWithId, {} as CreateOptions)
        .then(() => {
            res.status(HttpStatus.CREATED).json({
                status: HttpStatus.CREATED,
                data: {
                    item: bodyWithId
                }
            });
        })
        .catch((error) => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: {
                    msg: error
                }
            });
            console.log(`unable to add backlog item: ${error}`);
        });
};
