// interfaces/types
import { ItemWithId, Link } from "@atoll/shared";

// consts/enums
import { APPLICATION_JSON } from "@atoll/shared";

export const buildLink = (item: ItemWithId, basePath: string, rel: string): Link => {
    return {
        type: APPLICATION_JSON,
        rel,
        uri: `${basePath}${item.id}`
    };
};

export const buildItemLink = (item: ItemWithId, basePath: string) => buildLink(item, basePath, "item");

export const buildSelfLink = (item: ItemWithId, basePath: string) => buildLink(item, basePath, "self");
