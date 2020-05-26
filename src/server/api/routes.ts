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
import { route } from "./utils/routerHelper";

export const router = express.Router();

router.options("/*", (req, res, next) => {
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Origin", "*");
    next();
});

router.options("/", (req, res) => {
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.status(204).send();
});
router.get("/", rootHandler);

router.get("/users/:userId/preferences", auth, userPreferencesHandler);

router.get("/users/:userId/feature-toggles", auth, featureTogglesHandler);

router.get("/sprints", auth, sprintsHandler);

router.get("/backlog-items", auth, backlogItemsGetHandler);
router.post("/backlog-items", auth, backlogItemsPostHandler);

route(router, "/backlog-items/:itemId", { get: backlogItemGetHandler, delete: backlogItemsDeleteHandler });

router.post("/actions/reorder-backlog-items", auth, backlogItemsReorderPostHandler);

router.post("/actions/login", loginPostHandler);
router.post("/actions/refresh-token", refreshTokenPostHandler);
