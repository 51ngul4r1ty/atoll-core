// externals
import type { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";

// libraries
import { mapApiItemsToSprints } from "@atoll/shared";

// interfaces/types
import type { UserPreferencesItemResult } from "../fetchers/userPreferencesFetcher";
import type { SprintBacklogItemsResult } from "../fetchers/sprintBacklogItemFetcher";
import type { RestApiCollectionResult, RestApiErrorResult } from "../../utils/responseBuilder";

// utils
import { fetchBacklogItems } from "../fetchers/backlogItemFetcher";
import {
    buildResponseFromCatchError,
    buildResponseWithData,
    isRestApiCollectionResult,
    isRestApiItemResult
} from "../../utils/responseBuilder";
import { combineMessages, combineStatuses } from "../../utils/resultAggregator";
import { fetchSprints } from "../fetchers/sprintFetcher";
import { fetchSprintBacklogItemsWithLinks } from "../fetchers/sprintBacklogItemFetcher";
import { getLoggedInAppUserId } from "../../utils/authUtils";
import { getUserPreferences } from "../fetchers/userPreferencesFetcher";
import { logError } from "../utils/serverLogger";

export const planViewBffGetHandler = async (req: Request, res: Response) => {
    try {
        const userPreferencesResult = await getUserPreferences("{self}", () => getLoggedInAppUserId(req));
        const selectedProjectId = (userPreferencesResult as UserPreferencesItemResult).data.item.settings.selectedProject;

        const archived = "N";
        let [backlogItemsResult, sprintsResult] = await Promise.all([
            fetchBacklogItems(selectedProjectId),
            fetchSprints(selectedProjectId, archived)
        ]);
        const sprintsSuccessResult = sprintsResult as RestApiCollectionResult<any>;
        let sprints = sprintsSuccessResult.data ? sprintsSuccessResult.data?.items : [];
        let sprintBacklogItemsResult: SprintBacklogItemsResult | RestApiErrorResult;
        let sprintBacklogItemsStatus = HttpStatus.OK;
        let sprintBacklogItemsMessage = "";
        if (sprints.length) {
            const mappedSprints = mapApiItemsToSprints(sprints);
            const expandedSprints = mappedSprints.filter((item) => item.expanded);
            if (expandedSprints.length) {
                const firstExpandedSprint = expandedSprints[0];
                sprintBacklogItemsResult = await fetchSprintBacklogItemsWithLinks(firstExpandedSprint.id);
                sprintBacklogItemsStatus = sprintBacklogItemsResult.status;
                sprintBacklogItemsMessage = sprintBacklogItemsResult.message;
            }
        }
        if (
            isRestApiCollectionResult(backlogItemsResult) &&
            isRestApiCollectionResult(sprintsResult) &&
            isRestApiItemResult(userPreferencesResult) &&
            isRestApiCollectionResult(sprintBacklogItemsResult)
        ) {
            res.json(
                buildResponseWithData({
                    backlogItems: backlogItemsResult.data?.items,
                    sprints,
                    sprintBacklogItems: sprintBacklogItemsResult?.data?.items,
                    userPreferences: (userPreferencesResult as UserPreferencesItemResult).data?.item
                })
            );
        } else {
            res.status(backlogItemsResult.status).json({
                status: combineStatuses(
                    backlogItemsResult.status,
                    sprintsResult.status,
                    sprintBacklogItemsStatus,
                    userPreferencesResult.status
                ),
                message: combineMessages(
                    backlogItemsResult.message,
                    backlogItemsResult.message,
                    sprintBacklogItemsMessage,
                    (userPreferencesResult as RestApiErrorResult).message
                )
            });
            logError(`Unable to fetch backlog items: ${backlogItemsResult.message}`);
            logError(`Unable to fetch sprints: ${sprintsResult.message}`);
            logError(`Unable to fetch sprint backlog items: ${sprintBacklogItemsMessage}`);
            logError(`Unable to fetch user prefs: ${userPreferencesResult.message}`);
        }
    } catch (error) {
        const errorResponse = buildResponseFromCatchError(error);
        res.status(errorResponse.status).json(errorResponse);
        logError(`Unable to respond to planViewBff API call: ${error}`);
    }
};
