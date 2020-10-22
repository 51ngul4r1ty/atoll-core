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
}

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
    return result;
};

export interface OptionsParams {
    projectId?: string | null;
    sprintId?: string | null;
}

export const addWhereClauseToOptions = (options: any, key: string, value: any) => {
    if (value === undefined) {
        return;
    }
    if (!options.where) {
        options.where = {};
    }
    options.where[key] = value;
};

export const buildOptionsFromParams = (params: OptionsParams) => {
    const options: any = {};
    addWhereClauseToOptions(options, "projectId", params.projectId);
    addWhereClauseToOptions(options, "sprintId", params.sprintId);
    return options;
};

export const buildOptions = (req: Request) => {
    const params = getParamsFromRequest(req);
    return buildOptionsFromParams({ projectId: params.projectId });
};
