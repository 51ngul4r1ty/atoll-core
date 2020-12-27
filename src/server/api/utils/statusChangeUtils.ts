// libraries
import {
    ApiBacklogItem,
    cloneApiBacklogItem,
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

export const getUpdatedDataItemWhenStatusChanges = (
    originalApiBacklogItem: ApiBacklogItem,
    newDataItem: ApiBacklogItem
): ApiBacklogItem => {
    let result = newDataItem;
    if (originalApiBacklogItem.status !== newDataItem.status) {
        let changed = false;
        const prevStatusTyped = mapApiStatusToBacklogItem(originalApiBacklogItem.status);
        const statusTyped = mapApiStatusToBacklogItem(newDataItem.status);
        const nowIsoDateString = dateToIsoDateString(new Date());
        const newlyAccepted = !hasBacklogItemAtLeastBeenAccepted(prevStatusTyped) && hasBacklogItemAtLeastBeenAccepted(statusTyped);
        if (newlyAccepted && !newDataItem.acceptedAt) {
            result = getResulApiBacklogItem(changed, newDataItem);
            result.acceptedAt = nowIsoDateString;
            changed = true;
        }
        const newlyReleased = !hasBacklogItemAtLeastBeenReleased(prevStatusTyped) && hasBacklogItemAtLeastBeenReleased(statusTyped);
        if (newlyReleased && !newDataItem.releasedAt) {
            result = getResulApiBacklogItem(changed, newDataItem);
            result.releasedAt = nowIsoDateString;
            changed = true;
        }
        const newlyFinished = !hasBacklogItemAtLeastBeenFinished(prevStatusTyped) && hasBacklogItemAtLeastBeenFinished(statusTyped);
        if (newlyFinished && !newDataItem.finishedAt) {
            result = getResulApiBacklogItem(changed, newDataItem);
            result.finishedAt = nowIsoDateString;
            changed = true;
        }
        const newlyStarted = !hasBacklogItemAtLeastBeenStarted(prevStatusTyped) && hasBacklogItemAtLeastBeenStarted(statusTyped);
        if (newlyStarted && !newDataItem.startedAt) {
            result = getResulApiBacklogItem(changed, newDataItem);
            result.startedAt = nowIsoDateString;
            changed = true;
        }
    }
    return result;
};
