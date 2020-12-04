// libraries
import {
    ApiBacklogItem,
    ApiBacklogItemInSprint,
    ApiBacklogItemRank,
    ApiCounter,
    ApiProjectSettings,
    ApiSprint,
    ApiSprintBacklogItem,
    ApiUserSettings
} from "@atoll/shared";

// utils
import { convertBooleanToDbChar, convertDbCharToBoolean, convertDbFloatToNumber } from "./conversionUtils";

export const mapToBacklogItem = (item: any): ApiBacklogItem => {
    return {
        ...item.dataValues,
        estimate: convertDbFloatToNumber(item.dataValues.estimate),
        status: item.dataValues.status || "N"
    };
};

export const mapToBacklogItemRank = (item: any): ApiBacklogItemRank => ({
    ...item.dataValues
});

export const mapToSprint = (item: any): ApiSprint => ({
    ...item.dataValues,
    archived: convertDbCharToBoolean(item.dataValues.archived)
});

export enum MapOptions {
    None = 0,
    ForPatch = 1
}

/**
 * Map a Sprint API object to the field values that need to be persisted in a database.
 * @param sprint object passed into REST API call as-is
 * @param mapOptions optional parameter to determine whether to preserve structure or not, patching requires leaving out fields that
 *                 aren't provided in the input.
 */
export const mapFromSprint = (sprint: ApiSprint, mapOptions?: MapOptions) => {
    if (mapOptions !== MapOptions.ForPatch || sprint.hasOwnProperty("archived")) {
        return {
            ...sprint,
            archived: convertBooleanToDbChar(sprint.archived)
        };
    } else {
        return { ...sprint };
    }
};

export const mapSprintBacklogToBacklogItem = (item: any): ApiBacklogItemInSprint => {
    const sprintBacklogWithItems = {
        ...item.dataValues
    };
    const backlogitem = sprintBacklogWithItems.backlogitem;
    const result = {
        id: backlogitem.id,
        projectId: backlogitem.projectId,
        friendlyId: backlogitem.friendlyId,
        externalId: backlogitem.externalId,
        rolePhrase: backlogitem.rolePhrase,
        storyPhrase: backlogitem.storyPhrase,
        reasonPhrase: backlogitem.reasonPhrase,
        estimate: convertDbFloatToNumber(backlogitem.estimate),
        type: backlogitem.type,
        createdAt: backlogitem.createdAt,
        updatedAt: backlogitem.updatedAt,
        version: backlogitem.version,
        displayindex: sprintBacklogWithItems.displayindex,
        status: backlogitem.status
    };
    return result;
};

export const mapToSprintBacklogItem = (item: any): ApiSprintBacklogItem => {
    return {
        ...item.dataValues
    };
};

export const mapToCounter = (item: any): ApiCounter => ({
    ...item.dataValues
});

export const mapToProjectSettings = (item: any): ApiProjectSettings => ({
    ...item.dataValues
});

export const mapToUserSettings = (item: any): ApiUserSettings => ({
    ...item.dataValues
});
