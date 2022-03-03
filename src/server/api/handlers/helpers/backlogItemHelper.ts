/**
 * Purpose: To offload individual steps in the backlogItem handler.
 * Reason to change: Data model / logic changes related to the backlogitem API endpoints.
 */

// interfaces/types
import { BacklogItemDataModel } from "../../../dataaccess";
import { BacklogItemPartDataModel } from "../../../dataaccess/models/BacklogItemPartDataModel";
import { SprintBacklogItemDataModel } from "../../../dataaccess/models/SprintBacklogItem";

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

export const buildFindOptionsIncludeForNested = () => [
    {
        model: BacklogItemPartDataModel,
        as: "backlogitemparts",
        include: [
            {
                model: SprintBacklogItemDataModel,
                as: "sprintbacklogitems"
            }
        ]
    }
];
