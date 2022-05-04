// externals
import * as express from "express";

// middleware
import auth from "../middleware/auth";

// consts/enums
import {
    BACKLOG_ITEM_PART_RESOURCE_NAME,
    PRODUCT_BACKLOG_ITEM_RESOURCE_NAME,
    BACKLOG_ITEM_RESOURCE_NAME,
    PROJECT_RESOURCE_NAME,
    SPRINT_BACKLOG_CHILD_RESOURCE_NAME,
    SPRINT_BACKLOG_ITEM_PART_RESOURCE_NAME,
    SPRINT_BACKLOG_PARENT_RESOURCE_NAME,
    SPRINT_BACKLOG_PART_CHILD_RESOURCE_NAME,
    SPRINT_RESOURCE_NAME
} from "../resourceNames";

// utils
import { setupRoutes, setupNoAuthRoutes, setupNotFoundRoutes } from "./utils/routerHelper";

// handlers
import {
    backlogItemsDeleteHandler,
    backlogItemsGetHandler,
    backlogItemsPostHandler,
    backlogItemsReorderPostHandler,
    backlogItemJoinUnallocatedPartsPostHandler,
    backlogItemGetHandler,
    backlogItemPutHandler
} from "./handlers/backlogItems";
import {
    sprintPostHandler,
    sprintsGetHandler,
    sprintDeleteHandler,
    sprintPatchHandler,
    sprintGetHandler,
    sprintPutHandler,
    projectSprintGetHandler
} from "./handlers/sprints";
import { productBacklogItemsGetHandler, productBacklogItemGetHandler } from "./handlers/productBacklogItems";
import { featureTogglesHandler } from "./handlers/featureToggles";
import { rootHandler } from "./handlers/root";
import { userPreferencesHandler } from "./handlers/userPreferences";
import { loginPostHandler, refreshTokenPostHandler } from "./handlers/auth";
import { sprintBacklogItemPartGetHandler, sprintBacklogItemPartsPostHandler } from "./handlers/sprintBacklogItemParts";
import { planViewBffGetHandler } from "./handlers/views/planViewBff";
import {
    sprintBacklogItemDeleteHandler,
    sprintBacklogItemsGetHandler,
    sprintBacklogItemPostHandler,
    sprintBacklogItemGetHandler
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
import { backlogItemPartGetHandler, backlogItemPartPatchHandler } from "./handlers/backlogItemParts";

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

setupRoutes(router, `/${PROJECT_RESOURCE_NAME}/:projectId/sprints/:sprintId`, {
    get: projectSprintGetHandler
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

setupRoutes(router, `/${SPRINT_BACKLOG_PARENT_RESOURCE_NAME}/:sprintId/${SPRINT_BACKLOG_CHILD_RESOURCE_NAME}/:backlogItemId`, {
    get: sprintBacklogItemGetHandler,
    delete: sprintBacklogItemDeleteHandler
});

setupRoutes(
    router,
    `/${SPRINT_BACKLOG_PARENT_RESOURCE_NAME}/:sprintId/${SPRINT_BACKLOG_PART_CHILD_RESOURCE_NAME}/:backlogItemPartId`,
    {
        get: sprintBacklogItemPartGetHandler
    }
);

setupRoutes(
    router,
    `/${SPRINT_BACKLOG_PARENT_RESOURCE_NAME}/:sprintId/${SPRINT_BACKLOG_CHILD_RESOURCE_NAME}/:backlogItemId/${SPRINT_BACKLOG_ITEM_PART_RESOURCE_NAME}`,
    {
        post: sprintBacklogItemPartsPostHandler
    }
);

setupRoutes(router, `/${BACKLOG_ITEM_RESOURCE_NAME}`, { get: backlogItemsGetHandler, post: backlogItemsPostHandler });

setupRoutes(router, `/${BACKLOG_ITEM_RESOURCE_NAME}/:itemId`, {
    get: backlogItemGetHandler,
    put: backlogItemPutHandler,
    delete: backlogItemsDeleteHandler
});

setupRoutes(router, `/${BACKLOG_ITEM_RESOURCE_NAME}/:itemId/join-unallocated-parts`, {
    post: backlogItemJoinUnallocatedPartsPostHandler
});

setupRoutes(router, `/${BACKLOG_ITEM_PART_RESOURCE_NAME}/:itemId`, {
    get: backlogItemPartGetHandler,
    patch: backlogItemPartPatchHandler
});

setupRoutes(router, `/${PRODUCT_BACKLOG_ITEM_RESOURCE_NAME}`, { get: productBacklogItemsGetHandler });

setupRoutes(router, `/${PRODUCT_BACKLOG_ITEM_RESOURCE_NAME}/:itemId`, {
    get: productBacklogItemGetHandler
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

setupNotFoundRoutes(router);
