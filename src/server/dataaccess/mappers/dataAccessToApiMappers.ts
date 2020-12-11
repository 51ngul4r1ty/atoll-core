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
import { convertDbCharToBoolean, convertDbFloatToNumber } from "../conversionUtils";

export const mapToBacklogItem = (item: any): ApiBacklogItem => {
    if (!item) {
        return item;
    }
    return {
        ...item.dataValues,
        estimate: convertDbFloatToNumber(item.dataValues.estimate),
        status: item.dataValues.status || "N"
    };
};

export const mapToBacklogItemRank = (item: any): ApiBacklogItemRank => {
    if (!item) {
        return item;
    }
    return {
        ...item.dataValues
    };
};

export const mapToSprint = (item: any): ApiSprint => {
    if (!item) {
        return item;
    }
    return {
        ...item.dataValues,
        plannedPoints: convertDbFloatToNumber(item.dataValues.plannedPoints),
        acceptedPoints: convertDbFloatToNumber(item.dataValues.acceptedPoints),
        velocityPoints: convertDbFloatToNumber(item.dataValues.velocityPoints),
        remainingSplitPoints: convertDbFloatToNumber(item.dataValues.remainingSplitPoints),
        archived: convertDbCharToBoolean(item.dataValues.archived)
    };
};

export const mapSprintBacklogToBacklogItem = (item: any): ApiBacklogItemInSprint => {
    if (!item) {
        return item;
    }
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
    if (!item) {
        return item;
    }
    return {
        ...item.dataValues
    };
};

export const mapToCounter = (item: any): ApiCounter => {
    if (!item) {
        return item;
    }
    return {
        ...item.dataValues
    };
};

export const mapToProjectSettings = (item: any): ApiProjectSettings => {
    if (!item) {
        return item;
    }
    return {
        ...item.dataValues
    };
};

export const mapToUserSettings = (item: any): ApiUserSettings => {
    if (!item) {
        return item;
    }
    return {
        ...item.dataValues
    };
};
