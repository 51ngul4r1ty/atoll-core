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
    ApiUserSettings,
    ApiBacklogItemWithParts,
    cloneWithNested
} from "@atoll/shared";

// utils
import { convertDbCharToBoolean, convertDbFloatToNumber } from "../conversionUtils";

export const mapDbToApiBacklogItem = (item: any): ApiBacklogItem => {
    if (!item) {
        return item;
    }
    const dataValueFieldsOnly = cloneWithoutNested(item.dataValues);
    const storyEstimate = convertDbFloatToNumber(item.dataValues.estimate);
    const unallocatedPoints = convertDbFloatToNumber(item.dataValues.unallocatedPoints);
    return {
        ...dataValueFieldsOnly,
        estimate: storyEstimate,
        storyEstimate,
        unallocatedPoints,
        status: item.dataValues.status || "N"
    };
};

export const mapDbToApiBacklogItemWithParts = (item: any): ApiBacklogItemWithParts => {
    if (!item) {
        return item;
    }
    let backlogItemParts: ApiBacklogItemPart[] = item.dataValues.backlogitemparts.map((itemDataValues) =>
        mapDbDataValuesToApiBacklogItemPart(itemDataValues)
    );
    let result: ApiBacklogItemWithParts = {
        ...mapDbToApiBacklogItem(item),
        backlogItemParts
    };
    return result;
};

export const mapDbDataValuesToApiBacklogItemPart = (itemDataValues: any): ApiBacklogItemPart => {
    const dataValueFieldsOnly = cloneWithoutNested(itemDataValues);
    delete dataValueFieldsOnly.isNewRecord;
    return {
        ...dataValueFieldsOnly,
        percentage: convertDbFloatToNumber(itemDataValues.percentage),
        points: convertDbFloatToNumber(itemDataValues.points),
        status: itemDataValues.status || "N"
    };
};

export const mapDbToApiBacklogItemPart = (item: any): ApiBacklogItemPart => {
    if (!item) {
        return item;
    }
    return mapDbDataValuesToApiBacklogItemPart(item.dataValues);
};

export const mapDbToApiBacklogItemRank = (item: any): ApiBacklogItemRank => {
    if (!item) {
        return item;
    }
    const dataValueFieldsOnly = cloneWithoutNested(item.dataValues);
    return {
        ...dataValueFieldsOnly
    };
};

export const mapDbToApiSprint = (item: any): ApiSprint => {
    if (!item) {
        return item;
    }
    const dataValueFieldsOnly = cloneWithoutNested(item.dataValues);
    return {
        ...dataValueFieldsOnly,
        acceptedPoints: convertDbFloatToNumber(item.dataValues.acceptedPoints),
        archived: convertDbCharToBoolean(item.dataValues.archived),
        plannedPoints: convertDbFloatToNumber(item.dataValues.plannedPoints),
        remainingSplitPoints: convertDbFloatToNumber(item.dataValues.remainingSplitPoints),
        totalPoints: convertDbFloatToNumber(item.dataValues.totalPoints),
        usedSplitPoints: convertDbFloatToNumber(item.dataValues.usedSplitPoints),
        velocityPoints: convertDbFloatToNumber(item.dataValues.velocityPoints)
    };
};

export const mapDbSprintBacklogWithNestedToApiBacklogItemInSprint = (item: any): ApiBacklogItemInSprint => {
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
        unallocatedPoints: convertDbFloatToNumber(backlogitem.unallocatedPoints),
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

export const mapDbBacklogPartsWithSprintItemsToApiBacklogItemInSprint = (item: any): ApiBacklogItemInSprint => {
    if (!item) {
        return item;
    }
    const partsWithSprintItems = {
        ...item.dataValues
    };
    const backlogitem = partsWithSprintItems?.backlogitem?.dataValues;
    const sprintbacklogitem = partsWithSprintItems?.sprintbacklogitems?.[0]?.dataValues;
    const result: ApiBacklogItemInSprint = {
        acceptanceCriteria: backlogitem.acceptanceCriteria,
        acceptedAt: backlogitem.acceptedAt,
        createdAt: backlogitem.createdAt,
        displayindex: sprintbacklogitem.displayindex,
        estimate: convertDbFloatToNumber(partsWithSprintItems.points),
        externalId: backlogitem.externalId,
        finishedAt: partsWithSprintItems.finishedAt,
        friendlyId: backlogitem.friendlyId,
        id: backlogitem.id,
        projectId: backlogitem.projectId,
        reasonPhrase: backlogitem.reasonPhrase,
        releasedAt: backlogitem.releasedAt,
        rolePhrase: backlogitem.rolePhrase,
        startedAt: partsWithSprintItems.startedAt,
        status: partsWithSprintItems.status,
        storyPhrase: backlogitem.storyPhrase,
        type: backlogitem.type,
        updatedAt: partsWithSprintItems.updatedAt,
        version: backlogitem.version,
        // part specific fields
        partPercentage: convertDbFloatToNumber(partsWithSprintItems.percentage),
        partIndex: convertDbFloatToNumber(partsWithSprintItems.partIndex),
        totalParts: convertDbFloatToNumber(backlogitem.totalParts),
        unallocatedParts: convertDbFloatToNumber(backlogitem.unallocatedParts),
        unallocatedPoints: convertDbFloatToNumber(backlogitem.unallocatedPoints),
        backlogItemPartId: partsWithSprintItems.id,
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
    const dataValueFieldsOnly = cloneWithoutNested(item.dataValues);
    return {
        ...dataValueFieldsOnly
    };
};

export const mapDbToApiProjectSettings = (item: any): ApiProjectSettings => {
    if (!item) {
        return item;
    }
    const dataValueFieldsOnly = cloneWithNested(item.dataValues);
    return {
        ...dataValueFieldsOnly
    };
};

export const mapDbToApiUserSettings = (item: any): ApiUserSettings => {
    if (!item) {
        return item;
    }
    const dataValueFieldsOnly = cloneWithoutNested(item.dataValues);
    return {
        ...dataValueFieldsOnly,
        settings: cloneWithoutNested(item.dataValues.settings)
    };
};

export const mapDbToApiProject = (item: any): ApiProject => {
    if (!item) {
        return item;
    }
    const dataValueFieldsOnly = cloneWithoutNested(item.dataValues);
    return {
        ...dataValueFieldsOnly
    };
};
