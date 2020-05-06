// externals
import * as express from "express";
import expressWs from "express-ws";
import * as Ws from "ws";
import * as TextEncodingPolyfill from "text-encoding-polyfill";
// import * as uuidv1 from "uuid/v1";

import bodyParser from "body-parser";
import cors from "cors";
import chalk from "chalk";
import manifestHelpers from "express-manifest-helpers";
import path from "path";

// libraries
import { configureStore, createServerHistory, storeHistoryInstance, getHistoryInstance, setAssetPortOverride } from "@atoll/shared";

// config
import paths from "../../config/paths";

// utils
import errorHandler from "./middleware/errorHandler";
import serverRenderer from "./middleware/serverRenderer";

// routes
import { router } from "./api/routes";

// data access
import { init } from "./dataaccess";
// import { Socket } from "dgram";

Object.assign(global, {
    WebSocket: Ws,
    // Not needed in node 11
    TextEncoder: TextEncodingPolyfill.TextEncoder,
    TextDecoder: TextEncodingPolyfill.TextDecoder
});

init();

require("dotenv").config();

const app = express.default();

const ws = expressWs(app);

ws.app.ws("/ws", function(ws2, req) {
    ws2.on("message", function(msg) {
        console.log(`message received from client: ${msg}, ${JSON.stringify(msg)}`);
        console.log(msg);
        const wss = ws.getWss();
        wss.clients.forEach((client) => {
            if (client != ws2 && client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });
    });
    console.log("client connected");
});

// TODO: In future we should change this strategy, for now we'll use express to serve static assets
// Use Nginx or Apache to serve static assets in production or remove the if() around the following
// lines to use the express.static middleware to serve assets for production (not recommended!)
//if (process.env.NODE_ENV === "development") {
app.use(paths.publicPath, express.static(path.join(paths.clientBuild, paths.publicPath)));
//}

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const EXCLUDED_URLS: string[] = ["/favicon.ico"];

const isApiUrl = (url: string) => url.startsWith("/api");
const includeUrl = (url: string) => !EXCLUDED_URLS.includes(url) && !isApiUrl(url);

const addStore = (_req: express.Request, res: express.Response, next: express.NextFunction | undefined): void => {
    let history: any;
    if (includeUrl(_req.url)) {
        history = createServerHistory({ initialEntries: [_req.url] });
        storeHistoryInstance(history);
    } else {
        history = getHistoryInstance();
    }

    if (history) {
        res.locals.store = configureStore({ history, middleware: [] });
    } else {
        console.log("INFO: skipping store creation - REST API call must have preceded app url request");
    }
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

app.use("/api/v1", router);

app.use(serverRenderer());

app.use(errorHandler);

const envVarToNum = (val: any): number | null => {
    return val ? parseInt(val) : null;
};

const assetPortValue = envVarToNum(process.env.RESOURCE_PORT);
if (assetPortValue) {
    setAssetPortOverride(assetPortValue);
}
let portValue = envVarToNum(process.env.PORT) || 8500;

app.listen(portValue, () => {
    console.log(`Environment PORT value: ${process.env.PORT}`);
    console.log(`[${new Date().toISOString()}]`, chalk.blue(`App is running: http://localhost:${process.env.PORT || 8500}`));
});

export default app;
