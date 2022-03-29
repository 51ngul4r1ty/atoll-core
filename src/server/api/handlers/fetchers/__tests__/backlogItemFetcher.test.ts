// test related
import "jest";

// externals
import { FindOptions } from "sequelize";

// code under test
import * as backlogItemFetcher from "../backlogItemFetcher";

// interfaces/types
import type { BacklogItemsResult } from "../backlogItemFetcher";
import type { BacklogItemRankDataModel } from "../../../../dataaccess/models/BacklogItemRankDataModel";

// test utils
import {
    mockBuildDataModelFromObj,
    mockDbBacklogItem1,
    mockDbBacklogItem1WithPartsWithSBIs,
    mockDbBacklogItem2WithPartsWithSBIs
} from "./setupMockDbData";

const mockDbBacklogItemRank1 = mockBuildDataModelFromObj({
    id: "fake-id-0",
    backlogitemId: null,
    nextbacklogitemId: "fake-backlog-item-id-1"
} as BacklogItemRankDataModel);
const mockDbBacklogItemRank2 = mockBuildDataModelFromObj({
    id: "fake-id-1",
    backlogitemId: "fake-backlog-item-id-1",
    nextbacklogitemId: "fake-backlog-item-id-2"
} as BacklogItemRankDataModel);
const mockDbBacklogItemRank3 = mockBuildDataModelFromObj({
    id: "fake-id-2",
    backlogitemId: "fake-backlog-item-id-2",
    nextbacklogitemId: null
} as BacklogItemRankDataModel);

jest.mock("../../../../dataaccess/models/BacklogItemDataModel", () => ({
    BacklogItemDataModel: {
        findByPk: (backlogItemId: string, backlogItemOptions: FindOptions) => mockDbBacklogItem1,
        findAll: (backlogItemOptions: FindOptions) => [mockDbBacklogItem1WithPartsWithSBIs, mockDbBacklogItem2WithPartsWithSBIs]
    }
}));

jest.mock("../../../../dataaccess/models/BacklogItemRankDataModel", () => ({
    BacklogItemRankDataModel: {
        belongsTo: () => null,
        findAll: (backlogItemOptions: FindOptions) => [mockDbBacklogItemRank1, mockDbBacklogItemRank2, mockDbBacklogItemRank3]
    }
}));

jest.mock("../../../../dataaccess/models/BacklogItemPartDataModel", () => ({
    BacklogItemPartDataModel: {
        belongsTo: () => null,
        hasMany: () => null
    }
}));

jest.mock("../../../../dataaccess/models/BacklogItemTagDataModel", () => ({
    BacklogItemTagDataModel: {
        belongsTo: () => null
    }
}));

jest.mock("../../../../dataaccess/models/SprintBacklogItemPartDataModel", () => ({
    SprintBacklogItemPartDataModel: {
        belongsTo: () => null
    }
}));

describe("Backlog Item Fetcher", () => {
    const buildExpectedItems = () => [
        {
            estimate: 13,
            externalId: "fake-backlogitem-external-id-1",
            friendlyId: "fake-backlogitem-friendly-id-1",
            id: "fake-backlog-item-id-1",
            links: [
                {
                    rel: "self",
                    type: "application/json",
                    uri: "/api/v1/backlog-items/fake-backlog-item-id-1"
                }
            ],
            status: "P",
            storyEstimate: 13,
            unallocatedParts: 2,
            unallocatedPoints: 5
        },
        {
            estimate: 0.5,
            externalId: "fake-backlogitem-external-id-2",
            friendlyId: "fake-backlogitem-friendly-id-2",
            id: "fake-backlog-item-id-2",
            links: [
                {
                    rel: "self",
                    type: "application/json",
                    uri: "/api/v1/backlog-items/fake-backlog-item-id-2"
                }
            ],
            status: "N",
            storyEstimate: 0.5,
            unallocatedParts: 2,
            unallocatedPoints: 5
        }
    ];
    describe("fetchBacklogItems", () => {
        it("should return standard backlog item collection payload", async () => {
            // arrange
            const projectId = "fake-project-id";

            // act
            const actual = (await backlogItemFetcher.fetchBacklogItems(projectId)) as BacklogItemsResult;

            // assert
            expect(actual).toStrictEqual({
                data: {
                    items: buildExpectedItems()
                },
                status: 200
            });
        });
    });
    describe("fetchBacklogItemsByDisplayId", () => {
        it("should return standard backlog item collection payload", async () => {
            // arrange
            const projectId = "fake-project-id";
            const backlogItemDisplayId = "fake-backlogitem-external-id-1";

            // act
            const actual = (await backlogItemFetcher.fetchBacklogItemsByDisplayId(
                projectId,
                backlogItemDisplayId
            )) as BacklogItemsResult;

            // assert
            expect(actual).toStrictEqual({
                data: {
                    items: buildExpectedItems()
                },
                status: 200
            });
        });
    });
});
