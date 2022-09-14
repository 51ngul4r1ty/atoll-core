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
    SPRINT_RESOURCE_NAME,
    USER_RESOURCE_NAME
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
import { userPreferencesGetHandler, userPreferencesPatchHandler } from "./handlers/userPreferences";
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

// this is a local mapping to make the URLs easier to read
const USERS = USER_RESOURCE_NAME;
const PROJECTS = PROJECT_RESOURCE_NAME;

router.options("/*", (req, res, next) => {
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Origin", "*");
    next();
});

setupNoAuthRoutes(router, "/", { get: rootHandler });

setupRoutes(router, `/${USERS}/:userId/preferences`, { get: userPreferencesGetHandler, patch: userPreferencesPatchHandler });

setupRoutes(router, `/${USERS}/:userId/feature-toggles`, { get: featureTogglesHandler });

setupRoutes(router, `/${PROJECTS}`, {
    get: projectsGetHandler,
    post: projectPostHandler
});

setupRoutes(router, `/${PROJECTS}/:projectId`, {
    get: projectGetHandler,
    patch: projectPatchHandler,
    delete: projectDeleteHandler
});

{
    const SPRINTS = SPRINT_RESOURCE_NAME;

    setupRoutes(router, `/${PROJECTS}/:projectId/${SPRINTS}/:sprintId`, {
        get: projectSprintGetHandler
    });

    setupRoutes(router, `/${SPRINTS}`, {
        get: sprintsGetHandler,
        post: sprintPostHandler
    });

    setupRoutes(router, `/${SPRINTS}/:sprintId`, {
        get: sprintGetHandler,
        put: sprintPutHandler,
        patch: sprintPatchHandler,
        delete: sprintDeleteHandler
    });

    setupRoutes(router, `/${SPRINTS}/:sprintId/update-stats`, {
        post: sprintUpdateStatsPostHandler
    });
}

{
    const SPRINTS = SPRINT_BACKLOG_PARENT_RESOURCE_NAME;
    const BACKLOG_ITEMS = SPRINT_BACKLOG_CHILD_RESOURCE_NAME;
    const BACKLOG_ITEMS_PARTS = SPRINT_BACKLOG_PART_CHILD_RESOURCE_NAME;

    setupRoutes(router, `/${SPRINTS}/:sprintId/${BACKLOG_ITEMS}`, {
        get: sprintBacklogItemsGetHandler,
        post: sprintBacklogItemPostHandler
    });

    setupRoutes(router, `/${SPRINTS}/:sprintId/${BACKLOG_ITEMS}/:backlogItemId`, {
        get: sprintBacklogItemGetHandler,
        delete: sprintBacklogItemDeleteHandler
    });

    setupRoutes(router, `/${SPRINTS}/:sprintId/${BACKLOG_ITEMS_PARTS}/:backlogItemPartId`, {
        get: sprintBacklogItemPartGetHandler
    });

    setupRoutes(router, `/${SPRINTS}/:sprintId/${BACKLOG_ITEMS}/:backlogItemId/${SPRINT_BACKLOG_ITEM_PART_RESOURCE_NAME}`, {
        post: sprintBacklogItemPartsPostHandler
    });
}

{
    const BACKLOG_ITEMS = BACKLOG_ITEM_RESOURCE_NAME;

    setupRoutes(router, `/${BACKLOG_ITEMS}`, { get: backlogItemsGetHandler, post: backlogItemsPostHandler });

    setupRoutes(router, `/${BACKLOG_ITEMS}/:itemId`, {
        get: backlogItemGetHandler,
        put: backlogItemPutHandler,
        delete: backlogItemsDeleteHandler
    });

    setupRoutes(router, `/${BACKLOG_ITEMS}/:itemId/join-unallocated-parts`, {
        post: backlogItemJoinUnallocatedPartsPostHandler
    });
}

{
    const BACKLOG_ITEM_PARTS = BACKLOG_ITEM_PART_RESOURCE_NAME;

    setupRoutes(router, `/${BACKLOG_ITEM_PARTS}/:itemId`, {
        get: backlogItemPartGetHandler,
        patch: backlogItemPartPatchHandler
    });
}

{
    const PRODUCT_BACKLOG_ITEMS = PRODUCT_BACKLOG_ITEM_RESOURCE_NAME;

    setupRoutes(router, `/${PRODUCT_BACKLOG_ITEMS}`, { get: productBacklogItemsGetHandler });

    setupRoutes(router, `/${PRODUCT_BACKLOG_ITEMS}/:itemId`, {
        get: productBacklogItemGetHandler
    });
}

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
