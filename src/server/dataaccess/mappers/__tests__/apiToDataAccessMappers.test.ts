// test related
import "jest";

// code under test
import * as apiToDataAccessMappers from "../apiToDataAccessMappers";

// interfaces/types
import type { BacklogItemDataModel } from "../../models/BacklogItemDataModel";
import type { BacklogItemPartDataModel } from "../../models/BacklogItemPartDataModel";

// test utils
import { mockBuildDataModelFromObj } from "../../../api/handlers/fetchers/__tests__/setupMockDbData";
import { ApiBacklogItem, ApiBacklogItemPart } from "@atoll/shared";

describe("API To Data Object Mappers", () => {
    describe("mapApiToDbBacklogItem", () => {
        it("should map a sample backlog item correctly", () => {
            // arrange
            const apiItem: ApiBacklogItem = {
                id: "fake-id",
                projectId: "fake-project-id",
                friendlyId: "fake-friendly-id",
                externalId: "fake-external-id",
                rolePhrase: "As a fake",
                storyPhrase: "I can mimic this data item",
                reasonPhrase: "so that I can test this function",
                estimate: 13,
                storyEstimate: undefined,
                type: "story",
                status: "R",
                acceptanceCriteria: "* successfully test this mapping function",
                startedAt: "2022-04-04T14:15:39.446Z",
                finishedAt: "2022-04-06T12:39:23.223Z",
                acceptedAt: "2022-04-06T14:45:15.767Z",
                releasedAt: "2022-04-06T15:05:33.334Z",
                partIndex: 1,
                totalParts: 2,
                createdAt: "2022-04-02T09:59:01.000Z",
                updatedAt: "2022-04-06T15:07:10.667Z",
                version: 3,
                unallocatedParts: undefined,
                unallocatedPoints: undefined
            };

            // act
            const actual = apiToDataAccessMappers.mapApiToDbBacklogItem(apiItem);

            // assert
            const shellDbItem = {
                acceptanceCriteria: "* successfully test this mapping function",
                acceptedAt: new Date("2022-04-06T14:45:15.767Z"),
                createdAt: new Date("2022-04-02T09:59:01.000Z"),
                estimate: 13,
                externalId: "fake-external-id",
                finishedAt: new Date("2022-04-06T12:39:23.223Z"),
                friendlyId: "fake-friendly-id",
                id: "fake-id",
                projectId: "fake-project-id",
                reasonPhrase: "so that I can test this function",
                releasedAt: new Date("2022-04-06T15:05:33.334Z"),
                rolePhrase: "As a fake",
                startedAt: new Date("2022-04-04T14:15:39.446Z"),
                status: "R",
                storyPhrase: "I can mimic this data item",
                totalParts: 2,
                type: "story",
                updatedAt: new Date("2022-04-06T15:07:10.667Z"),
                version: 3
            } as BacklogItemDataModel;
            const expected = mockBuildDataModelFromObj(shellDbItem);
            expect(actual).toStrictEqual(expected);
        });
    });
    describe("mapApiToDbBacklogItemPart", () => {
        it("should map a sample backlog item part correctly", () => {
            // arrange
            const apiItem: ApiBacklogItemPart = {
                id: "fake-id",
                backlogitemId: "fake-backlog-item-id",
                externalId: "fake-external-id",
                partIndex: 7,
                percentage: 45,
                points: 13,
                status: "R",
                startedAt: "2022-04-04T14:15:39.446Z",
                finishedAt: "2022-04-06T12:39:23.223Z",
                createdAt: "2022-04-02T09:59:01.000Z",
                updatedAt: "2022-04-06T15:07:10.667Z",
                version: 2
            };

            // act
            const actual = apiToDataAccessMappers.mapApiToDbBacklogItemPart(apiItem);

            // assert
            const shellDbItem = {
                id: "fake-id",
                backlogitemId: "fake-backlog-item-id",
                externalId: "fake-external-id",
                partIndex: 7,
                percentage: 45,
                points: 13,
                status: "R",
                startedAt: new Date("2022-04-04T14:15:39.446Z"),
                finishedAt: new Date("2022-04-06T12:39:23.223Z"),
                createdAt: new Date("2022-04-02T09:59:01.000Z"),
                updatedAt: new Date("2022-04-06T15:07:10.667Z"),
                version: 2
            } as BacklogItemPartDataModel;
            const expected = mockBuildDataModelFromObj(shellDbItem);
            expect(actual).toStrictEqual(expected);
        });
    });
});
