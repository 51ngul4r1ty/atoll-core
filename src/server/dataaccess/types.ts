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

export interface StandardNamedItem extends StandardItem, ItemWithName {}

export interface BacklogItem extends StandardItem {
    externalId: string | null;
    rolePhrase: string | null;
    storyPhrase: string;
    reasonPhrase: string | null;
    estimate: number | null;
    type: BacklogItemType;
}

// TODO: Need to figure out good place for this type - it maps to the database structure, but is it really just an exact copy or
//       could it potentially deviate from it?
export interface BacklogItemRank extends StandardItem {
    backlogitemId: string | null;
    nextbacklogitemId: string | null;
}

/* sprints */

export interface Sprint extends StandardNamedItem {
    startDate: Date;
    finishDate: Date;
}
