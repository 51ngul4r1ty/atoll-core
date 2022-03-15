// externals
import { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";

// utils
import { fetchBacklogItemsByDisplayId } from "../fetchers/backlogItemFetcher";
import { isRestApiCollectionResult, isRestApiItemResult } from "../../utils/responseBuilder";
import { getParamsFromRequest } from "../../utils/filterHelper";
import { projectByDisplayIdFetcher } from "../fetchers/projectFetcher";
import { respondWithError, respondWithMessage, respondWithNotFound, respondWithObj } from "../../utils/responder";
import { fetchBacklogItemWithSprintAllocationInfo } from "../aggregators/backlogItemAggregator";
import { logError } from "../utils/serverLogger";
import { ApiBacklogItemPart, ApiSprint } from "@atoll/shared";

export const backlogItemViewBffGetHandler = async (req: Request, res: Response) => {
    const params = getParamsFromRequest(req);
    const backlogItemDisplayId = params.backlogItemDisplayId;
    const projectDisplayId = params.projectDisplayId;
    const project = await projectByDisplayIdFetcher(projectDisplayId);
    let selectedProjectId: string | null;
    if (!project || project.data?.items?.length === 0) {
        respondWithNotFound(res, `No matching project with display ID "${projectDisplayId}" found.`);
        return;
    } else if (project.data.items.length > 1) {
        respondWithError(res, `Too many matching projects with display ID "${projectDisplayId}" found.`);
        return;
    } else {
        selectedProjectId = project.data.items[0].id;
    }

    const backlogItemsResult = await fetchBacklogItemsByDisplayId(selectedProjectId, backlogItemDisplayId);
    if (!isRestApiCollectionResult(backlogItemsResult)) {
        respondWithObj(res, backlogItemsResult);
        logError(`backlogItemViewBffGetHandler: ${backlogItemsResult.message} (error)`);
    } else {
        const backlogItems = backlogItemsResult.data.items;
        const backlogItemCount = backlogItems.length;
        if (backlogItemCount === 0) {
            respondWithNotFound(res, `Unable to find a backlog item with Display ID ${backlogItemDisplayId}`);
        } else if (backlogItemCount > 1) {
            respondWithMessage(res, {
                status: HttpStatus.BAD_REQUEST,
                message: `Unexpected result- there should be only one backlog item that matches and ${backlogItemCount} were found!`
            });
        } else {
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
            } else {
                respondWithObj(res, itemWithSprintInfo);
                logError(`backlogItemViewBffGetHandler: ${backlogItemsResult.message} (error)`);
            }
        }
    }
};
