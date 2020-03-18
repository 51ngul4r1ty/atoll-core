export class LinkedListItem<T> {
    id: string;
    next: LinkedListItem<T> | null;
    data: T;
}

export interface ItemHashMap<T> {
    [id: string]: LinkedListItem<T>;
}

export class LinkedList<T> {
    constructor() {
        this.firstItem = null;
        this.itemHashMap = {};
    }
    private firstItem: LinkedListItem<T>;
    private itemHashMap: ItemHashMap<T>;
    private addMissingItem(id: string) {
        const newItem = new LinkedListItem<T>();
        newItem.id = id;
        this.itemHashMap[id] = newItem;
        return newItem;
    }
    addLink(prevId: string, nextId: string) {
        let next = this.itemHashMap[nextId] || null;
        let prev = this.itemHashMap[prevId] || null;
        if (!next && nextId !== null) {
            next = this.addMissingItem(nextId);
        }
        if (!prev && prevId !== null) {
            prev = this.addMissingItem(prevId);
        }
        if (prev) {
            prev.next = next;
        }
        if (!prevId) {
            this.firstItem = next;
        }
    }
    addItemData(id: string, data: T) {
        const item = this.itemHashMap[id];
        if (item) {
            item.data = data;
        }
    }
    toArray(): T[] {
        const items = [];
        let item = this.firstItem;
        while (item) {
            items.push(item.data);
            item = item.next;
        }
        return items;
    }
}
