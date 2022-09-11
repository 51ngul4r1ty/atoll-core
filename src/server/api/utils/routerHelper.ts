// externals
import { Router, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

// middleware
import auth from "../../middleware/auth";

export type RouteMethodHandler = RequestHandler<any>;

export interface RouteHandlers {
    get?: RouteMethodHandler;
    patch?: RouteMethodHandler;
    put?: RouteMethodHandler;
    post?: RouteMethodHandler;
    delete?: RouteMethodHandler;
}

export const setupRoutes = (router: Router, path: string, handlers: RouteHandlers) => {
    const allowMethods = [];
    if (handlers.get) {
        allowMethods.push("GET");
        router.get(path, auth, handlers.get);
    }
    if (handlers.patch) {
        allowMethods.push("POST");
        router.patch(path, auth, handlers.patch);
    }
    if (handlers.post) {
        allowMethods.push("POST");
        router.post(path, auth, handlers.post);
    }
    if (handlers.put) {
        allowMethods.push("PUT");
        router.put(path, auth, handlers.put);
    }
    if (handlers.delete) {
        allowMethods.push("DELETE");
        router.delete(path, auth, handlers.delete);
    }
    router.options(path, (req, res) => {
        allowMethods.push("OPTIONS");
        res.set("Access-Control-Allow-Methods", allowMethods.join(", "));
        res.status(204).send();
    });
};

export const setupNotFoundRoutes = (router: Router) => {
    router.all("*", (req, res, next) => {
        res.status(StatusCodes.NOT_FOUND).send({
            status: 404,
            message: `Cannot ${req.method} ${req.originalUrl}`
        });
    });
};

export const setupNoAuthRoutes = (router: Router, path: string, handlers: RouteHandlers) => {
    const allowMethods = [];
    if (handlers.get) {
        allowMethods.push("GET");
        router.get(path, handlers.get);
    }
    if (handlers.post) {
        allowMethods.push("POST");
        router.post(path, handlers.post);
    }
    if (handlers.put) {
        allowMethods.push("PUT");
        router.put(path, handlers.put);
    }
    if (handlers.delete) {
        allowMethods.push("DELETE");
        router.delete(path, handlers.delete);
    }
    router.options(path, (req, res) => {
        allowMethods.push("OPTIONS");
        res.set("Access-Control-Allow-Methods", allowMethods.join(", "));
        res.status(204).send();
    });
};
