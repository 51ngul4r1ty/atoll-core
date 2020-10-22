// libraries
import {
    ApiBacklogItem,
    ApiBacklogItemRank,
    ApiCounter,
    ApiProjectSettings,
    ApiSprint,
    ApiSprintBacklog,
    ApiUserSettings
} from "@atoll/shared";

export const mapToBacklogItem = (item: any): ApiBacklogItem => ({
    ...item.dataValues
});

export const mapToBacklogItemRank = (item: any): ApiBacklogItemRank => ({
    ...item.dataValues
});

export const mapToSprint = (item: any): ApiSprint => ({
    ...item.dataValues
});

export const mapSprintBacklogToItem = (item: any): ApiBacklogItem => {
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
        version: sprintBacklogWithItems.backlogitem.version
    };
    return result;
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
