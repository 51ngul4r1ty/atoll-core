// externals
import { buildOptionsWithTransaction } from "../../utils/sequelizeHelper";
import { mapDbToApiBacklogItemRank } from "../../../dataaccess/mappers/dataAccessToApiMappers";
import * as HttpStatus from "http-status-codes";
import { FindOptions, InstanceDestroyOptions, InstanceUpdateOptions, Transaction } from "sequelize";

// data access
import { BacklogItemRankDataModel } from "../../../dataaccess/models/BacklogItemRank";

export const removeFromProductBacklog = async (backlogitemId: string | null, transaction?: Transaction) => {
    try {
        const findItemOptions: FindOptions = buildOptionsWithTransaction({ where: { backlogitemId } }, transaction);
        const item = await BacklogItemRankDataModel.findOne(findItemOptions);
        if (!item) {
            return {
                status: HttpStatus.NOT_FOUND,
                message: `Backlog item ${backlogitemId} was not found`
            };
        }
        const findItemBeforeOptions: FindOptions = buildOptionsWithTransaction(
            { where: { nextbacklogitemId: backlogitemId } },
            transaction
        );
        const itemBefore = await BacklogItemRankDataModel.findOne(findItemBeforeOptions);
        const nextBacklogItemId = (item as any)?.nextbacklogitemId;
        const findItemAfterOptions: FindOptions = buildOptionsWithTransaction(
            { where: { backlogitemId: nextBacklogItemId } },
            transaction
        );
        const itemAfter = nextBacklogItemId ? await BacklogItemRankDataModel.findOne(findItemAfterOptions) : null;
        if (nextBacklogItemId && !itemAfter) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Backlog item ${backlogitemId} was found, but next item wasn't found!`
            };
        }
        let itemData = mapDbToApiBacklogItemRank(item);
        let itemBeforeData = mapDbToApiBacklogItemRank(itemBefore);
        const destroyOptions: InstanceDestroyOptions = buildOptionsWithTransaction(undefined, transaction);
        if (itemBeforeData.backlogitemId === null && !nextBacklogItemId) {
            // This is the first item in the list and we're telling it that nothing is after it... so we really should just remove
            // it- there's an empty list now!
            // Also, we have to remove items that point to the next item before removing that item itself which occurs below.
            await itemBefore.destroy(destroyOptions);
        } else {
            const updateOptions: InstanceUpdateOptions = buildOptionsWithTransaction(undefined, transaction);
            await itemBefore.update({ nextbacklogitemId: nextBacklogItemId }, updateOptions);
        }
        await item.destroy(destroyOptions);
        return {
            status: HttpStatus.OK,
            data: {
                item: itemData
            }
        };
    } catch (error) {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error
        };
    }
};
