// externals
import * as express from "express";

// handlers
import { rootHandler } from "./handlers/root";
import { sprintsHandler } from "./handlers/sprint";
import { backlogItemsHandler } from "./handlers/backlogItems";
import { userPreferencesHandler } from "./handlers/userPreferences";

export const router = express.Router();

router.get("/", rootHandler);

router.get("/users/:userId/preferences", userPreferencesHandler);

router.get("/sprints", sprintsHandler);

router.get("/backlog-items", backlogItemsHandler);
