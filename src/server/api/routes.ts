// externals
import * as express from "express";

// handlers
import { backlogItemsHandler } from "./handlers/backlogItems";
import { featureTogglesHandler } from "./handlers/featureToggles";
import { rootHandler } from "./handlers/root";
import { sprintsHandler } from "./handlers/sprint";
import { userPreferencesHandler } from "./handlers/userPreferences";

export const router = express.Router();

router.get("/", rootHandler);

router.get("/users/:userId/preferences", userPreferencesHandler);

router.get("/users/:userId/feature-toggles", featureTogglesHandler);

router.get("/sprints", sprintsHandler);

router.get("/backlog-items", backlogItemsHandler);
