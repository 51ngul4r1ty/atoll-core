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

export const mapToBacklogItem = (item: any): ApiBacklogItem => {
    //    console.log(`ESTIMATE TYPE = ${typeof item.dataValues.estimate} VALUE = ${item.dataValues.estimate}`);
    const estimateValue = item.dataValues.estimate;
    return {
        ...item.dataValues,
        estimate: estimateValue ? parseFloat(estimateValue) : estimateValue
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
    const result = {
        id: sprintBacklogWithItems.backlogitem.id,
        projectId: sprintBacklogWithItems.backlogitem.projectId,
        friendlyId: sprintBacklogWithItems.backlogitem.friendlyId,
        externalId: sprintBacklogWithItems.backlogitem.externalId,
        rolePhrase: sprintBacklogWithItems.backlogitem.rolePhrase,
        storyPhrase: sprintBacklogWithItems.backlogitem.storyPhrase,
        reasonPhrase: sprintBacklogWithItems.backlogitem.reasonPhrase,
        estimate: sprintBacklogWithItems.backlogitem.estimate,
        type: sprintBacklogWithItems.backlogitem.type,
        createdAt: sprintBacklogWithItems.backlogitem.createdAt,
        updatedAt: sprintBacklogWithItems.backlogitem.updatedAt,
        version: sprintBacklogWithItems.backlogitem.version,
        displayindex: sprintBacklogWithItems.displayindex
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
