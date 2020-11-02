import { Request } from "express";

export const getParamFromRequest = (req: Request, paramKey: string) => {
    const paramValue = req.params[paramKey];
    if (paramValue) {
        return paramValue;
    }
    const queryValue = req.query[paramKey];
    if (queryValue) {
        return queryValue;
    }
    return undefined;
};

export const getParamsFromRequest = (req: Request) => {
    const result: any = {};
    const sprintId = getParamFromRequest(req, "sprintId");
    if (sprintId) {
        result.sprintId = sprintId;
    }
    const projectId = getParamFromRequest(req, "projectId");
    if (projectId) {
        result.projectId = projectId;
    }
    const backlogItemId = getParamFromRequest(req, "backlogItemId");
    if (backlogItemId) {
        result.backlogItemId = backlogItemId;
    }
    return result;
};
