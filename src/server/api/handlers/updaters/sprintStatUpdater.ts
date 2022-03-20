// externals
import { Transaction } from "sequelize";

// libraries
import { ApiSprintStats, BacklogItemStatus, determineSprintStatus, mapApiItemToSprint } from "@atoll/shared";

// data access
import { ApiToDataAccessMapOptions, mapApiToDbSprint, SprintDataModel } from "../../../dataaccess";

// utils
import { mapDbToApiSprint } from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { buildNewSprintStats, buildSprintStatsFromApiSprint } from "../helpers/sprintStatsHelper";

export const handleSprintStatUpdate = async (
    sprintId: string,
    originalBacklogItemStatus: BacklogItemStatus,
    backlogItemStatus: BacklogItemStatus,
    originalBacklogItemPartEstimate: number | null,
    originalBacklogItemEstimate: number | null,
    backlogItemPartEstimate: number | null,
    backlogItemEstimate: number | null,
    transaction: Transaction
): Promise<ApiSprintStats | null> => {
    if (!sprintId) {
        return null;
    }
    let sprintStats: ApiSprintStats;
    const dbSprint = await SprintDataModel.findOne({ where: { id: sprintId }, transaction });
    const apiSprint = mapDbToApiSprint(dbSprint);
    const sprint = mapApiItemToSprint(apiSprint);
    const sprintStatus = determineSprintStatus(sprint.startDate, sprint.finishDate);
    sprintStats = buildSprintStatsFromApiSprint(apiSprint);

    if (backlogItemPartEstimate || originalBacklogItemPartEstimate) {
        const newSprintStatsResult = buildNewSprintStats(
            sprintStats,
            sprintStatus,
            originalBacklogItemPartEstimate,
            originalBacklogItemEstimate,
            originalBacklogItemStatus,
            backlogItemPartEstimate,
            backlogItemEstimate,
            backlogItemStatus
        );
        if (newSprintStatsResult.totalsChanged) {
            const newSprint = {
                ...mapApiToDbSprint(apiSprint, ApiToDataAccessMapOptions.None),
                ...newSprintStatsResult.sprintStats
            };
            await dbSprint.update(newSprint);
            sprintStats = newSprintStatsResult.sprintStats;
        }
    }
    return sprintStats;
};
