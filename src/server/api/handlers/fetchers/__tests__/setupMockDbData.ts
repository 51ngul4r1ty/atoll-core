// data access
import { DB_INCLUDE_ALIAS_BACKLOGITEMPARTS } from "../../../../dataaccess/models/dataModelConsts";
import type { BacklogItemPartDataModel } from "../../../../dataaccess/models/BacklogItemPartDataModel";
import type { BacklogItemDataModel } from "../../../../dataaccess/models/BacklogItemDataModel";
import type { SprintBacklogItemPartDataModel } from "../../../../dataaccess/models/SprintBacklogItemPartDataModel";

export type RelationData = {
    relation: string;
    data: any;
};

export const mockBuildDataModelFromObj = <T>(obj: T): T => ({
    ...obj,
    dataValues: {
        ...obj
    }
});

export const dataModelWithRelated = <T>(obj: T, relationData: RelationData): T => {
    const result: T = {
        ...obj
    };
    (result as any)[relationData.relation] = relationData.data;
    return result;
};

// #region SprintBacklogItemPartDataModel
const mockDbSprintBacklogItem1 = mockBuildDataModelFromObj({} as SprintBacklogItemPartDataModel);
const mockDbSprintBacklogItem2 = mockBuildDataModelFromObj({} as SprintBacklogItemPartDataModel);
// #endregion

export const MOCK_BACKLOG_ITEM_1_ID = "fake-backlog-item-id-1";
export const MOCK_BACKLOG_ITEM_2_ID = "fake-backlog-item-id-2";

// #region BacklogItemDataModel
export const mockDbBacklogItem1 = mockBuildDataModelFromObj({
    id: MOCK_BACKLOG_ITEM_1_ID,
    externalId: "fake-backlogitem-external-id-1",
    friendlyId: "fake-backlogitem-friendly-id-1",
    estimate: 13,
    status: "P"
} as BacklogItemDataModel);

export const mockDbBacklogItem2 = mockBuildDataModelFromObj({
    id: MOCK_BACKLOG_ITEM_2_ID,
    externalId: "fake-backlogitem-external-id-2",
    friendlyId: "fake-backlogitem-friendly-id-2",
    estimate: 0.5,
    status: "N"
} as BacklogItemDataModel);
// #endregion

// #region BacklogItemPartDataModel
const mockDbBacklogItem1Part1 = mockBuildDataModelFromObj({
    id: "fake-item-1-part-a",
    backlogitemId: MOCK_BACKLOG_ITEM_1_ID,
    points: 5
} as BacklogItemPartDataModel);
const mockDbBacklogItem1Part2 = mockBuildDataModelFromObj({
    id: "fake-item-1-part-b",
    backlogitemId: MOCK_BACKLOG_ITEM_1_ID,
    points: 3
} as BacklogItemPartDataModel);

const mockDbBacklogItem2Part1 = mockBuildDataModelFromObj({
    id: "fake-item-2-part-a",
    backlogitemId: MOCK_BACKLOG_ITEM_2_ID,
    points: 5
} as BacklogItemPartDataModel);
const mockDbBacklogItem2Part2 = mockBuildDataModelFromObj({
    id: "fake-item-2-part-2",
    backlogitemId: MOCK_BACKLOG_ITEM_2_ID,
    points: 3
} as BacklogItemPartDataModel);
// #endregion

// #region BacklogItemPartDataModel with related data
const mockDbBacklogItem1Part1WithSBIs = dataModelWithRelated(mockDbBacklogItem1Part1, {
    relation: "sprintbacklogitems",
    data: mockDbSprintBacklogItem1
});
const mockDbBacklogItem1Part2WithSBIs = dataModelWithRelated(mockDbBacklogItem1Part2, {
    relation: "sprintbacklogitems",
    data: mockDbSprintBacklogItem2
});

const mockDbBacklogItem2Part1WithSBIs = dataModelWithRelated(mockDbBacklogItem2Part1, {
    relation: "sprintbacklogitems",
    data: mockDbSprintBacklogItem1
});
const mockDbBacklogItem2Part2WithSBIs = dataModelWithRelated(mockDbBacklogItem2Part2, {
    relation: "sprintbacklogitems",
    data: mockDbSprintBacklogItem2
});
// #endregion

// #region BacklogItemDataModel with related data
export const mockDbBacklogItem1WithPartsWithSBIs = dataModelWithRelated(mockDbBacklogItem1, {
    relation: DB_INCLUDE_ALIAS_BACKLOGITEMPARTS,
    data: [mockDbBacklogItem1Part1WithSBIs, mockDbBacklogItem1Part2WithSBIs]
});

export const mockDbBacklogItem2WithPartsWithSBIs = dataModelWithRelated(mockDbBacklogItem2, {
    relation: DB_INCLUDE_ALIAS_BACKLOGITEMPARTS,
    data: [mockDbBacklogItem2Part1WithSBIs, mockDbBacklogItem2Part2WithSBIs]
});
// #endregion
