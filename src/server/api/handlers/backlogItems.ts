// externals
import { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";
import { CreateOptions, Transaction } from "sequelize";

// utils
import { LinkedList } from "@atoll/shared";
import { buildSelfLink } from "../../utils/linkBuilder";
import { buildErrorForApiResponse } from "../utils/errorProcessor";

// data access
import { mapToBacklogItem, mapToBacklogItemRank, BacklogItemModel, BacklogItemRankModel } from "../../dataaccess";
import { sequelize } from "../../dataaccess/connection";

// interfaces/types
import { BacklogItem, BacklogItemRank } from "../../dataaccess/types";
import { addIdToBody } from "../utils/uuidHelper";

export const backlogItemsGetHandler = async (req: Request, res: Response) => {
    try {
        const backlogItemRanks = await BacklogItemRankModel.findAll({});
        const rankList = new LinkedList<BacklogItem>();
        if (backlogItemRanks.length) {
            const backlogItemRanksMapped = backlogItemRanks.map((item) => mapToBacklogItemRank(item));
            backlogItemRanksMapped.forEach((item) => {
                rankList.addLink(item.backlogitemId, item.nextbacklogitemId);
            });
        }
        const backlogItems = await BacklogItemModel.findAll({});
        backlogItems.forEach((item) => {
            const backlogItem = mapToBacklogItem(item);
            const result: BacklogItem = {
                ...backlogItem,
                links: [buildSelfLink(backlogItem, "/api/v1/backlog-items/")]
            };
            rankList.addItemData(result.id, result);
        });
        res.json({
            status: HttpStatus.OK,
            data: {
                items: rankList.toArray()
            }
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: {
                msg: error
            }
        });
        console.log(`unable to fetch backlog items: ${error}`);
    }
};

export const backlogItemsPostHandler = async (req: Request, res: Response) => {
    const bodyWithId = { ...addIdToBody(req.body) };
    const prevBacklogItemId = bodyWithId.prevBacklogItemId;
    delete bodyWithId.prevBacklogItemId;
    let transaction: Transaction;
    try {
        let rolledBack = false;
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        await sequelize.query('SET CONSTRAINTS "backlogitemrank_backlogitemId_fkey" DEFERRED;', { transaction });
        await sequelize.query('SET CONSTRAINTS "backlogitemrank_nextbacklogitemId_fkey" DEFERRED;', { transaction });
        const addedBacklogItem = await BacklogItemModel.create(bodyWithId, { transaction } as CreateOptions);
        if (!prevBacklogItemId) {
            // inserting first item means one of 2 scenarios:
            //   1) no items in database yet (add prev = null, next = this new item)
            //   2) insert before first item (update item's prev to this item, add prev = null, next = this new item)
            const firstItems = await BacklogItemRankModel.findAll({ where: { backlogitemId: null }, transaction });
            if (firstItems.length) {
                const firstItem = firstItems[0];
                await firstItem.update({ backlogitemId: bodyWithId.id }, { transaction });
            }
            await BacklogItemRankModel.create({ ...addIdToBody({ backlogitemId: null, nextbacklogitemId: bodyWithId.id }) }, {
                transaction
            } as CreateOptions);
        } else {
            // 1. if there is a single item in database then we'll have this entry:
            //   backlogitemId=null, nextbacklogitemId=item1
            //   backlogitemId=item1, nextbacklogitemId=null
            // in this example, prevBacklogItemId will be item1, so we must end up with:
            //   backlogitemId=null, nextbacklogitemId=item1     (NO CHANGE)
            //   backlogitemId=item1, nextbacklogitemId=NEWITEM  (UPDATE "item1" entry to have new "next")
            //   backlogitemId=NEWITEM, nextbacklogitemId=null   (ADD "NEWITEM" entry with old "new")
            // this means:
            // (1) get entry (as prevBacklogItem) with backlogItemId = prevBacklogItemId
            const prevBacklogItems = await BacklogItemRankModel.findAll({
                where: { backlogitemId: prevBacklogItemId },
                transaction
            });
            if (!prevBacklogItems.length) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    status: HttpStatus.BAD_REQUEST,
                    error: buildErrorForApiResponse(
                        `Invalid previous backlog item - can't find entries with ID ${prevBacklogItemId} in database`
                    )
                });
                await transaction.rollback();
                rolledBack = true;
            } else {
                const prevBacklogItem = prevBacklogItems[0];
                // (2) oldNextItemId = prevBacklogItem.nextbacklogitemId
                const oldNextItemId = ((prevBacklogItem as unknown) as BacklogItemRank).nextbacklogitemId;
                // (3) update existing entry with nextbacklogitemId = bodyWithId.id
                await prevBacklogItem.update({ nextbacklogitemId: bodyWithId.id }, { transaction });
                // (4) add new row with backlogitemId = bodyWithId.id, nextbacklogitemId = oldNextItemId
                await BacklogItemRankModel.create(
                    { ...addIdToBody({ backlogitemId: bodyWithId.id, nextbacklogitemId: oldNextItemId }) },
                    {
                        transaction
                    } as CreateOptions
                );
            }
            // TODO: Write unit tests to try and mimick this and test that the logic handles it as well:
            // 2. if there are multiple items in database then we'll have these entries:
            // backlogitemId=null, nextbacklogitemId=item1
            // backlogitemId=item1, nextbacklogitemId=item2
            // backlogitemId=item2, nextbacklogitemId=null
        }
        if (!rolledBack) {
            await transaction.commit();
            res.status(HttpStatus.CREATED).json({
                status: HttpStatus.CREATED,
                data: {
                    item: addedBacklogItem
                }
            });
        }
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: buildErrorForApiResponse(err)
        });
    }
};
