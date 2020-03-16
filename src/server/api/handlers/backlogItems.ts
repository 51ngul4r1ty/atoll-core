// externals
import { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";
import { CreateOptions, Transaction } from "sequelize";

// utils
import { buildSelfLink } from "../../utils/linkBuilder";
import { buildErrorForApiResponse } from "../utils/errorProcessor";

// data access
import { mapToBacklogItem, mapToBacklogItemRank, BacklogItemModel, BacklogItemRankModel } from "../../dataaccess";
import { sequelize } from "../../dataaccess/connection";

// interfaces/types
import { BacklogItem } from "../../dataaccess/types";
import { addIdToBody } from "../utils/uuidHelper";

class LinkedListItem<T> {
    id: string;
    next: LinkedListItem<T> | null;
    data: T;
}

interface ItemHashMap<T> {
    [id: string]: LinkedListItem<T>;
}

class LinkedList<T> {
    constructor() {
        this.firstItem = null;
        this.itemHashMap = {};
    }
    private firstItem: LinkedListItem<T>;
    private itemHashMap: ItemHashMap<T>;
    private addMissingItem(id: string) {
        const newItem = new LinkedListItem<T>();
        newItem.id = id;
        console.log(`adding item to hash map: ${id}`);
        this.itemHashMap[id] = newItem;
        return newItem;
    }
    addLink(prevId: string, nextId: string) {
        let next = this.itemHashMap[nextId] || null;
        let prev = this.itemHashMap[prevId] || null;
        if (!next && nextId !== null) {
            next = this.addMissingItem(nextId);
        }
        if (!prev && prevId !== null) {
            prev = this.addMissingItem(prevId);
        }
        if (prev) {
            console.log(`linking prev item's next to current: ${prevId}.next = ${nextId}`);
            prev.next = next;
        }
        if (!prevId) {
            this.firstItem = next;
        }
    }
    addItemData(id: string, data: T) {
        const item = this.itemHashMap[id];
        if (!item) {
            console.log(`unable to find item with ID: ${id}`);
        } else {
            item.data = data;
        }
    }
    toArray(): T[] {
        const items = [];
        let item = this.firstItem;
        while (item) {
            items.push(item.data);
            item = item.next;
        }
        return items;
    }
}

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
    let transaction: Transaction;
    try {
        transaction = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });
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
