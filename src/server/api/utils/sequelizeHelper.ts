// externals
import { Request } from "express";
import { FindOptions, Transaction } from "sequelize";

// utils
import { getParamsFromRequest } from "./filterHelper";

export interface OptionsParams {
    friendlyId?: string | null;
    externalId?: string | null;
    projectId?: string | null;
    sprintId?: string | null;
    archived?: string | null;
    backlogitemId?: string | null;
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

export const buildOptionsFromParams = (params: OptionsParams): FindOptions => {
    const options: any = {};
    addWhereClauseToOptions(options, "friendlyId", params.friendlyId);
    addWhereClauseToOptions(options, "externalId", params.externalId);
    addWhereClauseToOptions(options, "projectId", params.projectId);
    addWhereClauseToOptions(options, "sprintId", params.sprintId);
    addWhereClauseToOptions(options, "backlogitemId", params.backlogitemId);
    addWhereClauseToOptions(options, "archived", params.archived);
    return options;
};

export const buildOptions = (req: Request) => {
    const params = getParamsFromRequest(req);
    return buildOptionsFromParams({ projectId: params.projectId });
};

export const buildOptionsWithTransaction = (options: any, transaction: Transaction) => {
    if (options === undefined) {
        if (!transaction) {
            return undefined;
        }
        return { transaction };
    }
    const result = { ...options };
    if (transaction) {
        result.transaction = transaction;
    }
    return result;
};
