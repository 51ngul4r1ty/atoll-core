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
import { convertDbFloatToNumber } from "./conversionUtils";

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
    ...item.dataValues
});

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
