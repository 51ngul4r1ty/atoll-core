// externals
import { Transaction } from "sequelize";

// libraries
import {
    ApiSprintStats,
    BacklogItemStatus,
    determineSprintStatus,
    hasBacklogItemAtLeastBeenAccepted,
    mapApiItemToSprint,
    SprintStatus
} from "@atoll/shared";

// data access
import { ApiToDataAccessMapOptions, mapApiToDbSprint, SprintModel } from "../../../dataaccess";

// utils
import { mapDbToApiSprint } from "../../../dataaccess/mappers/dataAccessToApiMappers";

enum Operation {
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

export const handleSprintStatUpdate = async (
    sprintId: string,
    originalBacklogItemStatus: BacklogItemStatus,
    backlogItemStatus: BacklogItemStatus,
    originalBacklogItemEstimate: number | null,
    backlogItemEstimate: number | null,
    transaction: Transaction
): Promise<ApiSprintStats | null> => {
    if (!sprintId) {
        return null;
    }
    let sprintStats: ApiSprintStats;
    const dbSprint = await SprintModel.findOne({ where: { id: sprintId }, transaction });
    const apiSprint = mapDbToApiSprint(dbSprint);
    const sprint = mapApiItemToSprint(apiSprint);
    const sprintStatus = determineSprintStatus(sprint.startDate, sprint.finishDate);
    let totalsChanged = false;
    sprintStats = {
        acceptedPoints: sprint.acceptedPoints,
        plannedPoints: sprint.plannedPoints
    };

    if (backlogItemEstimate || originalBacklogItemEstimate) {
        const acceptedPointsOp = calcSprintStatAcceptedPtsOp(originalBacklogItemStatus, backlogItemStatus);
        switch (acceptedPointsOp) {
            case Operation.Add: {
                sprint.acceptedPoints += backlogItemEstimate;
                totalsChanged = backlogItemEstimate > 0;
                break;
            }
            case Operation.Remove: {
                sprint.acceptedPoints -= originalBacklogItemEstimate;
                totalsChanged = originalBacklogItemEstimate > 0;
                break;
            }
            case Operation.Update: {
                sprint.acceptedPoints += backlogItemEstimate - originalBacklogItemEstimate;
                totalsChanged = backlogItemEstimate !== originalBacklogItemEstimate;
                break;
            }
        }
        const planningPointsOp = calcSprintStatPlanningPtsOp(sprintStatus, originalBacklogItemStatus, backlogItemStatus);
        switch (planningPointsOp) {
            case Operation.Add: {
                sprint.plannedPoints += backlogItemEstimate;
                totalsChanged = totalsChanged || backlogItemEstimate > 0;
                break;
            }
            case Operation.Remove: {
                sprint.plannedPoints -= originalBacklogItemEstimate;
                totalsChanged = totalsChanged || originalBacklogItemEstimate > 0;
                break;
            }
            case Operation.Update: {
                sprint.plannedPoints += backlogItemEstimate - originalBacklogItemEstimate;
                totalsChanged = totalsChanged || backlogItemEstimate !== originalBacklogItemEstimate;
                break;
            }
        }
        if (totalsChanged) {
            const newSprint = {
                ...mapApiToDbSprint(apiSprint, ApiToDataAccessMapOptions.None),
                plannedPoints: sprint.plannedPoints,
                acceptedPoints: sprint.acceptedPoints
            };
            await dbSprint.update(newSprint);
            sprintStats = {
                plannedPoints: sprint.plannedPoints,
                acceptedPoints: sprint.acceptedPoints
            };
        }
    }
    return sprintStats;
};
