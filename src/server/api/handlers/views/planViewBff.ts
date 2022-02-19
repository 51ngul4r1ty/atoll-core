// externals
import type { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";

// libraries
import { mapApiItemsToSprints } from "@atoll/shared";

// interfaces/types
import type { UserPreferencesSuccessResponse } from "../fetchers/userPreferencesFetcher";

// utils
import { backlogItemsFetcher } from "../fetchers/backlogItemFetcher";
import { buildResponseWithData, RestApiCollectionResult, RestApiErrorResult } from "../../utils/responseBuilder";
import { combineMessages, combineStatuses } from "../../utils/resultAggregator";
import { fetchSprints } from "../fetchers/sprintFetcher";
import { fetchSprintBacklogItemsWithLinks, FetchedSprintBacklogItems } from "../fetchers/sprintBacklogItemFetcher";
import { getLoggedInAppUserId } from "../../utils/authUtils";
import { userPreferencesFetcher } from "../fetchers/userPreferencesFetcher";

export const planViewBffGetHandler = async (req: Request, res: Response) => {
    const userPreferencesResult = await userPreferencesFetcher("{self}", () => getLoggedInAppUserId(req));
    const selectedProjectId = (userPreferencesResult as UserPreferencesSuccessResponse).data.item.settings.selectedProject;

    const archived = "N";
    let [backlogItemsResult, sprintsResult] = await Promise.all([
        backlogItemsFetcher(selectedProjectId),
        fetchSprints(selectedProjectId, archived)
    ]);
    const sprintsSuccessResult = sprintsResult as RestApiCollectionResult<any>;
    let sprints = sprintsSuccessResult.data ? sprintsSuccessResult.data?.items : [];
    let sprintBacklogItemsResult: FetchedSprintBacklogItems;
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
        backlogItemsResult.status === HttpStatus.OK &&
        sprintsResult.status === HttpStatus.OK &&
        userPreferencesResult.status === HttpStatus.OK &&
        sprintBacklogItemsStatus === HttpStatus.OK
    ) {
        res.json(
            buildResponseWithData({
                backlogItems: backlogItemsResult.data?.items,
                sprints,
                sprintBacklogItems: sprintBacklogItemsResult?.data?.items,
                userPreferences: (userPreferencesResult as UserPreferencesSuccessResponse).data?.item
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
        // TODO: Use logging utils
        console.log(`Unable to fetch backlog items: ${backlogItemsResult.message}`);
        console.log(`Unable to fetch sprints: ${sprintsResult.message}`);
        console.log(`Unable to fetch sprint backlog items: ${sprintBacklogItemsMessage}`);
    }
};
