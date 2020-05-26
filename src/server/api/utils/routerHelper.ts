import { Router, RequestHandler } from "express";

// middleware
import auth from "../../middleware/auth";

export type RouteMethodHandler = RequestHandler<any>;

export interface RouteHandlers {
    get?: RouteMethodHandler;
    put?: RouteMethodHandler;
    post?: RouteMethodHandler;
    delete?: RouteMethodHandler;
}

export const route = (router: Router, path: string, handlers: RouteHandlers) => {
    const allowMethods = [];
    if (handlers.get) {
        allowMethods.push("GET");
        router.get(path, auth, handlers.get);
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
