// externals
import * as express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import chalk from "chalk";
import manifestHelpers from "express-manifest-helpers";
import path from "path";

// libraries
import { configureStore, createServerHistory } from "@atoll/shared";

// config
import paths from "../../config/paths";

// utils
import errorHandler from "./middleware/errorHandler";
import serverRenderer from "./middleware/serverRenderer";
import { buildSelfLink } from "./utils/linkBuilder";

// interfaces/types
import { BacklogItem, Sprint } from "./dataaccess/types";

// data access
import { init, mapToBacklogItem, mapToSprint, BacklogItemModel, SprintModel } from "./dataaccess";

init();

require("dotenv").config();

const app = express.default();

// Use Nginx or Apache to serve static assets in production or remove the if() around the following
// lines to use the express.static middleware to serve assets for production (not recommended!)
if (process.env.NODE_ENV === "development") {
    app.use(paths.publicPath, express.static(path.join(paths.clientBuild, paths.publicPath)));
}

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const history = createServerHistory({ initialEntries: ["/"] }); // TODO: Check what initial entries should be

const addStore = (_req: express.Request, res: express.Response, next: express.NextFunction | undefined): void => {
    res.locals.store = configureStore({ history, middleware: [] });
    if (typeof next !== "function") {
        throw new Error("Next handler is missing");
    }
    next();
};

app.use(addStore);

const manifestPath = path.join(paths.clientBuild, paths.publicPath);

app.use(
    manifestHelpers({
        manifestPath: `${manifestPath}/manifest.json`
    })
);

const router = express.Router();
router.get("/", function(req, res) {
    res.json({
        status: 200,
        data: {
            items: [
                {
                    name: "Sprints",
                    displayIndex: 0,
                    links: [
                        {
                            type: "application/json",
                            method: "GET",
                            rel: "self",
                            uri: "/api/v1/sprints"
                        }
                    ]
                },
                {
                    name: "Backlog Items",
                    displayIndex: 1,
                    links: [
                        {
                            type: "application/json",
                            method: "GET",
                            rel: "self",
                            uri: "/api/v1/backlog-items"
                        }
                    ]
                }
            ]
        }
    });
});

router.get("/sprints", function(req, res) {
    SprintModel.findAll()
        .then((sprints) => {
            const items = sprints.map((item) => {
                const sprint = mapToSprint(item);
                const result: Sprint = {
                    ...sprint,
                    links: [buildSelfLink(sprint, "/api/v1/sprints/")]
                };
                return result;
            });
            res.json({
                status: 200,
                data: {
                    items
                }
            });
        })
        .catch((error) => {
            res.json({
                status: 500,
                error: {
                    msg: error
                }
            });
            console.log(`unable to fetch sprints: ${error}`);
        });
});

router.get("/backlog-items", function(req, res) {
    BacklogItemModel.findAll()
        .then((backlogItems) => {
            const items = backlogItems.map((item) => {
                const backlogItem = mapToBacklogItem(item);
                const result: BacklogItem = {
                    ...backlogItem,
                    links: [buildSelfLink(backlogItem, "/api/v1/backlog-items/")]
                };
                return result;
            });
            res.json({
                status: 200,
                data: {
                    items
                }
            });
        })
        .catch((error) => {
            res.json({
                status: 500,
                error: {
                    msg: error
                }
            });
            console.log(`unable to fetch backlog items: ${error}`);
        });
});

app.use("/api/v1", router);

app.use(serverRenderer());

app.use(errorHandler);

app.listen(process.env.PORT || 8500, () => {
    console.log(`[${new Date().toISOString()}]`, chalk.blue(`App is running: http://localhost:${process.env.PORT || 8500}`));
});

export default app;
