// interfaces/types
import { ItemWithId, Link } from "@atoll/shared";

// consts/enums
import { APPLICATION_JSON } from "@atoll/shared";

export const combinePaths = (baseUrl: string, relativeUrl: string): string => {
    if (baseUrl.endsWith("/")) {
        return `${baseUrl}${relativeUrl}`;
    } else {
        return `${baseUrl}/${relativeUrl}`;
    }
};

export const buildSimpleLink = (relativeUri: string, rel: string): Link => {
    return {
        type: APPLICATION_JSON,
        rel,
        uri: relativeUri
    };
};

export const buildLink = (item: ItemWithId, basePath: string, rel: string): Link => {
    return {
        type: APPLICATION_JSON,
        rel,
        uri: combinePaths(basePath, item.id)
    };
};

export const buildItemLink = (item: ItemWithId, basePath: string) => buildLink(item, basePath, "item");

export const buildSelfLink = (item: ItemWithId, basePath: string) => buildLink(item, basePath, "self");

export const buildChldSelfLink = (childItemId: string, parentBasePath: string) =>
    buildLink({ id: childItemId }, parentBasePath, "self");
