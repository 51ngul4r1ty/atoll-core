import { BacklogItem, BacklogItemRank, Sprint } from "./types";

export const mapToBacklogItem = (item: any): BacklogItem => ({
    ...item.dataValues
});

export const mapToBacklogItemRank = (item: any): BacklogItemRank => ({
    ...item.dataValues
});

export const mapToSprint = (item: any): Sprint => ({
    ...item.dataValues
});
