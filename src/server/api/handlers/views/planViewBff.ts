// externals
import { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";

// utils
import { backlogItemsFetcher } from "../fetchers/backlogItemFetcher";
import { fetchSprints } from "../fetchers/sprintFetcher";
import { userPreferencesFetcher, UserPreferencesSuccessResponse } from "../fetchers/userPreferencesFetcher";
import { getLoggedInAppUserId } from "../../utils/authUtils";
import { FetcherErrorResponse } from "../fetchers/types";
import { combineMessages, combineStatuses } from "api/utils/resultAggregator";

export const planViewBffGetHandler = async (req: Request, res: Response) => {
    const userPreferencesResult = await userPreferencesFetcher("{self}", () => getLoggedInAppUserId(req));
    const selectedProjectId = (userPreferencesResult as UserPreferencesSuccessResponse).data.item.settings.selectedProject;

    const archived = "N";
    let [backlogItemsResult, sprintsResult] = await Promise.all([
        backlogItemsFetcher(selectedProjectId),
        fetchSprints(selectedProjectId, archived)
    ]);
    if (
        backlogItemsResult.status === HttpStatus.OK &&
        sprintsResult.status === HttpStatus.OK &&
        userPreferencesResult.status === HttpStatus.OK
    ) {
        res.json({
            status: HttpStatus.OK,
            data: {
                backlogItems: backlogItemsResult.data?.items,
                sprints: sprintsResult.data?.items,
                userPreferences: (userPreferencesResult as UserPreferencesSuccessResponse).data?.item
            }
        });
    } else {
        res.status(backlogItemsResult.status).json({
            status: combineStatuses(backlogItemsResult.status, sprintsResult.status, userPreferencesResult.status),
            message: combineMessages(
                backlogItemsResult.message,
                backlogItemsResult.message,
                (userPreferencesResult as FetcherErrorResponse).message
            )
        });
        // TODO: Use logging utils
        console.log(`Unable to fetch backlog items: ${backlogItemsResult.message}`);
        console.log(`Unable to fetch sprints: ${sprintsResult.message}`);
    }
};
