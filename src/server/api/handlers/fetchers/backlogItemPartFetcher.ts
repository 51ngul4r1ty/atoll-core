// externals
import * as HttpStatus from "http-status-codes";
import { FindOptions, Transaction } from "sequelize";

// libraries
import { ApiBacklogItemPart } from "@atoll/shared";

// utils
import { mapDbToApiBacklogItemPart } from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { addWhereClauseToOptions } from "../../utils/sequelizeHelper";
import { buildSelfLink } from "utils/linkBuilder";
import { getMessageFromError } from "../../utils/errorUtils";

// data access
import { BacklogItemPartDataModel } from "../../../dataaccess/models/BacklogItemPart";
import {
    BACKLOG_ITEM_PART_RESOURCE_NAME,
    SPRINT_BACKLOG_CHILD_RESOURCE_NAME,
    SPRINT_BACKLOG_PARENT_RESOURCE_NAME,
    SPRINT_RESOURCE_NAME
} from "resourceNames";

// // consts/enums
// import { BACKLOG_ITEM_PART_RESOURCE_NAME } from "../../../resourceNames";

export interface BacklogItemPartsResult {
    status: number;
    data?: {
        items: ApiBacklogItemPart[];
    };
    message?: string;
}

export const backlogItemPartFetcher = async (backlogItemId: string, transaction?: Transaction): Promise<BacklogItemPartsResult> => {
    try {
        const options: FindOptions = { order: [["partIndex", "ASC"]] };
        if (transaction) {
            options.transaction = transaction;
        }
        addWhereClauseToOptions(options, "backlogitemId", backlogItemId);
        const backlogItemParts = await BacklogItemPartDataModel.findAll(options);
        const getBacklogItemPartsResult = (backlogItemParts) => {
            const items = backlogItemParts.map((item) => {
                const backlogItemPart = mapDbToApiBacklogItemPart(item);
                const result: ApiBacklogItemPart = {
                    ...backlogItemPart,
                    links: [
                        buildSelfLink(
                            backlogItemPart,
                            `/api/v1/${SPRINT_BACKLOG_PARENT_RESOURCE_NAME}/${item.sprintId}/${SPRINT_BACKLOG_CHILD_RESOURCE_NAME}`
                        )
                    ]
                };
                return result;
            });
            return {
                status: HttpStatus.OK,
                data: {
                    items
                }
            };
        };
        return getBacklogItemPartsResult(backlogItemParts);
    } catch (error) {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: getMessageFromError(error)
        };
    }
};
