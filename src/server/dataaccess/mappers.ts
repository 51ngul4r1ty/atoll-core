import { BacklogItem, Sprint } from "./types";

export const mapToBacklogItem = (item: any): BacklogItem => ({
    ...item.dataValues
});

export const mapToSprint = (item: any): Sprint => ({
    ...item.dataValues
});
