// interfaces/types
import { ItemWithId, Link } from "../dataaccess/types";

// consts/enums
import { APPLICATION_JSON } from "@atoll/shared";

export const buildSelfLink = (item: ItemWithId, basePath: string): Link => {
    return {
        type: APPLICATION_JSON,
        method: "GET",
        rel: "self",
        uri: `${basePath}${item.id}`
    };
};
