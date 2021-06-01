// libraries
import { ApiSprint, ApiSprintStats, BacklogItemStatus, hasBacklogItemAtLeastBeenAccepted, SprintStatus } from "@atoll/shared";

// utils
import { mapApiToDbSprint } from "../../../dataaccess/mappers/apiToDataAccessMappers";

export const buildSprintStatsFromApiSprint = (sprint: ApiSprint): ApiSprintStats => ({
    acceptedPoints: sprint.acceptedPoints,
    plannedPoints: sprint.plannedPoints,
    totalPoints: sprint.totalPoints
});

export enum Operation {
    None = 0,
    Add = 1,
    Remove = 2,
    Update = 3
}

export const calcSprintStatAcceptedPtsOp = (oldStatus: BacklogItemStatus, newStatus: BacklogItemStatus): Operation => {
    let op = Operation.None;
    if (hasBacklogItemAtLeastBeenAccepted(newStatus)) {
        if (!hasBacklogItemAtLeastBeenAccepted(oldStatus)) {
            // was not accepted, now accepted, that means we need to add
            op = Operation.Add;
        } else {
            // otherwise it is an update
            op = Operation.Update;
        }
    } else {
        if (hasBacklogItemAtLeastBeenAccepted(oldStatus)) {
            // was accepted, now not accepted, that means we need to remove
            op = Operation.Remove;
        } else {
            // this is a no-op: not accepted --> still not accepted
            op = Operation.None;
        }
    }
    return op;
};

export const calcSprintStatPlanningPtsOp = (
    sprintStatus: SprintStatus,
    oldStatus: BacklogItemStatus,
    newStatus: BacklogItemStatus
): Operation => {
    if (sprintStatus === SprintStatus.NotStarted) {
        if (oldStatus === BacklogItemStatus.None && newStatus !== BacklogItemStatus.None) {
            return Operation.Add;
        } else if (oldStatus !== BacklogItemStatus.None && newStatus === BacklogItemStatus.None) {
            return Operation.Remove;
        } else {
            return Operation.Update;
        }
    } else {
        return Operation.None;
    }
};

export interface NewSprintStatsResult {
    sprintStats: ApiSprintStats;
    totalsChanged: boolean;
}

export const buildNewSprintStats = (
    existingSprintStats: ApiSprintStats,
    sprintStatus: SprintStatus,
    originalBacklogItemEstimate: number,
    originalBacklogItemStatus: BacklogItemStatus,
    backlogItemEstimate: number,
    backlogItemStatus: BacklogItemStatus
): NewSprintStatsResult => {
    const newSprintStats = { ...existingSprintStats };
    newSprintStats.totalPoints += backlogItemEstimate - originalBacklogItemEstimate;
    let totalsChanged = backlogItemEstimate !== originalBacklogItemEstimate;
    const acceptedPointsOp = calcSprintStatAcceptedPtsOp(originalBacklogItemStatus, backlogItemStatus);
    switch (acceptedPointsOp) {
        case Operation.Add: {
            newSprintStats.acceptedPoints += backlogItemEstimate;
            totalsChanged = totalsChanged || backlogItemEstimate > 0;
            break;
        }
        case Operation.Remove: {
            newSprintStats.acceptedPoints -= originalBacklogItemEstimate;
            totalsChanged = totalsChanged || originalBacklogItemEstimate > 0;
            break;
        }
        case Operation.Update: {
            newSprintStats.acceptedPoints += backlogItemEstimate - originalBacklogItemEstimate;
            totalsChanged = totalsChanged || backlogItemEstimate !== originalBacklogItemEstimate;
            break;
        }
    }
    const planningPointsOp = calcSprintStatPlanningPtsOp(sprintStatus, originalBacklogItemStatus, backlogItemStatus);
    switch (planningPointsOp) {
        case Operation.Add: {
            newSprintStats.plannedPoints += backlogItemEstimate;
            totalsChanged = totalsChanged || backlogItemEstimate > 0;
            break;
        }
        case Operation.Remove: {
            newSprintStats.plannedPoints -= originalBacklogItemEstimate;
            totalsChanged = totalsChanged || originalBacklogItemEstimate > 0;
            break;
        }
        case Operation.Update: {
            newSprintStats.plannedPoints += backlogItemEstimate - originalBacklogItemEstimate;
            totalsChanged = totalsChanged || backlogItemEstimate !== originalBacklogItemEstimate;
            break;
        }
    }
    return {
        sprintStats: newSprintStats,
        totalsChanged
    };
};
