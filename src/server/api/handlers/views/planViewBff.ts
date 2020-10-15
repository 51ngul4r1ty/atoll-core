// externals
import { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";

// utils
import { getParamsFromRequest } from "../../utils/filterHelper";
import { backlogItemFetcher } from "../fetchers/backlogItemFetcher";
import { sprintFetcher } from "../fetchers/sprintFetcher";

export const getRangeBegin = (status: number) => {
    if (status >= 0 && status < 100) {
        return 0;
    } else if (status >= 100 && status < 200) {
        return 100;
    } else if (status >= 200 && status < 300) {
        return 200;
    } else if (status >= 300 && status < 400) {
        return 300;
    } else if (status >= 400 && status < 500) {
        return 400;
    } else if (status >= 500 && status < 600) {
        return 500;
    } else {
        throw new Error(`unexpected status code: ${status}`);
    }
};

export const getRangeEnd = (status: number) => {
    if (status >= 0 && status < 100) {
        return 99;
    } else if (status >= 100 && status < 200) {
        return 199;
    } else if (status >= 200 && status < 300) {
        return 299;
    } else if (status >= 300 && status < 400) {
        return 399;
    } else if (status >= 400 && status < 500) {
        return 499;
    } else if (status >= 500 && status < 600) {
        return 599;
    } else {
        throw new Error(`unexpected status code: ${status}`);
    }
};

export const combineMessages = (...msgs: string[]): string => {
    let result = "";
    msgs.forEach((msg) => {
        if (result) {
            result += "\n";
        }
        result += msg;
    });
    return result;
};

export const combineStatuses = (...statuses: number[]): number => {
    let firstItem = true;
    let rangeEnd: number = undefined;
    let statusMin: number = undefined;
    let statusMax: number = undefined;
    statuses.forEach((status) => {
        const newRangeEnd = getRangeBegin(status);
        if (firstItem) {
            rangeEnd = newRangeEnd;
            statusMin = status;
            statusMax = status;
            firstItem = false;
        } else {
            if (rangeEnd < newRangeEnd) {
                rangeEnd = newRangeEnd;
            }
            if (statusMin > status) {
                statusMin = status;
            }
            if (statusMax < status) {
                statusMax = status;
            }
        }
    });
    if (statusMin === statusMax) {
        return statusMin;
    } else {
        return getRangeBegin(rangeEnd);
    }
};

export const planViewBffGetHandler = async (req: Request, res: Response) => {
    const params = getParamsFromRequest(req);
    //    const backlogItemsResult = await backlogItemFetcher(params.projectId);
    let [backlogItemsResult, sprintsResult] = await Promise.all([
        backlogItemFetcher(params.projectId),
        sprintFetcher(params.projectId)
    ]);
    if (backlogItemsResult.status === HttpStatus.OK && sprintsResult.status === HttpStatus.OK) {
        res.json({
            status: HttpStatus.OK,
            data: {
                backlogItems: backlogItemsResult.data?.items,
                sprints: sprintsResult.data?.items
            }
        });
    } else {
        res.status(backlogItemsResult.status).json({
            status: combineStatuses(backlogItemsResult.status, sprintsResult.status),
            error: {
                msg: combineMessages(backlogItemsResult.error.msg, backlogItemsResult.error.msg)
            }
        });
        console.log(`Unable to fetch backlog items: ${backlogItemsResult.error?.msg}`);
        console.log(`Unable to sprints: ${sprintsResult.error?.msg}`);
    }
};
