/**
 * Purpose: To offload individual steps in the backlogItem handler.
 * Reason to change: Data model / logic changes related to the backlogitem API endpoints.
 */

// externals
import type { Includeable, IncludeOptions } from "sequelize";

// data access
import {
    DB_INCLUDE_ALIAS_BACKLOGITEMPARTS,
    DB_INCLUDE_ALIAS_SPRINT,
    DB_INCLUDE_ALIAS_SPRINTBACKLOGITEMS
} from "../../../dataaccess/models/dataModelConsts";
import { BacklogItemDataModel, SprintDataModel } from "../../../dataaccess";
import { BacklogItemPartDataModel } from "../../../dataaccess/models/BacklogItemPartDataModel";
import { SprintBacklogItemPartDataModel } from "../../../dataaccess/models/SprintBacklogItemPartDataModel";

// utils
import { convertDbFloatToNumber } from "../../../dataaccess/conversionUtils";

export const computeUnallocatedParts = (dbBacklogItemPartsWithNested: BacklogItemPartDataModel[]): number => {
    if (!dbBacklogItemPartsWithNested) {
        throw new Error("it is not possible to compute unallocated parts from an undefined input");
    }
    let unallocatedParts = 0;
    if (dbBacklogItemPartsWithNested.length > 1) {
        dbBacklogItemPartsWithNested.forEach((backlogItemPart) => {
            const sprintBacklogItems = (backlogItemPart as any).sprintbacklogitems;
            if (!sprintBacklogItems.length) {
                unallocatedParts++;
            }
        });
    }
    return unallocatedParts;
};

export const computeUnallocatedPointsUsingDbObjs = (
    dbBacklogItem: BacklogItemDataModel,
    dbBacklogItemPartsWithNested: BacklogItemPartDataModel[]
): number => {
    let foundFirstUnallocatedPart = false;
    let result = convertDbFloatToNumber(dbBacklogItem.estimate);
    const totalItems = dbBacklogItemPartsWithNested.length;
    if (totalItems > 1) {
        dbBacklogItemPartsWithNested.forEach((backlogItemPart) => {
            const sprintBacklogItems = (backlogItemPart as any).sprintbacklogitems;
            const isUnallocatedItem = !sprintBacklogItems.length;
            if (isUnallocatedItem && !foundFirstUnallocatedPart) {
                foundFirstUnallocatedPart = true;
                result = convertDbFloatToNumber((backlogItemPart as any).dataValues?.points);
            }
        });
    }
    return result;
};

export const buildBacklogItemFindOptionsIncludeForNested = (includeSprint: boolean = false): Includeable[] => {
    const sprintBacklogItemInclude: Includeable = {
        model: SprintBacklogItemPartDataModel,
        as: DB_INCLUDE_ALIAS_SPRINTBACKLOGITEMS
    } as IncludeOptions;
    const backlogItemPartsInclude: Includeable = {
        model: BacklogItemPartDataModel,
        as: DB_INCLUDE_ALIAS_BACKLOGITEMPARTS,
        include: [sprintBacklogItemInclude]
    };
    const result: Includeable[] = [backlogItemPartsInclude];
    if (includeSprint) {
        sprintBacklogItemInclude.include = [
            {
                model: SprintDataModel,
                as: DB_INCLUDE_ALIAS_SPRINT
            }
        ];
    }
    return result;
};

export const buildBacklogItemPartFindOptionsIncludeForNested = (): Includeable[] => {
    const result: Includeable[] = [
        {
            model: SprintBacklogItemPartDataModel,
            as: DB_INCLUDE_ALIAS_SPRINTBACKLOGITEMS,
            include: [
                {
                    model: SprintDataModel,
                    as: DB_INCLUDE_ALIAS_SPRINT
                }
            ]
        } as IncludeOptions
    ];
    return result;
};
