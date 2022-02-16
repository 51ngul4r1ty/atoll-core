/**
 * Purpose: To offload individual steps in the backlogItem handler.
 * Reason to change: Data model / logic changes related to the backlogitem API endpoints.
 */

// interfaces/types
import { BacklogItemDataModel } from "../../../dataaccess";
import { BacklogItemPartDataModel } from "../../../dataaccess/models/BacklogItemPart";
import { SprintBacklogItemDataModel } from "../../../dataaccess/models/SprintBacklogItem";

// utils
import { convertDbFloatToNumber } from "../../../dataaccess/conversionUtils";

export const computeUnallocatedParts = (backlogItemPartsWithNested: BacklogItemPartDataModel[]): number => {
    let unallocatedParts = 0;
    if (backlogItemPartsWithNested.length > 1) {
        backlogItemPartsWithNested.forEach((backlogItemPart) => {
            const sprintBacklogItems = (backlogItemPart as any).sprintbacklogitems;
            if (!sprintBacklogItems.length) {
                unallocatedParts++;
            }
        });
    }
    return unallocatedParts;
};

export const computeUnallocatedPoints = (
    backlogItem: BacklogItemDataModel,
    backlogItemPartsWithNested: BacklogItemPartDataModel[]
): number => {
    let foundFirstUnallocatedPart = false;
    let result = convertDbFloatToNumber(backlogItem.estimate);
    const totalItems = backlogItemPartsWithNested.length;
    if (totalItems > 1) {
        backlogItemPartsWithNested.forEach((backlogItemPart) => {
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
