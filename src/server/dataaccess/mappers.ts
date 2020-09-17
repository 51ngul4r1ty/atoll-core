// libraries
import { ApiBacklogItem, ApiBacklogItemRank, ApiCounter, ApiSprint } from "@atoll/shared";

export const mapToBacklogItem = (item: any): ApiBacklogItem => ({
    ...item.dataValues
});

export const mapToBacklogItemRank = (item: any): ApiBacklogItemRank => ({
    ...item.dataValues
});

export const mapToSprint = (item: any): ApiSprint => ({
    ...item.dataValues
});

export const mapToCounter = (item: any): ApiCounter => ({
    ...item.dataValues
});
