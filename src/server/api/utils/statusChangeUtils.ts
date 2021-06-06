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
    mapApiStatusToBacklogItem
} from "@atoll/shared";

const getResulApiBacklogItem = (changed: boolean, currentResult: ApiBacklogItem): ApiBacklogItem => {
    return changed ? cloneApiBacklogItem(currentResult) : currentResult;
};

const getResulApiBacklogItemPart = (changed: boolean, currentResult: ApiBacklogItemPart): ApiBacklogItemPart => {
    return changed ? cloneApiBacklogItemPart(currentResult) : currentResult;
};

export const getUpdatedBacklogItemWhenStatusChanges = (originalItem: ApiBacklogItem, newItem: ApiBacklogItem): ApiBacklogItem => {
    let result = newItem;
    const originalItemToUse = !originalItem ? ({} as Partial<ApiBacklogItem>) : originalItem;
    if (originalItemToUse.status !== result.status) {
        let changed = false;
        const statusTyped = mapApiStatusToBacklogItem(result.status);
        const nowIsoDateString = dateToIsoDateString(new Date());
        if (hasBacklogItemAtLeastBeenReleased(statusTyped) && !result.releasedAt) {
            result = getResulApiBacklogItem(changed, result);
            result.releasedAt = nowIsoDateString;
            changed = true;
        }
        if (hasBacklogItemAtLeastBeenAccepted(statusTyped) && !result.acceptedAt) {
            result = getResulApiBacklogItem(changed, result);
            result.acceptedAt = nowIsoDateString;
            changed = true;
        }
        if (hasBacklogItemAtLeastBeenFinished(statusTyped) && !result.finishedAt) {
            result = getResulApiBacklogItem(changed, result);
            result.finishedAt = nowIsoDateString;
            changed = true;
        }
        if (hasBacklogItemAtLeastBeenStarted(statusTyped) && !result.startedAt) {
            result = getResulApiBacklogItem(changed, result);
            result.startedAt = nowIsoDateString;
            changed = true;
        }
    }
    return result;
};

export const getUpdatedBacklogItemPartWhenStatusChanges = (
    originalItem: ApiBacklogItemPart,
    newItem: ApiBacklogItemPart
): ApiBacklogItemPart => {
    let result = newItem;
    const originalItemToUse = !originalItem ? ({} as Partial<ApiBacklogItemPart>) : originalItem;
    if (originalItemToUse.status !== result.status) {
        let changed = false;
        const statusTyped = mapApiStatusToBacklogItem(result.status);
        const nowIsoDateString = dateToIsoDateString(new Date());
        // if (hasBacklogItemAtLeastBeenReleased(statusTyped) && !result.releasedAt) {
        //     result = getResulApiBacklogItemPart(changed, result);
        //     result.releasedAt = nowIsoDateString;
        //     changed = true;
        // }
        // if (hasBacklogItemAtLeastBeenAccepted(statusTyped) && !result.acceptedAt) {
        //     result = getResulApiBacklogItemPart(changed, result);
        //     result.acceptedAt = nowIsoDateString;
        //     changed = true;
        // }
        if (hasBacklogItemAtLeastBeenFinished(statusTyped) && !result.finishedAt) {
            result = getResulApiBacklogItemPart(changed, result);
            result.finishedAt = nowIsoDateString;
            changed = true;
        }
        if (hasBacklogItemAtLeastBeenStarted(statusTyped) && !result.startedAt) {
            result = getResulApiBacklogItemPart(changed, result);
            result.startedAt = nowIsoDateString;
            changed = true;
        }
    }
    return result;
};
