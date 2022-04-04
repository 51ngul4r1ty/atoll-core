// externals
import * as HttpStatus from "http-status-codes";
import { FindOptions, Op, Transaction } from "sequelize";

// libraries
import { ApiBacklogItemPart, ApiSprint, isoDateStringToDate, Link } from "@atoll/shared";

// consts/enums
import { BACKLOG_ITEM_PART_RESOURCE_NAME, SPRINT_RESOURCE_NAME } from "../../../resourceNames";

// data access
import {
    DB_INCLUDE_ALIAS_BACKLOGITEMPARTS,
    DB_INCLUDE_ALIAS_SPRINTBACKLOGITEMS,
    DB_INCLUDE_ALIAS_SPRINT
} from "../../../dataaccess/models/dataModelConsts";
import { SprintDataModel } from "../../../dataaccess/models/SprintDataModel";
import { SprintBacklogItemPartDataModel } from "../../../dataaccess/models/SprintBacklogItemPartDataModel";
import { BacklogItemPartDataModel } from "../../../dataaccess/models/BacklogItemPartDataModel";
import { BacklogItemDataModel } from "../../../dataaccess/models/BacklogItemDataModel";

// utils
import { buildLink, buildSelfLink } from "../../../utils/linkBuilder";
import { buildOptionsFromParams, buildOptionsWithTransaction } from "../../utils/sequelizeHelper";
import {
    buildResponseFromCatchError,
    buildResponseWithItem,
    buildResponseWithItems,
    RestApiCollectionResult,
    RestApiErrorResult,
    RestApiItemResult
} from "../../utils/responseBuilder";
import {
    mapDbToApiBacklogItemPart,
    mapDbToApiSprint,
    mapDbToApiSprintBacklogItem
} from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { buildBacklogItemFindOptionsIncludeForNested } from "../helpers/backlogItemHelper";

export type SprintItemsResult = RestApiCollectionResult<ApiSprint>;
export type SprintsResult = SprintItemsResult | RestApiErrorResult;

export type SprintItemResult = RestApiItemResult<ApiSprint>;
export type SprintResult = SprintItemResult | RestApiErrorResult;

export type PartAndSprintInfoForBacklogItem = {
    sprint: ApiSprint;
    backlogItemPart: ApiBacklogItemPart;
};
export type PartAndSprintInfoForBacklogItemItemResult = RestApiCollectionResult<PartAndSprintInfoForBacklogItem>;
export type PartAndSprintInfoForBacklogItemsResult = PartAndSprintInfoForBacklogItemItemResult | RestApiErrorResult;

export const fetchSprints = async (projectId: string | null, archived?: string | null): Promise<SprintsResult> => {
    try {
        const options = buildOptionsFromParams({ projectId, archived });
        options.order = [
            ["startdate", "ASC"],
            ["name", "ASC"]
        ];
        const dbSprints = await SprintDataModel.findAll(options);
        const items: ApiSprint[] = [];
        let lastSprint: ApiSprint;
        const resourceBasePath = `/api/v1/${SPRINT_RESOURCE_NAME}/`;
        dbSprints.forEach((dbSprint) => {
            const sprintWithoutLinks = mapDbToApiSprint(dbSprint);
            const sprint: ApiSprint = {
                ...sprintWithoutLinks,
                links: [buildSelfLink(sprintWithoutLinks, resourceBasePath)]
            };
            if (lastSprint) {
                lastSprint.links!.push(buildLink(sprint, resourceBasePath, "next"));
            }
            lastSprint = sprint;
            items.push(sprint);
        });
        const result: SprintItemsResult = buildResponseWithItems(items);
        return result;
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export const fetchSprint = async (sprintId: string): Promise<SprintResult> => {
    try {
        const sprint = await SprintDataModel.findByPk(sprintId);
        if (!sprint) {
            return {
                status: HttpStatus.NOT_FOUND,
                message: `Unable to find sprint with ID ${sprintId}.`
            };
        }
        const sprintItem = mapDbToApiSprint(sprint);
        const nextSprint = await fetchNextSprint(isoDateStringToDate(sprintItem.startdate));
        const resourceBasePath = `/api/v1/${SPRINT_RESOURCE_NAME}/`;
        const links: Link[] = [buildSelfLink(sprintItem, resourceBasePath)];
        if (nextSprint) {
            const nextSprintItem = mapDbToApiSprint(nextSprint);
            links.push(buildLink(nextSprintItem, resourceBasePath, "next"));
        }
        const item: ApiSprint = {
            ...sprintItem,
            links
        };
        const result: SprintItemResult = buildResponseWithItem(item);
        return result;
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export const fetchNextSprint = async (currentSprintStartDate: Date, transaction?: Transaction): Promise<SprintDataModel | null> => {
    if (!currentSprintStartDate) {
        throw new Error("fetchNextSprint called without providing currentSprintStartDate!");
    }
    if (!(currentSprintStartDate instanceof Date)) {
        throw new Error("fetchNextSprint called with currentSprintStartDate that is not a Date!");
    }
    const options: FindOptions = {
        where: {
            startdate: { [Op.gte]: currentSprintStartDate }
        },
        order: [["startdate", "ASC"]],
        limit: 2
    };
    if (transaction) {
        options.transaction = transaction;
    }
    const sprintItems = await SprintDataModel.findAll(options);
    if (sprintItems.length === 0) {
        throw new Error(`fetchNextSprint unable to find sprint with date provided: ${currentSprintStartDate}`);
    }
    return sprintItems.length > 1 ? sprintItems[1] : null;
};

export const getIdForSprintContainingBacklogItemPart = async (
    backlogItemPartId: string,
    transaction?: Transaction
): Promise<string | null> => {
    const dbSprintBacklogItem = await SprintBacklogItemPartDataModel.findOne({
        where: { backlogitempartId: backlogItemPartId },
        transaction
    });
    const apiSprintBacklogItem = mapDbToApiSprintBacklogItem(dbSprintBacklogItem);
    return apiSprintBacklogItem ? apiSprintBacklogItem.sprintId : null;
};

export const fetchSprintsForBacklogItem = async (backlogItemId: string | null): Promise<SprintsResult> => {
    try {
        const backlogItemPartAlias = "backlogitempart";
        const sprintAlias = "sprint";
        const options = {
            include: [
                {
                    model: BacklogItemPartDataModel,
                    as: backlogItemPartAlias,
                    where: { backlogitemId: backlogItemId }
                },
                {
                    model: SprintDataModel,
                    as: sprintAlias
                }
            ]
        };
        const dbSbisWithSprintAndBacklogItem = await SprintBacklogItemPartDataModel.findAll(options);
        const items: ApiSprint[] = [];
        const sprintResourceBasePath = `/api/v1/${SPRINT_RESOURCE_NAME}/`;
        dbSbisWithSprintAndBacklogItem.forEach((dbSbiWithSprintAndBacklogItem) => {
            const dbSprint = dbSbiWithSprintAndBacklogItem[sprintAlias];
            const sprintWithoutLinks = mapDbToApiSprint(dbSprint);
            const sprint: ApiSprint = {
                ...sprintWithoutLinks,
                links: [buildSelfLink(sprintWithoutLinks, sprintResourceBasePath)]
            };
            items.push(sprint);
        });

        const result: SprintItemsResult = buildResponseWithItems(items);
        return result;
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export const fetchPartAndSprintInfoForBacklogItem = async (
    backlogItemId: string | null,
    transaction?: Transaction
): Promise<PartAndSprintInfoForBacklogItemsResult> => {
    try {
        const includeSprint = true;
        const options = buildOptionsWithTransaction(
            {
                include: buildBacklogItemFindOptionsIncludeForNested(includeSprint)
            },
            transaction
        );
        const dbBacklogItem: BacklogItemDataModel = await BacklogItemDataModel.findByPk(backlogItemId, options);
        const items: PartAndSprintInfoForBacklogItem[] = [];
        const sprintResourceBasePath = `/api/v1/${SPRINT_RESOURCE_NAME}/`;
        const backlogItemPartResourceBasePath = `/api/v1/${BACKLOG_ITEM_PART_RESOURCE_NAME}/`;
        const dbBacklogItemParts = dbBacklogItem[DB_INCLUDE_ALIAS_BACKLOGITEMPARTS];
        dbBacklogItemParts.forEach((dbBacklogItemPart) => {
            const backlogItemPartWithoutLinks = mapDbToApiBacklogItemPart(dbBacklogItemPart);
            const backlogItemPart: ApiBacklogItemPart = {
                ...backlogItemPartWithoutLinks,
                links: [buildSelfLink(backlogItemPartWithoutLinks, backlogItemPartResourceBasePath)]
            };
            const dbSprintBacklogItems = dbBacklogItemPart[DB_INCLUDE_ALIAS_SPRINTBACKLOGITEMS];
            const backlogItemCount = dbSprintBacklogItems?.length || 0;
            if (!backlogItemCount) {
                items.push({
                    sprint: null,
                    backlogItemPart
                });
            } else {
                dbSprintBacklogItems.forEach((dbSprintBacklogItem) => {
                    const dbSprint = dbSprintBacklogItem[DB_INCLUDE_ALIAS_SPRINT];
                    if (!dbSprint) {
                        throw new Error(
                            `Unexpected condition- a single sprint should be matched for Backlog Item ID` +
                                ` ${dbSprintBacklogItem.backlogitemId}, but 0 were`
                        );
                    } else {
                        const sprintWithoutLinks = mapDbToApiSprint(dbSprint);
                        const sprint: ApiSprint = {
                            ...sprintWithoutLinks,
                            links: [buildSelfLink(sprintWithoutLinks, sprintResourceBasePath)]
                        };
                        items.push({
                            sprint,
                            backlogItemPart
                        });
                    }
                });
            }
        });

        const result: PartAndSprintInfoForBacklogItemItemResult = buildResponseWithItems(items);
        return result;
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};
