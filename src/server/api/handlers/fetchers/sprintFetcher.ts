// externals
import * as HttpStatus from "http-status-codes";
import { FindOptions, Op, Transaction } from "sequelize";

// libraries
import { ApiBacklogItemPart, ApiSprint, isoDateStringToDate, Link } from "@atoll/shared";

// consts/enums
import { SPRINT_RESOURCE_NAME } from "../../../resourceNames";

// data access
import { DB_INCLUDE_ALIAS_SPRINT, SprintDataModel } from "../../../dataaccess/models/SprintDataModel";
import { DB_INCLUDE_ALIAS_SPRINTBACKLOGITEMS, SprintBacklogItemDataModel } from "../../../dataaccess/models/SprintBacklogItem";
import { BacklogItemPartDataModel, DB_INCLUDE_ALIAS_BACKLOGITEMPARTS } from "../../../dataaccess/models/BacklogItemPartDataModel";
import { BacklogItemDataModel } from "../../../dataaccess/models/BacklogItemDataModel";

// interfaces/types
import type { HandlerContext } from "../utils/handlerContext";

// utils
import { buildLink, buildSelfLink } from "../../../utils/linkBuilder";
import { buildOptionsFromParams } from "../../utils/sequelizeHelper";
import {
    buildResponseFromCatchError,
    buildResponseWithItem,
    buildResponseWithItems,
    RestApiCollectionResult,
    RestApiErrorResult
} from "../../utils/responseBuilder";
import {
    mapDbToApiBacklogItemPart,
    mapDbToApiSprint,
    mapDbToApiSprintBacklogItem
} from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { buildBacklogItemFindOptionsIncludeForNested } from "../helpers/backlogItemHelper";

export const fetchSprints = async (projectId: string | null, archived?: string | null) => {
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
        return buildResponseWithItems(items);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export const fetchSprint = async (sprintId: string) => {
    const handlerContext = null;
    try {
        const sprint = await SprintDataModel.findByPk(sprintId);
        if (!sprint) {
            return {
                status: HttpStatus.NOT_FOUND,
                message: `Unable to find sprint with ID ${sprintId}.`
            };
        }
        const sprintItem = mapDbToApiSprint(sprint);
        const nextSprint = await fetchNextSprint(handlerContext, isoDateStringToDate(sprintItem.startdate));
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
        return buildResponseWithItem(item);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export const fetchNextSprint = async (
    handlerContext: HandlerContext | null,
    currentSprintStartDate: Date
): Promise<SprintDataModel | null> => {
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
    if (handlerContext) {
        options.transaction = handlerContext.transactionContext.transaction;
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
    const dbSprintBacklogItem = await SprintBacklogItemDataModel.findOne({
        where: { backlogitempartId: backlogItemPartId },
        transaction
    });
    const apiSprintBacklogItem = mapDbToApiSprintBacklogItem(dbSprintBacklogItem);
    return apiSprintBacklogItem ? apiSprintBacklogItem.sprintId : null;
};

export type FetchSprintsForBacklogItemResult = RestApiCollectionResult<ApiSprint>;

export const fetchSprintsForBacklogItem = async (
    backlogItemId: string | null
): Promise<FetchSprintsForBacklogItemResult | RestApiErrorResult> => {
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
        const dbSbisWithSprintAndBacklogItem = await SprintBacklogItemDataModel.findAll(options);
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

        return buildResponseWithItems(items);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};

export type PartAndSprintInfoForBacklogItem = {
    sprint: ApiSprint;
    backlogItemPart: ApiBacklogItemPart;
};
export type FetchPartAndSprintInfoForBacklogItemResult = RestApiCollectionResult<PartAndSprintInfoForBacklogItem>;

export const fetchPartAndSprintInfoForBacklogItem = async (
    backlogItemId: string | null
): Promise<FetchPartAndSprintInfoForBacklogItemResult | RestApiErrorResult> => {
    try {
        const backlogItemPartAlias = "backlogitempart";
        const sprintAlias = "sprint";
        const includeSprint = true;
        const options = {
            include: buildBacklogItemFindOptionsIncludeForNested(includeSprint)
        };
        const dbBacklogItem: BacklogItemDataModel = await BacklogItemDataModel.findByPk(backlogItemId, options);
        const items: PartAndSprintInfoForBacklogItem[] = [];
        const sprintResourceBasePath = `/api/v1/${SPRINT_RESOURCE_NAME}/`;
        const dbBacklogItemParts = dbBacklogItem[DB_INCLUDE_ALIAS_BACKLOGITEMPARTS];
        dbBacklogItemParts.forEach((dbBacklogItemPart) => {
            const backlogItemPart = mapDbToApiBacklogItemPart(dbBacklogItemPart);
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

        return buildResponseWithItems(items);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};
