// externals
import * as express from "express";

// middleware
import auth from "../middleware/auth";

// consts/enums
import {
    BACKLOG_ITEM_RANK_RESOURCE_NAME,
    BACKLOG_ITEM_RESOURCE_NAME,
    SPRINT_BACKLOG_CHILD_RESOURCE_NAME,
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
import { sprintPostHandler, sprintsGetHandler, sprintDeleteHandler, sprintPatchHandler } from "./handlers/sprints";
import { backlogItemRanksGetHandler, backlogItemRankGetHandler } from "./handlers/backlogItemRanks";
import { featureTogglesHandler } from "./handlers/featureToggles";
import { rootHandler } from "./handlers/root";
import { userPreferencesHandler } from "./handlers/userPreferences";
import { loginPostHandler, refreshTokenPostHandler } from "./handlers/auth";

// utils
import { setupRoutes, setupNoAuthRoutes } from "./utils/routerHelper";
import { planViewBffGetHandler } from "./handlers/views/planViewBff";
import {
    sprintBacklogItemDeleteHandler,
    sprintBacklogItemsGetHandler,
    sprintBacklogItemPostHandler
} from "./handlers/sprintBacklogItems";
import { sprintUpdateStatsPostHandler } from "./handlers/sprintUpdateStats";

export const router = express.Router();

router.options("/*", (req, res, next) => {
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Origin", "*");
    next();
});

setupNoAuthRoutes(router, "/", { get: rootHandler });

setupRoutes(router, "/users/:userId/preferences", { get: userPreferencesHandler });

setupRoutes(router, "/users/:userId/feature-toggles", { get: featureTogglesHandler });

setupRoutes(router, `/${SPRINT_RESOURCE_NAME}`, {
    get: sprintsGetHandler,
    post: sprintPostHandler
});

setupRoutes(router, `/${SPRINT_RESOURCE_NAME}/:sprintId`, {
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

setupRoutes(router, `/bff/views/plan`, { get: planViewBffGetHandler });

// TODO: Add options routes for these actions
router.post("/actions/reorder-backlog-items", auth, backlogItemsReorderPostHandler);

router.post("/actions/login", loginPostHandler);
router.post("/actions/refresh-token", refreshTokenPostHandler);
