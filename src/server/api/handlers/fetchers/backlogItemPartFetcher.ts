// externals
import { FindOptions, Transaction } from "sequelize";

// libraries
import { ApiBacklogItemPart } from "@atoll/shared";

// data access
import { BacklogItemPartDataModel } from "../../../dataaccess/models/BacklogItemPartDataModel";
import { DB_INCLUDE_ALIAS_SPRINTBACKLOGITEMS } from "../../../dataaccess/models/SprintBacklogItemModel";

// consts/enums
import {
    BACKLOG_ITEM_PART_RESOURCE_NAME,
    SPRINT_BACKLOG_CHILD_RESOURCE_NAME,
    SPRINT_BACKLOG_PARENT_RESOURCE_NAME
} from "../../../resourceNames";

// utils
import { addWhereClauseToOptions } from "../../utils/sequelizeHelper";
import {
    buildResponseFromCatchError,
    buildResponseWithItem,
    buildResponseWithItems,
    RestApiCollectionResult,
    RestApiErrorResult
} from "../../utils/responseBuilder";
import { buildSelfLink } from "../../../utils/linkBuilder";
import { mapDbToApiBacklogItemPart, mapDbToApiSprint } from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { buildBacklogItemPartFindOptionsIncludeForNested } from "../helpers/backlogItemHelper";

export type BacklogItemPartsResult = RestApiCollectionResult<ApiBacklogItemPart>;

export const fetchBacklogItemParts = async (
    backlogItemId: string,
    transaction?: Transaction
): Promise<BacklogItemPartsResult | RestApiErrorResult> => {
    try {
        const options: FindOptions = { order: [["partIndex", "ASC"]] };
        if (transaction) {
            options.transaction = transaction;
        }
        addWhereClauseToOptions(options, "backlogitemId", backlogItemId);
        const dbBacklogItemParts = await BacklogItemPartDataModel.findAll(options);
        const getBacklogItemPartsResult = (dbBacklogItemParts) => {
            const items = dbBacklogItemParts.map((item) => {
                const backlogItemPart = mapDbToApiBacklogItemPart(item);
                const result: ApiBacklogItemPart = {
                    ...backlogItemPart,
                    links: [
                        // TODO: This link seems wrong... a part may not be allocated to a sprint, and this path will be invalid in that case
                        //   see where this is used.
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
        return getBacklogItemPartsResult(dbBacklogItemParts);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export const fetchBacklogItemPart = async (
    backlogItemPartId: string,
    transaction?: Transaction
): Promise<BacklogItemPartsResult | RestApiErrorResult> => {
    try {
        const options: FindOptions = {
            include: buildBacklogItemPartFindOptionsIncludeForNested()
        };
        if (transaction) {
            options.transaction = transaction;
        }
        const dbBacklogItemPart = await BacklogItemPartDataModel.findByPk(backlogItemPartId, options);
        const getBacklogItemPartResult = (dbBacklogItemPart) => {
            const backlogItemPart = mapDbToApiBacklogItemPart(dbBacklogItemPart);
            const result: ApiBacklogItemPart = {
                ...backlogItemPart,
                links: [buildSelfLink(backlogItemPart, `/api/v1/${BACKLOG_ITEM_PART_RESOURCE_NAME}/${backlogItemPart.id}`)]
            };
            const dbSprints = dbBacklogItemPart[DB_INCLUDE_ALIAS_SPRINTBACKLOGITEMS];
            const sprintCount = dbSprints.length;
            if (sprintCount > 1) {
                throw new Error(
                    `Unexpected condition- retrieving a single backlog item part should not result in ${sprintCount}` +
                        " matching related sprints!"
                );
            }
            const dbSprint = dbSprints.length ? dbSprints[0] : null;
            const extra = {
                sprint: !dbSprint ? null : mapDbToApiSprint(dbSprint)
            };
            return buildResponseWithItem(result, extra);
        };
        return getBacklogItemPartResult(dbBacklogItemPart);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};
