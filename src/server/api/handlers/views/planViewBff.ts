// externals
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// libraries
import { ApiProject, ApiSprint, DateOnly, determineSprintStatus, mapApiItemsToSprints, SprintStatus } from "@atoll/shared";

// interfaces/types
import type { UserPreferencesItemResult } from "../fetchers/userPreferencesFetcher";
import type { SprintBacklogItemsResult } from "../fetchers/sprintBacklogItemFetcher";
import { isRestApiErrorResult, RestApiCollectionResult, RestApiErrorResult, RestApiItemResult } from "../../utils/responseBuilder";

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
import { fetchProject } from "../fetchers/projectFetcher";

export const planViewBffGetHandler = async (req: Request, res: Response) => {
    try {
        const userPreferencesResult = await getUserPreferences("--self--", () => getLoggedInAppUserId(req));
        const selectedProjectId = (userPreferencesResult as UserPreferencesItemResult).data.item.settings.selectedProject;

        const [projectResult, backlogItemsResult, sprintsResult] = await Promise.all([
            fetchProject(selectedProjectId),
            fetchBacklogItems(selectedProjectId),
            fetchSprints(selectedProjectId)
        ]);
        const sprintsSuccessResult = sprintsResult as RestApiCollectionResult<any>;
        let sprints = sprintsSuccessResult.data ? sprintsSuccessResult.data?.items : [];
        const archivedSprints = sprints.filter((sprint) => sprint.archived === true);
        let sprintBacklogItemsResult: SprintBacklogItemsResult | RestApiErrorResult;
        let sprintBacklogItemsStatus = StatusCodes.OK;
        let sprintBacklogItemsMessage = "";
        let expandedSprintId: string;
        if (sprints.length) {
            const notStartedSprints = sprints.filter((sprint: ApiSprint) => {
                const status = determineSprintStatus(
                    DateOnly.fromISODate(sprint.startdate),
                    DateOnly.fromISODate(sprint.finishdate)
                );
                return status === SprintStatus.NotStarted;
            });
            if (notStartedSprints.length) {
                const firstNotStartedSprint = notStartedSprints[0];
                sprintBacklogItemsResult = await fetchSprintBacklogItemsWithLinks(firstNotStartedSprint.id);
                if (!isRestApiErrorResult(sprintBacklogItemsResult)) {
                    expandedSprintId = firstNotStartedSprint.id;
                }
            } else if (sprints.length > 0) {
                const lastSprint = sprints[sprints.length - 1];
                sprintBacklogItemsResult = await fetchSprintBacklogItemsWithLinks(lastSprint.id);
                if (!isRestApiErrorResult(sprintBacklogItemsResult)) {
                    expandedSprintId = lastSprint.id;
                }
            }
            if (sprintBacklogItemsResult) {
                sprintBacklogItemsStatus = sprintBacklogItemsResult.status;
                sprintBacklogItemsMessage = sprintBacklogItemsResult.message;
            }
        }
        if (
            isRestApiCollectionResult(backlogItemsResult) &&
            isRestApiCollectionResult(sprintsResult) &&
            isRestApiItemResult(userPreferencesResult) &&
            isRestApiCollectionResult(sprintBacklogItemsResult) &&
            isRestApiItemResult(projectResult)
        ) {
            const projectStats = {
                totalSprintCount: sprints.length,
                archivedSprintCount: archivedSprints.length
            };
            res.json(
                buildResponseWithData({
                    backlogItems: backlogItemsResult.data?.items,
                    sprints,
                    sprintBacklogItems: sprintBacklogItemsResult?.data?.items || [],
                    userPreferences: (userPreferencesResult as UserPreferencesItemResult).data?.item,
                    expandedSprintId: expandedSprintId ?? null,
                    project: projectResult.data?.item,
                    projectStats
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
