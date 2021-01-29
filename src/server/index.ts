// externals
import * as express from "express";
import expressWs from "express-ws";
import * as Ws from "ws";
import * as TextEncodingPolyfill from "text-encoding-polyfill";
import bodyParser from "body-parser";
import chalk from "chalk";
import manifestHelpers from "express-manifest-helpers";
import path from "path";

// libraries
import {
    configureStore,
    createServerHistory,
    storeHistoryInstance,
    getHistoryInstance,
    setAssetPortOverride,
    timeNow
} from "@atoll/shared";

// config
import paths from "../../config/paths";

// utils
import errorHandler from "./middleware/errorHandler";
import serverRenderer from "./middleware/serverRenderer";

// routes
import { router } from "./api/routes";

// data access
import { init } from "./dataaccess";
import { PushNotification, PushNotificationType } from "@atoll/shared";

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

let keepAliveCount = 0;

const aggregateKeepAlivesReceived = () => {
    keepAliveCount++;
};

let keepaliveLogTimeout: NodeJS.Timeout = null;

const plural = (singularText: string, pluralText: string, val: number) => (val === 1 ? singularText : pluralText);

const envKeepAlives = (): string => {
    return (process.env.LOG_KEEP_ALIVES || "").toLowerCase();
};

const setKeepaliveLogTimeout = () => {
    keepaliveLogTimeout = setTimeout(() => {
        setKeepaliveLogTimeout();
        if (envKeepAlives() === "true") {
            console.log(`Keep alives received from ${keepAliveCount} ${plural("client", "clients", keepAliveCount)}`);
        }
        keepAliveCount = 0;
    }, 30000);
};

// set up to run at start up and the setTimeout will ensure it keeps running every 30 seconds (same as client)
setKeepaliveLogTimeout();

ws.app.ws("/ws", function(ws2, req) {
    ws2.on("message", function(rawMsg: any) {
        if (typeof rawMsg !== "string") {
            console.warn(`message was not a string`);
            return;
        }
        if (rawMsg.length > 16000) {
            // 16K is too big for this type of message, discarding it
            console.log(`message received from client: "${rawMsg.substr(0, 1000)}..." (truncated)`);
            console.warn(`message size exceeded threshold: ${rawMsg.length} characters in length`);
            return;
        }
        const msg = JSON.parse(rawMsg) as PushNotification<any>;
        if (!msg.type) {
            console.log("message does not have the right structure");
            return;
        }
        if (msg.type === PushNotificationType.KeepAlive) {
            aggregateKeepAlivesReceived();
        } else if (msg.type) {
            console.log(`this is a relayable message - sending to other clients`);
            console.log(`message received from client: ${rawMsg}`);
            const wss = ws.getWss();
            wss.clients.forEach((client) => {
                if (client != ws2 && client.readyState === WebSocket.OPEN) {
                    client.send(rawMsg);
                }
            });
        }
    });
    console.log("client connected");
});

// TODO: In future we should change this strategy, for now we'll use express to serve static assets
// Use Nginx or Apache to serve static assets in production or remove the if() around the following
// lines to use the express.static middleware to serve assets for production (not recommended!)
//if (process.env.NODE_ENV === "development") {
app.use(paths.publicPath, express.static(path.join(paths.clientBuild, paths.publicPath)));
//}

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
    console.log(`[${timeNow().toISOString()}]`, chalk.blue(`App is running: http://localhost:${process.env.PORT || 8500}`));
});

export default app;
