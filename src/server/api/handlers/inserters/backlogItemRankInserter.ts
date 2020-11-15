// externals
import { CreateOptions, Transaction } from "sequelize";
import * as HttpStatus from "http-status-codes";

// utils
import { addIdToBody } from "../../utils/uuidHelper";

// data access
import { BacklogItemRankModel } from "../../../dataaccess/models/BacklogItemRank";

export const backlogItemRankFirstItemInserter = async (bodyWithId, transaction: Transaction) => {
    // inserting first item means one of 2 scenarios:
    //   1) no items in database yet (add prev = null, next = this new item + add prev = new item, next = null)
    //   2) insert before first item (update item's prev to this item, add prev = null, next = this new item)
    const firstItems = await BacklogItemRankModel.findAll({ where: { backlogitemId: null }, transaction });
    if (!firstItems.length) {
        // scenario 1, insert head and tail
        await BacklogItemRankModel.create(
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
    await BacklogItemRankModel.create(
        { ...addIdToBody({ projectId: bodyWithId.projectId, backlogitemId: null, nextbacklogitemId: bodyWithId.id }) },
        {
            transaction
        } as CreateOptions
    );
    return {
        status: HttpStatus.OK
    };
};
