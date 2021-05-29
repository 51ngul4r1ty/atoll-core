// interfaces/types
import { BacklogItemPartDataModel } from "../../../dataaccess/models/BacklogItemPart";
import { SprintBacklogItemDataModel } from "../../../dataaccess/models/SprintBacklogItem";

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
