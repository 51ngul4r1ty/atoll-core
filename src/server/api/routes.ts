// externals
import * as express from "express";

// middleware
import auth from "../middleware/auth";

// handlers
import {
    backlogItemsDeleteHandler,
    backlogItemsGetHandler,
    backlogItemsPostHandler,
    backlogItemsReorderPostHandler,
    backlogItemGetHandler
} from "./handlers/backlogItems";
import { featureTogglesHandler } from "./handlers/featureToggles";
import { rootHandler } from "./handlers/root";
import { sprintsHandler } from "./handlers/sprint";
import { userPreferencesHandler } from "./handlers/userPreferences";
import { loginPostHandler, refreshTokenPostHandler } from "./handlers/auth";

// utils
import { setupRoutes, setupNoAuthRoutes } from "./utils/routerHelper";

export const router = express.Router();

router.options("/*", (req, res, next) => {
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Origin", "*");
    next();
});

setupNoAuthRoutes(router, "/", { get: rootHandler });

setupRoutes(router, "/users/:userId/preferences", { get: userPreferencesHandler });

setupRoutes(router, "/users/:userId/feature-toggles", { get: featureTogglesHandler });

setupRoutes(router, "/sprints", { get: sprintsHandler });

setupRoutes(router, "/backlog-items", { get: backlogItemsGetHandler, post: backlogItemsPostHandler });

setupRoutes(router, "/backlog-items/:itemId", { get: backlogItemGetHandler, delete: backlogItemsDeleteHandler });

// TODO: Add options routes for these actions
router.post("/actions/reorder-backlog-items", auth, backlogItemsReorderPostHandler);

router.post("/actions/login", loginPostHandler);
router.post("/actions/refresh-token", refreshTokenPostHandler);
