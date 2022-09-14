// externals
import { StatusCodes } from "http-status-codes";
import { FindOptions, InstanceDestroyOptions, InstanceUpdateOptions, Transaction } from "sequelize";

// data access
import { ProductBacklogItemDataModel } from "../../../dataaccess/models/ProductBacklogItemDataModel";

// utils
import { buildOptionsWithTransaction } from "../../utils/sequelizeHelper";
import { buildResponseFromCatchError, buildResponseWithItem } from "../../utils/responseBuilder";
import { mapDbToApiProductBacklogItem } from "../../../dataaccess/mappers/dataAccessToApiMappers";

export const removeFromProductBacklog = async (backlogitemId: string, transaction?: Transaction) => {
    if (!backlogitemId) {
        throw new Error("Unable to remove product backlog item entries using a null/undefined ID");
    }
    try {
        const findItemOptions: FindOptions = buildOptionsWithTransaction({ where: { backlogitemId } }, transaction);
        const item = await ProductBacklogItemDataModel.findOne(findItemOptions);
        if (!item) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: `Backlog item "${backlogitemId}" was not found`
            };
        }
        const findItemBeforeOptions: FindOptions = buildOptionsWithTransaction(
            { where: { nextbacklogitemId: backlogitemId } },
            transaction
        );
        const itemBefore = await ProductBacklogItemDataModel.findOne(findItemBeforeOptions);
        const nextBacklogItemId = (item as any)?.nextbacklogitemId;
        const findItemAfterOptions: FindOptions = buildOptionsWithTransaction(
            { where: { backlogitemId: nextBacklogItemId } },
            transaction
        );
        const itemAfter = nextBacklogItemId ? await ProductBacklogItemDataModel.findOne(findItemAfterOptions) : null;
        if (nextBacklogItemId && !itemAfter) {
            return {
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: `Backlog item ${backlogitemId} was found, but next item wasn't found!`
            };
        }
        let itemData = mapDbToApiProductBacklogItem(item);
        let itemBeforeData = mapDbToApiProductBacklogItem(itemBefore);
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
        return buildResponseWithItem(itemData);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};
