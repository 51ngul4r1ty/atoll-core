// externals
import { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";
import { CreateOptions, FindOptions, Order, Transaction, Op } from "sequelize";
import { Decimal } from "decimal.js-light";

// utils
import { buildSelfLink } from "../../utils/linkBuilder";
import { buildErrorForApiResponse } from "../utils/errorProcessor";

// data access
import { mapToBacklogItem, BacklogItemModel } from "../../dataaccess";
import { sequelize } from "../../dataaccess/connection";

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

const NORMAL_DISPLAYINDEX_INCREMENT = 1.0;
const EXPECTED_MAX_BATCH_ITEM_ADD_COUNT = 10.0;

interface BodyWithId {
    displayIndex: string;
}

export const setNewDisplayIndex = (bodyWithId: BodyWithId, existingDisplayIndex: Decimal, rangeUsed: Decimal) => {
    // best guess non-clashing display index will the current index + a reasonable fraction of the normal increment
    let increment = new Decimal(NORMAL_DISPLAYINDEX_INCREMENT).dividedBy(EXPECTED_MAX_BATCH_ITEM_ADD_COUNT);
    let newDisplayIndex: Decimal; // = existingDisplayIndex + ();
    if (increment.lessThan(rangeUsed)) {
        // if our range included this number we know there won't be clash, so safe to use it
        newDisplayIndex = existingDisplayIndex.plus(increment);
    } else {
        // if our range did not include this number the fallback is half way between this range
        newDisplayIndex = existingDisplayIndex.plus(new Decimal(rangeUsed).dividedBy(2.0));
    }
    bodyWithId.displayIndex = newDisplayIndex.toString();
};

export const numbersEqual = (number1: number, number2: number) => {
    const diff = number1 - number2;
    return `${diff}` === "0";
};

export const backlogItemsPostHandler = async (req: Request, res: Response) => {
    const bodyWithId = { ...addIdToBody(req.body) };
    let transaction: Transaction;
    try {
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        const range = new Decimal(5.0);
        const existingDisplayIndex = new Decimal(bodyWithId.displayIndex);
        const findAllResult = await BacklogItemModel.findAll({
            // TODO: change this to displayIndex + 1
            where: { displayIndex: { [Op.gte]: existingDisplayIndex, [Op.lt]: existingDisplayIndex.plus(range) } },
            order: [["displayIndex", "ASC"]]
        });
        console.log("KEVIN - before if condition");
        if (findAllResult.length > 0 && new Decimal((findAllResult[0] as any).displayIndex).equals(existingDisplayIndex)) {
            console.log("KEVIN - in if condition");
            if (findAllResult.length === 1) {
                console.log("KEVIN - single item in range");
                setNewDisplayIndex(bodyWithId, existingDisplayIndex, range);
            } else if (findAllResult.length > 1) {
                console.log("KEVIN - multiple items in range");
                const item1 = findAllResult[0] as any;
                let found = false;
                findAllResult.forEach((item) => {
                    if (!found) {
                        const itemToUse = item as any;
                        console.log(`KEVIN - multiple items in range
- ${itemToUse.displayIndex} (type=${typeof itemToUse.displayIndex})
- ${item1.displayIndex} (type=${typeof item1.displayIndex})`);
                        if (new Decimal(itemToUse.displayIndex).greaterThan(item1.displayIndex)) {
                            console.log("KEVIN - multiple items in range - set");
                            setNewDisplayIndex(
                                bodyWithId,
                                existingDisplayIndex,
                                new Decimal(itemToUse.displayIndex).minus(existingDisplayIndex)
                            );
                            found = true;
                        }
                    }
                });
            }
        }
        console.log(`KEVIN - displayIndex ${req.body.displayIndex} --> ${bodyWithId.displayIndex}`);
        const addedBacklogItem = await BacklogItemModel.create(bodyWithId, { transaction } as CreateOptions);
        await transaction.commit();
        res.status(HttpStatus.CREATED).json({
            status: HttpStatus.CREATED,
            data: {
                item: addedBacklogItem
            }
        });
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: buildErrorForApiResponse(err)
        });
        console.log(`unable to add backlog item: ${err}`);
    }
};
