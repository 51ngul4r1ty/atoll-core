// libraries
import {
    cloneWithoutNested,
    ApiBacklogItem,
    ApiBacklogItemInSprint,
    ApiBacklogItemPart,
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
    const dataValueFieldsOnly = cloneWithoutNested(item.dataValues);
    return {
        ...dataValueFieldsOnly,
        estimate: convertDbFloatToNumber(item.dataValues.estimate),
        status: item.dataValues.status || "N"
    };
};

export const mapDbToApiBacklogItemPart = (item: any): ApiBacklogItemPart => {
    if (!item) {
        return item;
    }
    return {
        ...item.dataValues,
        percentage: convertDbFloatToNumber(item.dataValues.percentage),
        points: convertDbFloatToNumber(item.dataValues.points),
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
    const backlogitempart = sprintBacklogWithItems.backlogitempart?.dataValues;
    const backlogitem = backlogitempart?.backlogitem?.dataValues;
    const result: ApiBacklogItemInSprint = {
        acceptanceCriteria: backlogitem.acceptanceCriteria,
        acceptedAt: backlogitem.acceptedAt,
        createdAt: backlogitem.createdAt,
        displayindex: sprintBacklogWithItems.displayindex,
        estimate: convertDbFloatToNumber(backlogitempart.points),
        externalId: backlogitem.externalId,
        finishedAt: backlogitempart.finishedAt,
        friendlyId: backlogitem.friendlyId,
        id: backlogitem.id,
        projectId: backlogitem.projectId,
        reasonPhrase: backlogitem.reasonPhrase,
        releasedAt: backlogitem.releasedAt,
        rolePhrase: backlogitem.rolePhrase,
        startedAt: backlogitempart.startedAt,
        status: backlogitempart.status,
        storyPhrase: backlogitem.storyPhrase,
        type: backlogitem.type,
        updatedAt: backlogitempart.updatedAt,
        version: backlogitem.version,
        // part specific fields
        partPercentage: convertDbFloatToNumber(backlogitempart.percentage),
        partIndex: convertDbFloatToNumber(backlogitempart.partIndex),
        totalParts: convertDbFloatToNumber(backlogitem.totalParts),
        unallocatedParts: convertDbFloatToNumber(backlogitem.unallocatedParts),
        backlogItemPartId: backlogitempart.id,
        // story specific fields
        storyEstimate: convertDbFloatToNumber(backlogitem.estimate),
        storyStartedAt: backlogitem.startedAt,
        storyFinishedAt: backlogitem.finishedAt,
        storyStatus: backlogitem.status,
        storyUpdatedAt: backlogitem.updatedAt,
        storyVersion: backlogitem.version
    };
    return result;
};

export const mapDbToApiSprintBacklogItem = (item: any): ApiSprintBacklogItem => {
    if (!item) {
        return item;
    }

    const dataValueFieldsOnly = cloneWithoutNested(item.dataValues);
    return {
        ...dataValueFieldsOnly
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
