// externals
import { Request, Response } from "express";
import * as HttpStatus from "http-status-codes";

// utils
import { respondWithError, respondWithNotFound } from "../../utils/responder";
import { getParamsFromRequest } from "../../utils/filterHelper";
import { backlogItemFetcher } from "../fetchers/backlogItemFetcher";
import { projectByDisplayIdFetcher } from "../fetchers/projectFetcher";

export const backlogItemViewBffGetHandler = async (req: Request, res: Response) => {
    // const userPreferencesResult = await userPreferencesFetcher("{self}", () => getLoggedInAppUserId(req));
    // const selectedProjectId = (userPreferencesResult as UserPreferencesSuccessResponse).data.item.settings.selectedProject;
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

    const backlogItemResult = await backlogItemFetcher(selectedProjectId, backlogItemDisplayId);

    // TODO: May need to retrieve sprints because the whole app may need this info... otherwise will have to
    //       make the API call when navigating back to "Plan" view?
    if (backlogItemResult.status === HttpStatus.OK) {
        res.json({
            status: HttpStatus.OK,
            data: {
                backlogItems: backlogItemResult.data?.items
            }
        });
    } else {
        res.status(backlogItemResult.status).json({
            status: backlogItemResult.status,
            message: backlogItemResult.message
        });
        // TODO: Use logging utils
        console.log(`Unable to fetch backlog items: ${backlogItemResult.message}`);
    }
};
