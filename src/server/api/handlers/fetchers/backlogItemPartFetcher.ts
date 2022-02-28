// externals
import * as HttpStatus from "http-status-codes";
import { FindOptions, Transaction } from "sequelize";

// libraries
import { ApiBacklogItemPart } from "@atoll/shared";

// data access
import { BacklogItemPartDataModel } from "../../../dataaccess/models/BacklogItemPartDataModel";

// consts/enums
import { SPRINT_BACKLOG_CHILD_RESOURCE_NAME, SPRINT_BACKLOG_PARENT_RESOURCE_NAME } from "../../../resourceNames";

// utils
import { addWhereClauseToOptions } from "../../utils/sequelizeHelper";
import {
    buildResponseFromCatchError,
    buildResponseWithItems,
    RestApiCollectionResult,
    RestApiErrorResult
} from "../../utils/responseBuilder";
import { buildSelfLink } from "../../../utils/linkBuilder";
import { mapDbToApiBacklogItemPart } from "../../../dataaccess/mappers/dataAccessToApiMappers";

export type BacklogItemPartsResult = RestApiCollectionResult<ApiBacklogItemPart>;

export const backlogItemPartFetcher = async (
    backlogItemId: string,
    transaction?: Transaction
): Promise<BacklogItemPartsResult | RestApiErrorResult> => {
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
            return buildResponseWithItems(items);
        };
        return getBacklogItemPartsResult(backlogItemParts);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};
