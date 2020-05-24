// externals
import { Request, Response } from "express";
import * as core from "express-serve-static-core";
import * as HttpStatus from "http-status-codes";
import { CreateOptions, Transaction } from "sequelize";

// libraries
import { ApiBacklogItem, ApiBacklogItemRank } from "@atoll/shared";

// utils
import { LinkedList } from "@atoll/shared";
import { buildSelfLink } from "../../utils/linkBuilder";
import { respondWithFailedValidation, respondWithNotFound, respondWithError, respondWithOk } from "../utils/responder";

// data access
import { mapToBacklogItem, mapToBacklogItemRank, BacklogItemModel, BacklogItemRankModel } from "../../dataaccess";
import { sequelize } from "../../dataaccess/connection";

// interfaces/types
import { addIdToBody } from "../utils/uuidHelper";

export const backlogItemsGetHandler = async (req: Request, res: Response) => {
    try {
        const backlogItemRanks = await BacklogItemRankModel.findAll({});
        const rankList = new LinkedList<ApiBacklogItem>();
        if (backlogItemRanks.length) {
            const backlogItemRanksMapped = backlogItemRanks.map((item) => mapToBacklogItemRank(item));
            backlogItemRanksMapped.forEach((item) => {
                rankList.addLink(item.backlogitemId, item.nextbacklogitemId);
            });
        }
        const backlogItems = await BacklogItemModel.findAll({});
        backlogItems.forEach((item) => {
            const backlogItem = mapToBacklogItem(item);
            const result: ApiBacklogItem = {
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

export interface BacklogItemGetParams extends core.ParamsDictionary {
    itemId: string;
}

export const backlogItemGetHandler = async (req: Request<BacklogItemGetParams>, res: Response) => {
    try {
        const id = req.params.itemId;
        console.log(`id: ${id}`);
        const backlogItem = await BacklogItemModel.findByPk(id);
        const backlogItemTyped = mapToBacklogItem(backlogItem);
        const result: ApiBacklogItem = {
            ...backlogItemTyped,
            links: [buildSelfLink(backlogItemTyped, "/api/v1/backlog-items/")]
        };
        res.json({
            status: HttpStatus.OK,
            data: {
                item: result
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

export const backlogItemsDeleteHandler = async (req: Request, res: Response) => {
    let committing = false;
    let transaction: Transaction;
    try {
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
        await sequelize.query('SET CONSTRAINTS "backlogitemrank_backlogitemId_fkey" DEFERRED;', { transaction });
        await sequelize.query('SET CONSTRAINTS "backlogitemrank_nextbacklogitemId_fkey" DEFERRED;', { transaction });
        const id = req.params.backlogItemId;
        let abort = true;
        let backlogItem: BacklogItemModel = null;
        let backlogItemTyped: ApiBacklogItem = null;
        if (!id) {
            respondWithFailedValidation(res, "backlog item ID is required for DELETE");
        }
        backlogItem = await BacklogItemModel.findByPk(id, { transaction });
        if (!backlogItem) {
            respondWithNotFound(res, `unable to find item by primary key ${id}`);
        } else {
            backlogItemTyped = mapToBacklogItem(backlogItem);
            abort = false;
        }
        if (!abort) {
            const firstLink = await BacklogItemRankModel.findOne({
                where: { nextbacklogitemId: id },
                transaction
            });
            let firstLinkTyped: ApiBacklogItemRank = null;
            if (!firstLink) {
                respondWithNotFound(res, `Unable to find rank entry with next = ${id}`);
                abort = true;
            } else {
                firstLinkTyped = (firstLink as unknown) as ApiBacklogItemRank;
            }

            let secondLink: BacklogItemRankModel = null;
            let secondLinkTyped: ApiBacklogItemRank = null;

            if (!abort) {
                secondLink = await BacklogItemRankModel.findOne({
                    where: { backlogitemId: id },
                    transaction
                });
                if (!secondLink) {
                    respondWithNotFound(res, `Unable to find rank entry with id = ${id}`);
                    abort = true;
                } else {
                    secondLinkTyped = (secondLink as unknown) as ApiBacklogItemRank;
                }
            }

            if (!abort) {
                if (!firstLinkTyped.backlogitemId && !secondLinkTyped.nextbacklogitemId) {
                    // we'll end up with one null-null row, just remove it instead
                    await BacklogItemRankModel.destroy({ where: { id: firstLinkTyped.id }, transaction });
                } else {
                    await firstLink.update({ nextbacklogitemId: secondLinkTyped.nextbacklogitemId }, { transaction });
                }
                await BacklogItemRankModel.destroy({ where: { id: secondLinkTyped.id }, transaction });
                await BacklogItemModel.destroy({ where: { id: backlogItemTyped.id }, transaction });
                committing = true;
                await transaction.commit();
                respondWithOk(res, backlogItemTyped);
            }
        }
    } catch (err) {
        if (committing) {
            console.log("an error occurred, skipping rollback because commit was already in progress");
        } else if (transaction) {
            await transaction.rollback();
        }
        respondWithError(res, err);
    }
};

export const backlogItemsPostHandler = async (req: Request, res: Response) => {
    // TODO: Fix this code:
    //       - must insert `null x` and `x null` entries
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
            //   1) no items in database yet (add prev = null, next = this new item + add prev = new item, next = null)
            //   2) insert before first item (update item's prev to this item, add prev = null, next = this new item)
            const firstItems = await BacklogItemRankModel.findAll({ where: { backlogitemId: null }, transaction });
            if (!firstItems.length) {
                // scenario 1, insert head and tail
                await BacklogItemRankModel.create({ ...addIdToBody({ backlogitemId: bodyWithId.id, nextbacklogitemId: null }) }, {
                    transaction
                } as CreateOptions);
            } else {
                // scenario 2, insert before first item
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
                respondWithFailedValidation(
                    res,
                    `Invalid previous backlog item - can't find entries with ID ${prevBacklogItemId} in database`
                );
                await transaction.rollback();
                rolledBack = true;
            } else {
                const prevBacklogItem = prevBacklogItems[0];
                // (2) oldNextItemId = prevBacklogItem.nextbacklogitemId
                const oldNextItemId = ((prevBacklogItem as unknown) as ApiBacklogItemRank).nextbacklogitemId;
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
        respondWithError(res, err);
    }
};

export const backlogItemsReorderPostHandler = async (req: Request, res: Response) => {
    const sourceItemId = req.body.sourceItemId;
    const targetItemId = req.body.targetItemId;
    if (!sourceItemId) {
        respondWithFailedValidation(res, "sourceItemId must have a value");
        return;
    }
    if (sourceItemId === targetItemId) {
        respondWithFailedValidation(res, "sourceItemId and targetItemId must be different!");
        return;
    }
    let transaction: Transaction;
    try {
        let rolledBack = false;
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });

        // 1. Unlink source item from old location
        const sourceItemPrevLink = await BacklogItemRankModel.findOne({
            where: { nextbacklogitemId: sourceItemId }
        });
        const sourceItemNextLink = await BacklogItemRankModel.findOne({
            where: { backlogitemId: sourceItemId }
        });
        const oldNextItemId = (sourceItemNextLink as any).dataValues.nextbacklogitemId;
        const sourceItemPrevLinkId = (sourceItemPrevLink as any).dataValues.backlogitemId;
        if (sourceItemPrevLinkId === oldNextItemId) {
            throw new Error(`sourceItemPrevLink with ${sourceItemPrevLinkId} linked to self!`);
        }
        await sourceItemPrevLink.update({ nextbacklogitemId: oldNextItemId }, { transaction });

        // 2. Re-link source item in new location
        const targetItemPrevLink = await BacklogItemRankModel.findOne({
            where: { nextbacklogitemId: targetItemId }
        });
        const targetItemPrevLinkId = (targetItemPrevLink as any).dataValues.backlogitemId;
        if (targetItemPrevLinkId === sourceItemId) {
            throw new Error(`targetItemPrevLink with ${targetItemPrevLinkId} linked to self (which was source item)!`);
        }
        await targetItemPrevLink.update({ nextbacklogitemId: sourceItemId }, { transaction });
        const sourceItemNextLinkId = (sourceItemNextLink as any).dataValues.backlogitemId;
        if (sourceItemNextLinkId === targetItemId) {
            throw new Error(`sourceItemNextLink with ${sourceItemNextLinkId} linked to self (which was target item)!`);
        }
        await sourceItemNextLink.update({ nextbacklogitemId: targetItemId }, { transaction });

        if (!rolledBack) {
            await transaction.commit();
            respondWithOk(res);
        }
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        respondWithError(res, err);
    }
};
