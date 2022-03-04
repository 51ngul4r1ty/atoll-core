// externals
import { Request, Response } from "express";

// utils
import { fetchBacklogItemsByDisplayId } from "../fetchers/backlogItemFetcher";
import { isRestApiCollectionResult } from "../../utils/responseBuilder";
import { getParamsFromRequest } from "../../utils/filterHelper";
import { projectByDisplayIdFetcher } from "../fetchers/projectFetcher";
import { respondWithError, respondWithMessage, respondWithNotFound, respondWithObj } from "../../utils/responder";

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

    const backlogItemResult = await fetchBacklogItemsByDisplayId(selectedProjectId, backlogItemDisplayId);

    if (isRestApiCollectionResult(backlogItemResult)) {
        respondWithObj(res, {
            status: backlogItemResult.status,
            data: {
                backlogItems: backlogItemResult.data?.items
            }
        });
    } else {
        respondWithMessage(res, backlogItemResult);
        // TODO: Use logging utils
        console.log(`Unable to fetch backlog items: ${backlogItemResult.message}`);
    }
};
