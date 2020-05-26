// interfaces/types
import { ItemWithId, Link } from "@atoll/shared";

// consts/enums
import { APPLICATION_JSON } from "@atoll/shared";

export const buildItemLink = (item: ItemWithId, basePath: string): Link => {
    return {
        type: APPLICATION_JSON,
        method: "GET",
        rel: "item",
        uri: `${basePath}${item.id}`
    };
};

export const buildUpdateLink = (item: ItemWithId, basePath: string): Link => {
    return {
        type: APPLICATION_JSON,
        method: "PUT",
        rel: "update",
        uri: `${basePath}${item.id}`
    };
};
