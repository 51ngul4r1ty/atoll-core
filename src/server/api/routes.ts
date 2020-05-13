// externals
import * as express from "express";

// middleware
import auth from "../middleware/auth";

// handlers
import {
    backlogItemsDeleteHandler,
    backlogItemsGetHandler,
    backlogItemsPostHandler,
    backlogItemsReorderPostHandler
} from "./handlers/backlogItems";
import { featureTogglesHandler } from "./handlers/featureToggles";
import { rootHandler } from "./handlers/root";
import { sprintsHandler } from "./handlers/sprint";
import { userPreferencesHandler } from "./handlers/userPreferences";
import { loginPostHandler, refreshTokenPostHandler } from "./handlers/auth";

export const router = express.Router();

router.get("/", auth, rootHandler);

router.get("/users/:userId/preferences", auth, userPreferencesHandler);

router.get("/users/:userId/feature-toggles", auth, featureTogglesHandler);

router.get("/sprints", auth, sprintsHandler);

router.get("/backlog-items", auth, backlogItemsGetHandler);
router.post("/backlog-items", auth, backlogItemsPostHandler);
router.delete("/backlog-items/:backlogItemId", auth, backlogItemsDeleteHandler);

router.post("/actions/reorder-backlog-items", auth, backlogItemsReorderPostHandler);

router.post("/actions/login", loginPostHandler);
router.post("/actions/refresh-token", refreshTokenPostHandler);
