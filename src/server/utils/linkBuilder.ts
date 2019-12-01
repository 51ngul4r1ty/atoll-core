import { ItemWithId, Link } from "../dataaccess/types";

export const buildSelfLink = (item: ItemWithId, basePath: string): Link => {
    return {
        type: "application/json",
        method: "GET",
        rel: "self",
        uri: `${basePath}${item.id}`
    };
};
