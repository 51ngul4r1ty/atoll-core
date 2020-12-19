// externals
import { combineMessages, combineStatuses } from "api/utils/resultAggregator";
import { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";

// utils
import { getLoggedInAppUserId } from "../../utils/authUtils";
import { getParamsFromRequest } from "../../utils/filterHelper";
import { backlogItemFetcher } from "../fetchers/backlogItemFetcher";
import { FetcherErrorResponse } from "../fetchers/types";
import { userPreferencesFetcher, UserPreferencesSuccessResponse } from "../fetchers/userPreferencesFetcher";

export const backlogItemViewBffGetHandler = async (req: Request, res: Response) => {
    const userPreferencesResult = await userPreferencesFetcher("{self}", () => getLoggedInAppUserId(req));
    const selectedProjectId = (userPreferencesResult as UserPreferencesSuccessResponse).data.item.settings.selectedProject;
    const params = getParamsFromRequest(req);
    const backlogItemDisplayId = params.backlogItemDisplayId;

    const backlogItemResult = await backlogItemFetcher(selectedProjectId, backlogItemDisplayId);

    // TODO: May need to retrieve sprints because the whole app may need this info... otherwise will have to
    //       make the API call when navigating back to "Plan" view?
    if (backlogItemResult.status === HttpStatus.OK && userPreferencesResult.status === HttpStatus.OK) {
        res.json({
            status: HttpStatus.OK,
            data: {
                backlogItems: backlogItemResult.data?.items,
                userPreferences: (userPreferencesResult as UserPreferencesSuccessResponse).data?.item
            }
        });
    } else {
        res.status(backlogItemResult.status).json({
            status: combineStatuses(backlogItemResult.status, userPreferencesResult.status),
            message: combineMessages(
                backlogItemResult.message,
                backlogItemResult.message,
                (userPreferencesResult as FetcherErrorResponse).message
            )
        });
        // TODO: Use logging utils
        console.log(`Unable to fetch backlog items: ${backlogItemResult.message}`);
    }
};
