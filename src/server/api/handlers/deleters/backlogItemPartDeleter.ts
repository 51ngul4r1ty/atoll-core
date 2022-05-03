// externals
import { StatusCodes } from "http-status-codes";
import { FindOptions, Transaction } from "sequelize";

// data access
import { BacklogItemDataModel } from "../../../dataaccess/models/BacklogItemDataModel";
import { BacklogItemPartDataModel } from "../../../dataaccess/models/BacklogItemPartDataModel";

// utils
import { buildOptionsWithTransaction } from "../../utils/sequelizeHelper";
import { buildResponseFromCatchError, buildResponseWithItem } from "../../utils/responseBuilder";
import { mapDbToApiBacklogItem, mapDbToApiBacklogItemPart } from "../../../dataaccess/mappers/dataAccessToApiMappers";

export enum LastPartRemovalOptions {
    Disallow = 1,
    Allow = 2
}

/**
 * Removes a backlog item part that hasn't been allocated to a sprint.  The foreign key constraint should prevent deletion of an
 * allocated backlog item, but regardless, this function is not intended for use with allocated backlog item parts.
 *
 * NOTE: Calling code is responsible for transaction handling (begin & commit).
 *
 * @param backlogItemPartId
 * @param lastPartRemovalOptions
 * @param transaction
 * @returns
 */
export const removeUnallocatedBacklogItemPart = async (
    backlogItemPartId: string,
    lastPartRemovalOptions: LastPartRemovalOptions,
    transaction?: Transaction
) => {
    try {
        const findItemOptions: FindOptions = buildOptionsWithTransaction({ where: { id: backlogItemPartId } }, transaction);
        const item = await BacklogItemPartDataModel.findOne(findItemOptions);
        if (!item) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: `Backlog item part "${backlogItemPartId}" was not found`
            };
        }
        let itemData = mapDbToApiBacklogItemPart(item);
        await item.destroy({ transaction });
        const findPeerItemOptions: FindOptions = buildOptionsWithTransaction(
            { where: { backlogitemId: item.backlogitemId }, order: [["partIndex", "ASC"]] },
            transaction
        );
        const findParentOptions: FindOptions = buildOptionsWithTransaction({ where: { id: item.backlogitemId } }, transaction);
        const dbBacklogItem = await BacklogItemDataModel.findOne(findParentOptions);
        const backlogItem = mapDbToApiBacklogItem(dbBacklogItem);
        backlogItem.totalParts--;
        await BacklogItemDataModel.update(
            { totalParts: backlogItem.totalParts },
            { where: { id: item.backlogitemId }, transaction }
        );
        const peerItems = await BacklogItemPartDataModel.findAll(findPeerItemOptions);
        if (!peerItems.length) {
            if (lastPartRemovalOptions === LastPartRemovalOptions.Disallow) {
                return {
                    status: StatusCodes.BAD_REQUEST,
                    message: `Backlog Item Part removal resulted in last part with ID "${backlogItemPartId}" being removed`
                };
            }
            if (!backlogItem) {
                return {
                    status: StatusCodes.INTERNAL_SERVER_ERROR,
                    message:
                        `After removing last backlog item part with ID "${backlogItemPartId}"` +
                        ` unable to find backlog item with ID "${item.backlogitemId}"`
                };
            }
            let backlogItemData = mapDbToApiBacklogItem(item);
            await dbBacklogItem.destroy({ transaction });
            return {
                status: StatusCodes.OK,
                data: {
                    item: itemData
                },
                extra: {
                    backlogItem: backlogItemData
                }
            };
        }
        for (const peerItem of peerItems) {
            if (peerItem.partIndex > item.partIndex) {
                await peerItem.update({ partIndex: peerItem.partIndex - 1 }, { transaction });
            }
        }
        const extra = {
            backlogItem
        };
        return buildResponseWithItem(itemData, extra);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};
