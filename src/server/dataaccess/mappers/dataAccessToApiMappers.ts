// libraries
import {
    cloneWithoutNested,
    ApiBacklogItem,
    ApiBacklogItemInSprint,
    ApiBacklogItemPart,
    ApiProductBacklogItem,
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
import { convertDateToApiDate, convertDbCharToBoolean, convertDbFloatToNumber } from "../conversionUtils";

export const mapDbToApiBacklogItem = (dbItem: any): ApiBacklogItem => {
    if (!dbItem) {
        return dbItem;
    }
    const dataValueFieldsOnly = cloneWithoutNested(dbItem.dataValues);
    const storyEstimate = convertDbFloatToNumber(dbItem.dataValues.estimate);
    const unallocatedPoints = convertDbFloatToNumber(dbItem.dataValues.unallocatedPoints);
    const unallocatedParts = convertDbFloatToNumber(dbItem.dataValues.unallocatedParts);
    return {
        ...dataValueFieldsOnly,
        estimate: storyEstimate,
        storyEstimate,
        unallocatedPoints,
        unallocatedParts,
        status: dbItem.dataValues.status || "N",
        acceptedAt: convertDateToApiDate(dbItem.dataValues.acceptedAt),
        createdAt: convertDateToApiDate(dbItem.dataValues.createdAt),
        finishedAt: convertDateToApiDate(dbItem.dataValues.finishedAt),
        releasedAt: convertDateToApiDate(dbItem.dataValues.releasedAt),
        startedAt: convertDateToApiDate(dbItem.dataValues.startedAt),
        updatedAt: convertDateToApiDate(dbItem.dataValues.updatedAt)
    };
};

export const mapDbToApiBacklogItemWithParts = (dbItem: any): ApiBacklogItemWithParts => {
    if (!dbItem) {
        return dbItem;
    }
    let backlogItemParts: ApiBacklogItemPart[] = dbItem.dataValues.backlogitemparts.map((itemDataValues) =>
        mapDbDataValuesToApiBacklogItemPart(itemDataValues)
    );
    let result: ApiBacklogItemWithParts = {
        ...mapDbToApiBacklogItem(dbItem),
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
        status: itemDataValues.status || "N",
        createdAt: convertDateToApiDate(itemDataValues.createdAt),
        finishedAt: convertDateToApiDate(itemDataValues.finishedAt),
        startedAt: convertDateToApiDate(itemDataValues.startedAt),
        updatedAt: convertDateToApiDate(itemDataValues.updatedAt)
    };
};

export const mapDbToApiBacklogItemPart = (dbItem: any): ApiBacklogItemPart => {
    if (!dbItem) {
        return dbItem;
    }
    return mapDbDataValuesToApiBacklogItemPart(dbItem.dataValues);
};

export const mapDbToApiProductBacklogItem = (dbItem: any): ApiProductBacklogItem => {
    if (!dbItem) {
        return dbItem;
    }
    const dataValueFieldsOnly = cloneWithoutNested(dbItem.dataValues);
    return {
        ...dataValueFieldsOnly
    };
};

export const mapDbToApiSprint = (dbItem: any): ApiSprint => {
    if (!dbItem) {
        return dbItem;
    }
    const dataValueFieldsOnly = cloneWithoutNested(dbItem.dataValues);
    return {
        ...dataValueFieldsOnly,
        acceptedPoints: convertDbFloatToNumber(dbItem.dataValues.acceptedPoints),
        archived: convertDbCharToBoolean(dbItem.dataValues.archived),
        plannedPoints: convertDbFloatToNumber(dbItem.dataValues.plannedPoints),
        remainingSplitPoints: convertDbFloatToNumber(dbItem.dataValues.remainingSplitPoints),
        totalPoints: convertDbFloatToNumber(dbItem.dataValues.totalPoints),
        usedSplitPoints: convertDbFloatToNumber(dbItem.dataValues.usedSplitPoints),
        velocityPoints: convertDbFloatToNumber(dbItem.dataValues.velocityPoints)
    };
};

export const mapDbSprintBacklogWithNestedToApiBacklogItemInSprint = (dbItem: any): ApiBacklogItemInSprint => {
    if (!dbItem) {
        return dbItem;
    }
    const sprintBacklogWithItems = {
        ...dbItem.dataValues
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

export const mapDbBacklogPartsWithSprintItemsToApiBacklogItemInSprint = (dbItem: any): ApiBacklogItemInSprint => {
    if (!dbItem) {
        return dbItem;
    }
    const partsWithSprintItems = {
        ...dbItem.dataValues
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

export const mapDbToApiSprintBacklogItem = (dbItem: any): ApiSprintBacklogItem => {
    if (!dbItem) {
        return dbItem;
    }

    const dataValueFieldsOnly = cloneWithoutNested(dbItem.dataValues);
    return {
        ...dataValueFieldsOnly
    };
};

export const mapDbToApiCounter = (dbItem: any): ApiCounter => {
    if (!dbItem) {
        return dbItem;
    }
    const dataValueFieldsOnly = cloneWithoutNested(dbItem.dataValues);
    return {
        ...dataValueFieldsOnly
    };
};

export const mapDbToApiProjectSettings = (dbItem: any): ApiProjectSettings => {
    if (!dbItem) {
        return dbItem;
    }
    const dataValueFieldsOnly = cloneWithNested(dbItem.dataValues);
    return {
        ...dataValueFieldsOnly
    };
};

export const mapDbToApiUserSettings = (dbItem: any): ApiUserSettings => {
    if (!dbItem) {
        return dbItem;
    }
    const dataValueFieldsOnly = cloneWithoutNested(dbItem.dataValues);
    return {
        ...dataValueFieldsOnly,
        settings: cloneWithoutNested(dbItem.dataValues.settings)
    };
};

export const mapDbToApiProject = (dbItem: any): ApiProject => {
    if (!dbItem) {
        return dbItem;
    }
    const dataValueFieldsOnly = cloneWithoutNested(dbItem.dataValues);
    return {
        ...dataValueFieldsOnly
    };
};
