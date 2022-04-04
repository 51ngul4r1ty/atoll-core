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
    backlogitempartId?: string | null;
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

export const buildOptionsFromParams = (params: OptionsParams, transaction?: Transaction): FindOptions => {
    const options: any = {};
    addWhereClauseToOptions(options, "friendlyId", params.friendlyId);
    addWhereClauseToOptions(options, "externalId", params.externalId);
    addWhereClauseToOptions(options, "projectId", params.projectId);
    addWhereClauseToOptions(options, "sprintId", params.sprintId);
    addWhereClauseToOptions(options, "backlogitemId", params.backlogitemId);
    addWhereClauseToOptions(options, "backlogitempartId", params.backlogitempartId);
    addWhereClauseToOptions(options, "archived", params.archived);
    return buildOptionsWithTransaction(options, transaction);
};

export const addIncludeAllNestedToOptions = (options: FindOptions): FindOptions => {
    const result = { ...options };
    if (options.include) {
        throw new Error(
            `Unexpected condition: options already had include "${options.include}" - unable to add include all,nested`
        );
    }
    result.include = {
        all: true,
        nested: true
    };
    return result;
};

export const buildOptions = (req: Request, transaction: Transaction) => {
    const params = getParamsFromRequest(req);
    return buildOptionsFromParams({ projectId: params.projectId }, transaction);
};

export const buildOptionsWithTransaction = (options: any, transaction: Transaction) => {
    if (!transaction) {
        return options;
    }
    if (options === undefined) {
        if (!transaction) {
            return undefined;
        }
        return { transaction };
    }
    return { ...options, transaction };
};
