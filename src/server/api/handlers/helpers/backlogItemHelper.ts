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

/**
 * This applies the business rule that a unsplit story (probably most fall into this category) that is in the backlog has the
 * story point estimate in full as its "unallocatedPoints".  A split story, on the other hand, uses the "unallocatedPoints" field
 * to determine this - if any of the split parts are allocated because if all are unallocated this means that the story in full is
 * in the backlog and it should be treated just like a normal unsplit story.  Long term we may be able to remove this rule because
 * legacy logic will be updated to ensure that unallocatedPoints always has the correct value.
 * @param backlogItem
 * @param backlogItemPartsWithNested
 * @returns
 */
export const computeUnallocatedPoints = (
    backlogItem: BacklogItemDataModel,
    backlogItemPartsWithNested: BacklogItemPartDataModel[]
): number => {
    const totalItems = backlogItemPartsWithNested.length;
    if (totalItems > 1) {
        let allocatedItems = 0;
        backlogItemPartsWithNested.forEach((backlogItemPart) => {
            const sprintBacklogItems = (backlogItemPart as any).sprintbacklogitems;
            if (!sprintBacklogItems.length) {
                allocatedItems++;
            }
        });
        if (allocatedItems < totalItems) {
            const unallocatedPoints = (backlogItem as any).dataValues?.unallocatedPoints;
            return convertDbFloatToNumber(unallocatedPoints);
        }
    }
    return convertDbFloatToNumber(backlogItem.estimate);
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
