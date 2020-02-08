export type uuid = string;

/* backlog items */

export type BacklogItemType = "story" | "issue";

export interface BaseItem {}

export interface ItemWithId {
    id: uuid;
}

export interface ItemWithName {
    name: string;
}

export type Method = "GET" | "POST" | "PUT" | "DELETE";

export interface Link {
    type: string;
    method: Method;
    rel: string;
    uri: string;
}

export interface ItemWithLinks {
    links?: Link[];
}

export interface StandardItem extends BaseItem, ItemWithId, ItemWithLinks {}

export interface ReorderableItem {
    displayIndex: number;
}

export interface StandardNamedItem extends StandardItem, ItemWithName, ReorderableItem {}

export interface BacklogItem extends StandardItem, ReorderableItem {
    externalId: string | null;
    rolePhrase: string | null;
    storyPhrase: string;
    reasonPhrase: string | null;
    estimate: number | null;
    type: BacklogItemType;
}

/* sprints */

export interface Sprint extends StandardNamedItem {
    startDate: Date;
    finishDate: Date;
}
