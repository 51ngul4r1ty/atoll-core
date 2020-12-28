// libraries
import {
    ApiBacklogItem,
    ApiBacklogItemInSprint,
    ApiBacklogItemRank,
    ApiCounter,
    ApiProject,
    ApiProjectSettings,
    ApiSprint,
    ApiSprintBacklogItem,
    ApiUserSettings
} from "@atoll/shared";

// utils
import { convertDbCharToBoolean, convertDbFloatToNumber } from "../conversionUtils";

export const mapDbToApiBacklogItem = (item: any): ApiBacklogItem => {
    if (!item) {
        return item;
    }
    return {
        ...item.dataValues,
        estimate: convertDbFloatToNumber(item.dataValues.estimate),
        status: item.dataValues.status || "N"
    };
};

export const mapDbToApiBacklogItemRank = (item: any): ApiBacklogItemRank => {
    if (!item) {
        return item;
    }
    return {
        ...item.dataValues
    };
};

export const mapDbToApiSprint = (item: any): ApiSprint => {
    if (!item) {
        return item;
    }
    return {
        ...item.dataValues,
        acceptedPoints: convertDbFloatToNumber(item.dataValues.acceptedPoints),
        archived: convertDbCharToBoolean(item.dataValues.archived),
        plannedPoints: convertDbFloatToNumber(item.dataValues.plannedPoints),
        remainingSplitPoints: convertDbFloatToNumber(item.dataValues.remainingSplitPoints),
        totalPoints: convertDbFloatToNumber(item.dataValues.totalPoints),
        usedSplitPoints: convertDbFloatToNumber(item.dataValues.usedSplitPoints),
        velocityPoints: convertDbFloatToNumber(item.dataValues.velocityPoints)
    };
};

export const mapDbSprintBacklogToApiBacklogItem = (item: any): ApiBacklogItemInSprint => {
    if (!item) {
        return item;
    }
    const sprintBacklogWithItems = {
        ...item.dataValues
    };
    const backlogitem = sprintBacklogWithItems.backlogitem;
    const result = {
        acceptanceCriteria: backlogitem.acceptanceCriteria,
        acceptedAt: backlogitem.acceptedAt,
        createdAt: backlogitem.createdAt,
        displayindex: sprintBacklogWithItems.displayindex,
        estimate: convertDbFloatToNumber(backlogitem.estimate),
        externalId: backlogitem.externalId,
        finishedAt: backlogitem.finishedAt,
        friendlyId: backlogitem.friendlyId,
        id: backlogitem.id,
        projectId: backlogitem.projectId,
        reasonPhrase: backlogitem.reasonPhrase,
        releasedAt: backlogitem.releasedAt,
        rolePhrase: backlogitem.rolePhrase,
        startedAt: backlogitem.startedAt,
        status: backlogitem.status,
        storyPhrase: backlogitem.storyPhrase,
        type: backlogitem.type,
        updatedAt: backlogitem.updatedAt,
        version: backlogitem.version
    };
    return result;
};

export const mapDbToApiSprintBacklogItem = (item: any): ApiSprintBacklogItem => {
    if (!item) {
        return item;
    }
    return {
        ...item.dataValues
    };
};

export const mapDbToApiCounter = (item: any): ApiCounter => {
    if (!item) {
        return item;
    }
    return {
        ...item.dataValues
    };
};

export const mapDbToApiProjectSettings = (item: any): ApiProjectSettings => {
    if (!item) {
        return item;
    }
    return {
        ...item.dataValues
    };
};

export const mapDbToApiUserSettings = (item: any): ApiUserSettings => {
    if (!item) {
        return item;
    }
    return {
        ...item.dataValues
    };
};

export const mapDbToApiProject = (item: any): ApiProject => {
    if (!item) {
        return item;
    }
    return {
        ...item.dataValues
    };
};
