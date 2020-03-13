// externals
import * as express from "express";
// import expressWs from "express-ws";
import * as websocket from "websocket";

import bodyParser from "body-parser";
import cors from "cors";
import chalk from "chalk";
import manifestHelpers from "express-manifest-helpers";
import path from "path";

// libraries
import { configureStore, createServerHistory, storeHistoryInstance, getHistoryInstance } from "@atoll/shared";

// config
import paths from "../../config/paths";

// utils
import errorHandler from "./middleware/errorHandler";
import serverRenderer from "./middleware/serverRenderer";

// routes
import { router } from "./api/routes";

// data access
import { init } from "./dataaccess";

init();

require("dotenv").config();

const app = express.default();

// const ws = expressWs(app);

// Use Nginx or Apache to serve static assets in production or remove the if() around the following
// lines to use the express.static middleware to serve assets for production (not recommended!)
if (process.env.NODE_ENV === "development") {
    app.use(paths.publicPath, express.static(path.join(paths.clientBuild, paths.publicPath)));
}

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

app.listen(process.env.PORT || 8500, () => {
    console.log(`[${new Date().toISOString()}]`, chalk.blue(`App is running: http://localhost:${process.env.PORT || 8500}`));
});

// ws.app.ws("/echo", function(ws, req) {
//     ws.on("request", function(msg) {
//         console.log("GOT A REQUEST: " + msg);
//     });
//     ws.on("message", function(msg) {
//         console.log("GOT HERE: " + msg);
//         ws.send(msg);
//     });
// });

const webSocketsServerPort = 8515;
const webSocketServer = require("websocket").server;
const http = require("http");
// Spinning the http server and the websocket server.
const server = http.createServer();
server.listen(webSocketsServerPort);
const wsServer = new webSocketServer({
    httpServer: server
});

const connections = [];

wsServer.on("request", function(request) {
    // var userID = getUniqueID();
    console.log(new Date() + " Recieved a new connection from origin " + request.origin + ".");
    // You can rewrite this part of the code to accept only the requests from allowed origin
    const connection = request.accept(null, request.origin);
    connections.push(connection);
    // clients[userID] = connection;
    // console.log("connected: " + userID + " in " + Object.getOwnPropertyNames(clients));
});

// setTimeout(() => {
//     connections.forEach((connection) => {
//         connection.send(JSON.stringify({ message: "some data for you!" }));
//     });
// }, 5000);

const timeoutFunction = () => {
    connections.forEach((connection) => {
        connection.send(JSON.stringify({ message: "some data for you!" }));
    });
};

const resetTimeout = () => {
    setTimeout(() => {
        timeoutFunction();
        resetTimeout();
    }, 5000);
};

resetTimeout();

wsServer.on("message", function() {
    console.log("got message");
});

export default app;
