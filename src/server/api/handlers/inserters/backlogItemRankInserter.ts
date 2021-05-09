// externals
import { CreateOptions, Transaction } from "sequelize";
import * as HttpStatus from "http-status-codes";

// utils
import { addIdToBody } from "../../utils/uuidHelper";
import { respondWithFailedValidation } from "../../utils/responder";

// data access
import { BacklogItemRankDataModel } from "../../../dataaccess/models/BacklogItemRank";
import { ApiBacklogItemRank } from "@atoll/shared";

export const backlogItemRankFirstItemInserter = async (bodyWithId, transaction: Transaction) => {
    // inserting first item means one of 2 scenarios:
    //   1) no items in database yet (add prev = null, next = this new item + add prev = new item, next = null)
    //   2) insert before first item (update item's prev to this item, add prev = null, next = this new item)
    const firstItems = await BacklogItemRankDataModel.findAll({ where: { backlogitemId: null }, transaction });
    if (!firstItems.length) {
        // scenario 1, insert head and tail
        await BacklogItemRankDataModel.create(
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
    await BacklogItemRankDataModel.create(
        { ...addIdToBody({ projectId: bodyWithId.projectId, backlogitemId: null, nextbacklogitemId: bodyWithId.id }) },
        {
            transaction
        } as CreateOptions
    );
    return {
        status: HttpStatus.OK
    };
};

export const backlogItemRankSubsequentItemInserter = async (newItem, transaction: Transaction, prevBacklogItemId: string) => {
    // 1. if there is a single item in database then we'll have this entry:
    //   backlogitemId=null, nextbacklogitemId=item1
    //   backlogitemId=item1, nextbacklogitemId=null
    // in this example, prevBacklogItemId will be item1, so we must end up with:
    //   backlogitemId=null, nextbacklogitemId=item1     (NO CHANGE)
    //   backlogitemId=item1, nextbacklogitemId=NEWITEM  (UPDATE "item1" entry to have new "next")
    //   backlogitemId=NEWITEM, nextbacklogitemId=null   (ADD "NEWITEM" entry with old "new")
    // this means:
    // (1) get entry (as prevBacklogItem) with backlogItemId = prevBacklogItemId
    const prevBacklogItems = await BacklogItemRankDataModel.findAll({
        where: { backlogitemId: prevBacklogItemId },
        transaction
    });
    if (!prevBacklogItems.length) {
        await transaction.rollback();
        return {
            status: HttpStatus.BAD_REQUEST,
            message: `Invalid previous backlog item - can't find entries with ID ${prevBacklogItemId} in database`,
            rolledBack: true
        };
    } else {
        const prevBacklogItem = prevBacklogItems[0];
        // (2) oldNextItemId = prevBacklogItem.nextbacklogitemId
        const oldNextItemId = ((prevBacklogItem as unknown) as ApiBacklogItemRank).nextbacklogitemId;
        // (3) update existing entry with nextbacklogitemId = newItem.id
        await prevBacklogItem.update({ nextbacklogitemId: newItem.id }, { transaction });
        // (4) add new row with backlogitemId = newItem.id, nextbacklogitemId = oldNextItemId
        await BacklogItemRankDataModel.create(
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
            status: HttpStatus.OK,
            message: null,
            rolledBack: false
        };
    }
    // TODO: Write unit tests to try and mimick this and test that the logic handles it as well:
    // 2. if there are multiple items in database then we'll have these entries:
    // backlogitemId=null, nextbacklogitemId=item1
    // backlogitemId=item1, nextbacklogitemId=item2
    // backlogitemId=item2, nextbacklogitemId=null
};
