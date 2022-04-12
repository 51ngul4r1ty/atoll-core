// test related
import "jest";

// externals
import { FindOptions } from "sequelize";

// code under test
import * as backlogItemFetcher from "../backlogItemFetcher";

// interfaces/types
import type { BacklogItemsResult } from "../backlogItemFetcher";
import type { ProductBacklogItemDataModel } from "../../../../dataaccess/models/ProductBacklogItemDataModel";

// test utils
import {
    mockBuildDataModelFromObj,
    mockDbBacklogItem1,
    mockDbBacklogItem1WithPartsWithSBIs,
    mockDbBacklogItem2WithPartsWithSBIs
} from "./setupMockDbData";

const mockDbProductBacklogItem1 = mockBuildDataModelFromObj({
    id: "fake-id-0",
    backlogitemId: null,
    nextbacklogitemId: "fake-backlog-item-id-1"
} as ProductBacklogItemDataModel);
const mockDbProductBacklogItem2 = mockBuildDataModelFromObj({
    id: "fake-id-1",
    backlogitemId: "fake-backlog-item-id-1",
    nextbacklogitemId: "fake-backlog-item-id-2"
} as ProductBacklogItemDataModel);
const mockDbProductBacklogItem3 = mockBuildDataModelFromObj({
    id: "fake-id-2",
    backlogitemId: "fake-backlog-item-id-2",
    nextbacklogitemId: null
} as ProductBacklogItemDataModel);

jest.mock("../../../../dataaccess/models/BacklogItemDataModel", () => ({
    BacklogItemDataModel: {
        findByPk: (backlogItemId: string, backlogItemOptions: FindOptions) => mockDbBacklogItem1,
        findAll: (backlogItemOptions: FindOptions) => [mockDbBacklogItem1WithPartsWithSBIs, mockDbBacklogItem2WithPartsWithSBIs]
    }
}));

jest.mock("../../../../dataaccess/models/ProductBacklogItemDataModel", () => ({
    ProductBacklogItemDataModel: {
        belongsTo: () => null,
        findAll: (backlogItemOptions: FindOptions) => [
            mockDbProductBacklogItem1,
            mockDbProductBacklogItem2,
            mockDbProductBacklogItem3
        ]
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
            acceptedAt: undefined,
            createdAt: undefined,
            estimate: 13,
            externalId: "fake-backlogitem-external-id-1",
            finishedAt: undefined,
            friendlyId: "fake-backlogitem-friendly-id-1",
            id: "fake-backlog-item-id-1",
            links: [
                {
                    rel: "self",
                    type: "application/json",
                    uri: "/api/v1/backlog-items/fake-backlog-item-id-1"
                }
            ],
            releasedAt: undefined,
            startedAt: undefined,
            status: "P",
            storyEstimate: 13,
            unallocatedParts: 2,
            unallocatedPoints: 5,
            updatedAt: undefined
        },
        {
            acceptedAt: undefined,
            createdAt: undefined,
            estimate: 0.5,
            externalId: "fake-backlogitem-external-id-2",
            finishedAt: undefined,
            friendlyId: "fake-backlogitem-friendly-id-2",
            id: "fake-backlog-item-id-2",
            links: [
                {
                    rel: "self",
                    type: "application/json",
                    uri: "/api/v1/backlog-items/fake-backlog-item-id-2"
                }
            ],
            releasedAt: undefined,
            startedAt: undefined,
            status: "N",
            storyEstimate: 0.5,
            unallocatedParts: 2,
            unallocatedPoints: 5,
            updatedAt: undefined
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
