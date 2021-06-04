// externals
import * as express from "express";

// middleware
import auth from "../middleware/auth";

// consts/enums
import {
    BACKLOG_ITEM_RANK_RESOURCE_NAME,
    BACKLOG_ITEM_RESOURCE_NAME,
    PROJECT_RESOURCE_NAME,
    SPRINT_BACKLOG_CHILD_RESOURCE_NAME,
    SPRINT_BACKLOG_ITEM_PART_RESOURCE_NAME,
    SPRINT_BACKLOG_PARENT_RESOURCE_NAME,
    SPRINT_RESOURCE_NAME
} from "../resourceNames";

// handlers
import {
    backlogItemsDeleteHandler,
    backlogItemsGetHandler,
    backlogItemsPostHandler,
    backlogItemsReorderPostHandler,
    backlogItemGetHandler,
    backlogItemPutHandler,
    backlogItemPatchHandler
} from "./handlers/backlogItems";
import {
    sprintPostHandler,
    sprintsGetHandler,
    sprintDeleteHandler,
    sprintPatchHandler,
    sprintGetHandler,
    sprintPutHandler
} from "./handlers/sprints";
import { backlogItemRanksGetHandler, backlogItemRankGetHandler } from "./handlers/backlogItemRanks";
import { featureTogglesHandler } from "./handlers/featureToggles";
import { rootHandler } from "./handlers/root";
import { userPreferencesHandler } from "./handlers/userPreferences";
import { loginPostHandler, refreshTokenPostHandler } from "./handlers/auth";
import { sprintBacklogItemPartsPostHandler } from "./handlers/sprintBacklogItemParts";

// utils
import { setupRoutes, setupNoAuthRoutes } from "./utils/routerHelper";
import { planViewBffGetHandler } from "./handlers/views/planViewBff";
import {
    sprintBacklogItemDeleteHandler,
    sprintBacklogItemsGetHandler,
    sprintBacklogItemPostHandler
} from "./handlers/sprintBacklogItems";
import { sprintUpdateStatsPostHandler } from "./handlers/sprintUpdateStats";
import { backlogItemViewBffGetHandler } from "./handlers/views/backlogItemViewBff";
import {
    projectDeleteHandler,
    projectGetHandler,
    projectPatchHandler,
    projectPostHandler,
    projectsGetHandler
} from "./handlers/projects";

export const router = express.Router();

router.options("/*", (req, res, next) => {
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Origin", "*");
    next();
});

setupNoAuthRoutes(router, "/", { get: rootHandler });

setupRoutes(router, "/users/:userId/preferences", { get: userPreferencesHandler });

setupRoutes(router, "/users/:userId/feature-toggles", { get: featureTogglesHandler });

setupRoutes(router, `/${PROJECT_RESOURCE_NAME}`, {
    get: projectsGetHandler,
    post: projectPostHandler
});

setupRoutes(router, `/${PROJECT_RESOURCE_NAME}/:projectId`, {
    get: projectGetHandler,
    patch: projectPatchHandler,
    delete: projectDeleteHandler
});

setupRoutes(router, `/${SPRINT_RESOURCE_NAME}`, {
    get: sprintsGetHandler,
    post: sprintPostHandler
});

setupRoutes(router, `/${SPRINT_RESOURCE_NAME}/:sprintId`, {
    get: sprintGetHandler,
    put: sprintPutHandler,
    patch: sprintPatchHandler,
    delete: sprintDeleteHandler
});

setupRoutes(router, `/${SPRINT_RESOURCE_NAME}/:sprintId/update-stats`, {
    post: sprintUpdateStatsPostHandler
});

setupRoutes(router, `/${SPRINT_BACKLOG_PARENT_RESOURCE_NAME}/:sprintId/${SPRINT_BACKLOG_CHILD_RESOURCE_NAME}`, {
    get: sprintBacklogItemsGetHandler,
    post: sprintBacklogItemPostHandler
});

setupRoutes(
    router,
    `/${SPRINT_BACKLOG_PARENT_RESOURCE_NAME}/:sprintId/${SPRINT_BACKLOG_CHILD_RESOURCE_NAME}/:backlogItemId/${SPRINT_BACKLOG_ITEM_PART_RESOURCE_NAME}`,
    {
        post: sprintBacklogItemPartsPostHandler
    }
);

setupRoutes(router, `/${SPRINT_BACKLOG_PARENT_RESOURCE_NAME}/:sprintId/${SPRINT_BACKLOG_CHILD_RESOURCE_NAME}/:backlogItemId`, {
    delete: sprintBacklogItemDeleteHandler
});

setupRoutes(router, `/${BACKLOG_ITEM_RESOURCE_NAME}`, { get: backlogItemsGetHandler, post: backlogItemsPostHandler });

setupRoutes(router, `/${BACKLOG_ITEM_RESOURCE_NAME}/:itemId`, {
    get: backlogItemGetHandler,
    put: backlogItemPutHandler,
    patch: backlogItemPatchHandler,
    delete: backlogItemsDeleteHandler
});

setupRoutes(router, `/${BACKLOG_ITEM_RANK_RESOURCE_NAME}`, { get: backlogItemRanksGetHandler });

setupRoutes(router, `/${BACKLOG_ITEM_RANK_RESOURCE_NAME}/:itemId`, {
    get: backlogItemRankGetHandler
});

// bff views
setupRoutes(router, `/bff/views/plan`, { get: planViewBffGetHandler });
setupRoutes(router, `/bff/views/project/:projectDisplayId/backlog-item/:backlogItemDisplayId`, {
    get: backlogItemViewBffGetHandler
});

// TODO: Add options routes for these actions
router.post("/actions/reorder-backlog-items", auth, backlogItemsReorderPostHandler);

router.post("/actions/login", loginPostHandler);
router.post("/actions/refresh-token", refreshTokenPostHandler);
