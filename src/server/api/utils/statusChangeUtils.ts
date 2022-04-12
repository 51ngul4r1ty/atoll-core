// libraries
import {
    ApiBacklogItem,
    ApiBacklogItemPart,
    cloneApiBacklogItem,
    cloneApiBacklogItemPart,
    dateToIsoDateString,
    hasBacklogItemAtLeastBeenAccepted,
    hasBacklogItemAtLeastBeenFinished,
    hasBacklogItemAtLeastBeenReleased,
    hasBacklogItemAtLeastBeenStarted,
    mapApiStatusToBacklogItem,
    timeNow
} from "@atoll/shared";

const cloneApiBacklogItemIfChanged = (changed: boolean, currentResult: ApiBacklogItem): ApiBacklogItem => {
    return changed ? cloneApiBacklogItem(currentResult) : currentResult;
};

export type UpdatedBacklogItemResult = {
    backlogItem: ApiBacklogItem;
    changed: boolean;
};

/**
 * Return an updated backlog item if the status has changed.
 * @param originalItem backlog item before changes.
 * @param newItem backlog item after changes.
 * @returns backlog item with dates updated based on status change.
 */
export const getUpdatedBacklogItemWhenStatusChanges = (
    originalItem: ApiBacklogItem,
    newItem: ApiBacklogItem
): UpdatedBacklogItemResult => {
    let result = newItem;
    const originalItemToUse = !originalItem ? ({} as Partial<ApiBacklogItem>) : originalItem;
    let changed = false;
    if (originalItemToUse.status !== result.status) {
        const statusTyped = mapApiStatusToBacklogItem(result.status);
        const nowIsoDateString = dateToIsoDateString(timeNow());
        if (hasBacklogItemAtLeastBeenReleased(statusTyped) && !result.releasedAt) {
            result = cloneApiBacklogItemIfChanged(changed, result);
            result.releasedAt = nowIsoDateString;
            changed = true;
        }
        if (hasBacklogItemAtLeastBeenAccepted(statusTyped) && !result.acceptedAt) {
            result = cloneApiBacklogItemIfChanged(changed, result);
            result.acceptedAt = nowIsoDateString;
            changed = true;
        }
        if (hasBacklogItemAtLeastBeenFinished(statusTyped) && !result.finishedAt) {
            result = cloneApiBacklogItemIfChanged(changed, result);
            result.finishedAt = nowIsoDateString;
            changed = true;
        }
        if (hasBacklogItemAtLeastBeenStarted(statusTyped) && !result.startedAt) {
            result = cloneApiBacklogItemIfChanged(changed, result);
            result.startedAt = nowIsoDateString;
            changed = true;
        }
    }
    return {
        backlogItem: result,
        changed
    };
};

const cloneApiBacklogItemPartIfChanged = (changed: boolean, currentResult: ApiBacklogItemPart): ApiBacklogItemPart => {
    return changed ? cloneApiBacklogItemPart(currentResult) : currentResult;
};

export type UpdatedBacklogItemPartResult = {
    backlogItemPart: ApiBacklogItemPart;
    changed: boolean;
};

/**
 * Return an updated backlog item part if the status has changed.
 * @param originalItem backlog item part before changes.
 * @param newItem backlog item part after changes.
 * @returns backlog item part with dates updated based on status change.
 */
export const getUpdatedBacklogItemPartWhenStatusChanges = (
    originalItem: ApiBacklogItemPart,
    newItem: ApiBacklogItemPart
): UpdatedBacklogItemPartResult => {
    let result = newItem;
    const originalItemToUse = !originalItem ? ({} as Partial<ApiBacklogItemPart>) : originalItem;
    if (newItem.status === undefined) {
        throw new Error(
            "Unexpected condition - new item should provide status for getUpdatedBacklogItemPartWhenStatusChanges to work correctly"
        );
    }
    let changed = false;
    if (originalItemToUse.status !== result.status) {
        const statusTyped = mapApiStatusToBacklogItem(result.status);
        const nowIsoDateString = dateToIsoDateString(timeNow());
        if (hasBacklogItemAtLeastBeenFinished(statusTyped) && !result.finishedAt) {
            result = cloneApiBacklogItemPartIfChanged(changed, result);
            result.finishedAt = nowIsoDateString;
            changed = true;
        }
        if (hasBacklogItemAtLeastBeenStarted(statusTyped) && !result.startedAt) {
            result = cloneApiBacklogItemPartIfChanged(changed, result);
            result.startedAt = nowIsoDateString;
            changed = true;
        }
    }
    return {
        backlogItemPart: result,
        changed
    };
};
