// externals
import { CreateOptions, Transaction } from "sequelize";
import { StatusCodes } from "http-status-codes";

// utils
import { addIdToBody } from "../../utils/uuidHelper";

// data access
import { ProductBacklogItemDataModel } from "../../../dataaccess/models/ProductBacklogItemDataModel";
import { ApiProductBacklogItem } from "@atoll/shared";

export interface ProductBacklogItemFirstItemInserterResult {
    status: number;
}

export const productBacklogItemFirstItemInserter = async (
    bodyWithId,
    transaction: Transaction
): Promise<ProductBacklogItemFirstItemInserterResult> => {
    const projectId = bodyWithId.projectId;
    if (!projectId) {
        throw new Error("Unable to update the product backlog without a projectId");
    }
    // inserting first item means one of 2 scenarios:
    //   1) no items in database yet (add prev = null, next = this new item + add prev = new item, next = null)
    //   2) insert before first item (update item's prev to this item, add prev = null, next = this new item)
    const firstItems = await ProductBacklogItemDataModel.findAll({ where: { backlogitemId: null, projectId }, transaction });
    if (!firstItems.length) {
        // scenario 1, insert head and tail
        await ProductBacklogItemDataModel.create(
            { ...addIdToBody({ projectId: bodyWithId.projectId, backlogitemId: bodyWithId.id, nextbacklogitemId: null }) },
            {
                transaction
            } as CreateOptions
        );
    } else {
        // scenario 2, insert before first item
        const firstItem = firstItems[0];
        await firstItem.update({ backlogitemId: bodyWithId.id }, { transaction });
    }
    await ProductBacklogItemDataModel.create(
        { ...addIdToBody({ projectId: bodyWithId.projectId, backlogitemId: null, nextbacklogitemId: bodyWithId.id }) },
        {
            transaction
        } as CreateOptions
    );
    return {
        status: StatusCodes.OK
    };
};

export const productBacklogItemSubsequentItemInserter = async (newItem, transaction: Transaction, prevBacklogItemId: string) => {
    // 1. if there is a single item in database then we'll have this entry:
    //   backlogitemId=null, nextbacklogitemId=item1
    //   backlogitemId=item1, nextbacklogitemId=null
    // in this example, prevBacklogItemId will be item1, so we must end up with:
    //   backlogitemId=null, nextbacklogitemId=item1     (NO CHANGE)
    //   backlogitemId=item1, nextbacklogitemId=NEWITEM  (UPDATE "item1" entry to have new "next")
    //   backlogitemId=NEWITEM, nextbacklogitemId=null   (ADD "NEWITEM" entry with old "new")
    // this means:
    // (1) get entry (as prevBacklogItem) with backlogItemId = prevBacklogItemId
    const prevBacklogItems = await ProductBacklogItemDataModel.findAll({
        where: { backlogitemId: prevBacklogItemId },
        transaction
    });
    if (!prevBacklogItems.length) {
        await transaction.rollback();
        return {
            status: StatusCodes.BAD_REQUEST,
            message: `Invalid previous backlog item - can't find entries with ID ${prevBacklogItemId} in database`,
            rolledBack: true
        };
    } else {
        const prevBacklogItem = prevBacklogItems[0];
        // (2) oldNextItemId = prevBacklogItem.nextbacklogitemId
        const oldNextItemId = (prevBacklogItem as unknown as ApiProductBacklogItem).nextbacklogitemId;
        // (3) update existing entry with nextbacklogitemId = newItem.id
        await prevBacklogItem.update({ nextbacklogitemId: newItem.id }, { transaction });
        // (4) add new row with backlogitemId = newItem.id, nextbacklogitemId = oldNextItemId
        await ProductBacklogItemDataModel.create(
            {
                ...addIdToBody({
                    projectId: newItem.projectId,
                    backlogitemId: newItem.id,
                    nextbacklogitemId: oldNextItemId
                })
            },
            {
                transaction
            } as CreateOptions
        );
        return {
            status: StatusCodes.OK,
            message: null,
            rolledBack: false
        };
    }
};
