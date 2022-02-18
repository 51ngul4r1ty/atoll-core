// externals
import * as HttpStatus from "http-status-codes";
import { FindOptions, Op, Transaction } from "sequelize";

// libraries
import { ApiSprint, isoDateStringToDate, Link } from "@atoll/shared";

// utils
import { mapDbToApiSprint, mapDbToApiSprintBacklogItem } from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { buildOptionsFromParams } from "../../utils/sequelizeHelper";
import { buildLink, buildSelfLink } from "../../../utils/linkBuilder";
import { getMessageFromError } from "../../utils/errorUtils";

// consts/enums
import { SPRINT_RESOURCE_NAME } from "../../../resourceNames";

// data access
import { SprintDataModel } from "../../../dataaccess/models/Sprint";
import { SprintBacklogItemDataModel } from "../../../dataaccess/models/SprintBacklogItem";

// interfaces/types
import type { HandlerContext } from "../utils/handlerContext";

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
        return {
            status: HttpStatus.OK,
            data: {
                items
            }
        };
    } catch (error) {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: getMessageFromError(error)
        };
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
        return {
            status: HttpStatus.OK,
            data: {
                item
            }
        };
    } catch (error) {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: getMessageFromError(error)
        };
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
