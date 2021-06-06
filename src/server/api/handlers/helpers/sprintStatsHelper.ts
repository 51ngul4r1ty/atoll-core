/**
 * Purpose: To break the rules for all other helpers- they're supposed to serve the needs of one handler, but this one seemed to
 *   make sense as a helper nonetheless.  To serve the purpose of offloading logic from any of the handlers that do something with
 *   sprint stats.  It is still fairly limited in scope for this reason.
 * Reason to change: Data model / logic changes related to the sprint stats (for any related endpoints).
 */

// libraries
import { ApiSprint, ApiSprintStats, BacklogItemStatus, hasBacklogItemAtLeastBeenAccepted, SprintStatus } from "@atoll/shared";

export enum Operation {
    None = 0,
    Add = 1,
    Remove = 2,
    Update = 3
}

export const buildSprintStatsFromApiSprint = (sprint: ApiSprint): ApiSprintStats => ({
    acceptedPoints: sprint.acceptedPoints,
    plannedPoints: sprint.plannedPoints,
    totalPoints: sprint.totalPoints
});

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
    originalBacklogItemPartEstimate: number | null,
    originalBacklogItemEstimate: number | null,
    originalBacklogItemStatus: BacklogItemStatus,
    backlogItemPartEstimate: number | null,
    backlogItemEstimate: number | null,
    backlogItemStatus: BacklogItemStatus
): NewSprintStatsResult => {
    const backlogItemPartEstimateToUse = backlogItemPartEstimate || 0;
    const backlogItemEstimateToUse = backlogItemEstimate || 0;
    const originalBacklogItemPartEstimateToUse = originalBacklogItemPartEstimate || 0;
    const originalBacklogItemEstimateToUse = originalBacklogItemEstimate || 0;
    const newSprintStats = { ...existingSprintStats };
    newSprintStats.totalPoints += backlogItemPartEstimateToUse - originalBacklogItemPartEstimateToUse;
    let totalsChanged = backlogItemPartEstimateToUse !== originalBacklogItemPartEstimateToUse;
    const acceptedPointsOp = calcSprintStatAcceptedPtsOp(originalBacklogItemStatus, backlogItemStatus);
    switch (acceptedPointsOp) {
        case Operation.Add: {
            newSprintStats.acceptedPoints += backlogItemEstimateToUse; // business rule: add story's estimate to accepted
            totalsChanged = totalsChanged || backlogItemEstimateToUse > 0;
            break;
        }
        case Operation.Remove: {
            newSprintStats.acceptedPoints -= originalBacklogItemEstimateToUse; // business rule: remove story's estimate from accepted
            totalsChanged = totalsChanged || originalBacklogItemEstimateToUse > 0;
            break;
        }
        case Operation.Update: {
            newSprintStats.acceptedPoints += backlogItemEstimateToUse - originalBacklogItemEstimateToUse;
            totalsChanged = totalsChanged || backlogItemEstimateToUse !== originalBacklogItemEstimateToUse;
            break;
        }
    }
    const planningPointsOp = calcSprintStatPlanningPtsOp(sprintStatus, originalBacklogItemStatus, backlogItemStatus);
    switch (planningPointsOp) {
        case Operation.Add: {
            newSprintStats.plannedPoints += backlogItemPartEstimateToUse; // business rule: planning total uses part points, not estimate
            totalsChanged = totalsChanged || backlogItemPartEstimateToUse > 0;
            break;
        }
        case Operation.Remove: {
            newSprintStats.plannedPoints -= originalBacklogItemPartEstimateToUse; // business rule: see above
            totalsChanged = totalsChanged || originalBacklogItemPartEstimateToUse > 0;
            break;
        }
        case Operation.Update: {
            newSprintStats.plannedPoints += backlogItemPartEstimateToUse - originalBacklogItemPartEstimateToUse;
            totalsChanged = totalsChanged || backlogItemPartEstimateToUse !== originalBacklogItemPartEstimateToUse;
            break;
        }
    }
    return {
        sprintStats: newSprintStats,
        totalsChanged
    };
};
