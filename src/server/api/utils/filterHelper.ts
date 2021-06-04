import { Request } from "express";

export const getParamFromRequest = (req: Request, paramKey: string): string => {
    const paramValue = req.params[paramKey];
    if (paramValue) {
        return paramValue;
    }
    const queryValue = req.query[paramKey];
    if (queryValue) {
        if (Array.isArray(queryValue)) {
            return (queryValue as string[]).join(",");
        } else {
            return queryValue as string;
        }
    }
    return undefined;
};

export interface ParamsFromRequest {
    projectId?: string;
    sprintId?: string;
    backlogItemId?: string;
    backlogItemPartId?: string;
    backlogItemDisplayId?: string;
    projectDisplayId?: string;
}

export const getParamsFromRequest = (req: Request): ParamsFromRequest => {
    const result: ParamsFromRequest = {};
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
    const backlogItemPartId = getParamFromRequest(req, "backlogItemPartId");
    if (backlogItemPartId) {
        result.backlogItemPartId = backlogItemPartId;
    }
    const backlogItemDisplayId = getParamFromRequest(req, "backlogItemDisplayId");
    if (backlogItemDisplayId) {
        result.backlogItemDisplayId = backlogItemDisplayId;
    }
    const projectDisplayId = getParamFromRequest(req, "projectDisplayId");
    if (projectDisplayId) {
        result.projectDisplayId = projectDisplayId;
    }
    return result;
};
