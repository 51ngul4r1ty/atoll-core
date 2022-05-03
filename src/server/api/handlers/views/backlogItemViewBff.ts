// externals
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// utils
import { fetchBacklogItemsByDisplayId } from "../fetchers/backlogItemFetcher";
import { isRestApiCollectionResult, isRestApiItemResult } from "../../utils/responseBuilder";
import { getParamsFromRequest } from "../../utils/filterHelper";
import { projectByDisplayIdFetcher } from "../fetchers/projectFetcher";
import { respondWithError, respondWithMessage, respondWithNotFound, respondWithObj } from "../../utils/responder";
import { fetchBacklogItemWithSprintAllocationInfo } from "../aggregators/backlogItemAggregator";
import { logError } from "../utils/serverLogger";

export const backlogItemViewBffGetHandler = async (req: Request, res: Response) => {
    const params = getParamsFromRequest(req);
    const backlogItemDisplayId = params.backlogItemDisplayId;
    const projectDisplayId = params.projectDisplayId;
    const projectFetchResult = await projectByDisplayIdFetcher(projectDisplayId);
    let selectedProjectId: string | null;
    if (!isRestApiCollectionResult(projectFetchResult)) {
        respondWithObj(res, projectFetchResult);
        logError(`backlogItemViewBffGetHandler: ${projectFetchResult.message} (error retrieving project)`);
        return;
    }
    if (!projectFetchResult || (projectFetchResult.data?.items?.length || 0) === 0) {
        respondWithNotFound(res, `No matching project with display ID "${projectDisplayId}" found.`);
        return;
    } else if (projectFetchResult.data.items.length > 1) {
        respondWithError(res, `Too many matching projects with display ID "${projectDisplayId}" found.`);
        return;
    } else {
        selectedProjectId = projectFetchResult.data.items[0].id;
    }

    const backlogItemsResult = await fetchBacklogItemsByDisplayId(selectedProjectId, backlogItemDisplayId);
    if (!isRestApiCollectionResult(backlogItemsResult)) {
        respondWithObj(res, backlogItemsResult);
        logError(`backlogItemViewBffGetHandler: ${backlogItemsResult.message} (error retrieving backlog items)`);
        return;
    }
    const backlogItems = backlogItemsResult.data.items;
    const backlogItemCount = backlogItems.length;
    if (backlogItemCount === 0) {
        respondWithNotFound(res, `Unable to find a backlog item with Display ID ${backlogItemDisplayId}`);
        return;
    } else if (backlogItemCount > 1) {
        respondWithMessage(res, {
            status: StatusCodes.BAD_REQUEST,
            message: `Unexpected result- there should be only one backlog item that matches and ${backlogItemCount} were found!`
        });
        return;
    }
    const backlogItem = backlogItems[0];
    const itemWithSprintInfo = await fetchBacklogItemWithSprintAllocationInfo(backlogItem.id);
    if (isRestApiItemResult(itemWithSprintInfo)) {
        const inProductBacklog = itemWithSprintInfo.data.extra?.inProductBacklog || false;
        const backlogItemPartsAndSprints = itemWithSprintInfo.data.extra?.backlogItemPartsAndSprints || [];
        respondWithObj(res, {
            status: itemWithSprintInfo.status,
            data: {
                backlogItem: itemWithSprintInfo.data.item,
                backlogItemPartsAndSprints,
                inProductBacklog
            }
        });
        return;
    }
    respondWithObj(res, itemWithSprintInfo);
    logError(`backlogItemViewBffGetHandler: ${backlogItemsResult.message} (error)`);
};
