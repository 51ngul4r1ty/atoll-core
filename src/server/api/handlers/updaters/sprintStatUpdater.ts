// externals
import { Transaction } from "sequelize";

// libraries
import {
    ApiSprintStats,
    determineSprintStatus,
    hasBacklogItemAtLeastBeenAccepted,
    mapApiItemToBacklogItem,
    mapApiItemToSprint,
    SprintStatus
} from "@atoll/shared";

// data access
import { ApiToDataAccessMapOptions, BacklogItemModel, mapApiToDbSprint, SprintModel } from "../../../dataaccess";

// utils
import { mapDbToApiBacklogItem, mapDbToApiSprint } from "../../../dataaccess/mappers/dataAccessToApiMappers";

export enum StatUpdateMode {
    None = 0,
    Add = 1,
    Remove = 2,
    Update = 3
}

export const handleSprintStatUpdate = async (
    updateMode: StatUpdateMode,
    sprintId: string,
    backlogItemId: string,
    transaction: Transaction
): Promise<ApiSprintStats> => {
    let sprintStats: ApiSprintStats;
    const dbBacklogItem = await BacklogItemModel.findOne({ where: { id: backlogItemId }, transaction });
    const apiBacklogItem = mapDbToApiBacklogItem(dbBacklogItem);
    const backlogItemTyped = mapApiItemToBacklogItem(apiBacklogItem);
    const dbSprint = await SprintModel.findOne({ where: { id: sprintId }, transaction });
    const apiSprint = mapDbToApiSprint(dbSprint);
    const sprint = mapApiItemToSprint(apiSprint);
    const sprintStatus = determineSprintStatus(sprint.startDate, sprint.finishDate);
    let totalsChanged = false;
    sprintStats = {
        acceptedPoints: sprint.acceptedPoints,
        plannedPoints: sprint.plannedPoints
    };

    if (backlogItemTyped.estimate) {
        if (hasBacklogItemAtLeastBeenAccepted(backlogItemTyped)) {
            totalsChanged = true;
            switch (updateMode) {
                case StatUpdateMode.Add:
                    sprint.acceptedPoints += backlogItemTyped.estimate;
                    break;
            }
        }
        if (sprintStatus === SprintStatus.NotStarted) {
            totalsChanged = true;
            switch (updateMode) {
                case StatUpdateMode.Add:
                    sprint.plannedPoints += backlogItemTyped.estimate;
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
