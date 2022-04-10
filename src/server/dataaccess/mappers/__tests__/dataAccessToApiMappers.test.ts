// test related
import "jest";

// libraries
import type { ApiBacklogItem, ApiBacklogItemPart } from "@atoll/shared";

// code under test
import * as dataAccessToApiMappers from "../dataAccessToApiMappers";

// interfaces/types
import type { ProjectSettingsDataModel } from "../../models/ProjectSettingsDataModel";
import type { BacklogItemDataModel } from "../../models/BacklogItemDataModel";
import type { BacklogItemPartDataModel } from "../..//models/BacklogItemPartDataModel";

// test utils
import { mockBuildDataModelFromObj } from "../../../api/handlers/fetchers/__tests__/setupMockDbData";

describe("Data Object To API Mappers", () => {
    describe("mapDbToApiProjectSettings", () => {
        it("should map a sample project item correctly", () => {
            // arrange
            const dbItem = mockBuildDataModelFromObj({
                id: "fake-id",
                projectId: "fake-project-id",
                settings: { counters: { story: { prefix: "s-" }, issue: { prefix: "i-" } } }
            } as ProjectSettingsDataModel);

            // act
            const actual = dataAccessToApiMappers.mapDbToApiProjectSettings(dbItem);

            // assert
            expect(actual).toStrictEqual({
                id: "fake-id",
                projectId: "fake-project-id",
                settings: { counters: { story: { prefix: "s-" }, issue: { prefix: "i-" } } }
            });
        });
        it("should map an undefined project item correctly", () => {
            // arrange
            const dbItem = undefined;

            // act
            const actual = dataAccessToApiMappers.mapDbToApiProjectSettings(dbItem);

            // assert
            expect(actual).toBe(undefined);
        });
    });
    describe("mapDbToApiBacklogItem", () => {
        it("should map a sample backlog item correctly", () => {
            // arrange
            const shellDbItem = {
                id: "fake-id",
                projectId: "fake-project-id",
                friendlyId: "fake-friendly-id",
                externalId: "fake-external-id",
                rolePhrase: "As a fake",
                storyPhrase: "I can mimic this data item",
                reasonPhrase: "so that I can test this function",
                estimate: 13,
                type: "story",
                status: "R",
                acceptanceCriteria: "* successfully test this mapping function",
                startedAt: new Date("2022-04-04T14:15:39.446Z"),
                finishedAt: new Date("2022-04-06T12:39:23.223Z"),
                acceptedAt: new Date("2022-04-06T14:45:15.767Z"),
                releasedAt: new Date("2022-04-06T15:05:33.334Z"),
                totalParts: 2,
                createdAt: new Date("2022-04-02T09:59:01.000Z"),
                updatedAt: new Date("2022-04-06T15:07:10.667Z"),
                version: 3
            } as BacklogItemDataModel;
            const dbItem = mockBuildDataModelFromObj(shellDbItem);

            // act
            const actual = dataAccessToApiMappers.mapDbToApiBacklogItem(dbItem);

            // assert
            const expected: Partial<ApiBacklogItem> = {
                id: "fake-id",
                projectId: "fake-project-id",
                friendlyId: "fake-friendly-id",
                externalId: "fake-external-id",
                rolePhrase: "As a fake",
                storyPhrase: "I can mimic this data item",
                reasonPhrase: "so that I can test this function",
                estimate: 13,
                storyEstimate: 13,
                type: "story",
                status: "R",
                acceptanceCriteria: "* successfully test this mapping function",
                startedAt: "2022-04-04T14:15:39.446Z",
                finishedAt: "2022-04-06T12:39:23.223Z",
                acceptedAt: "2022-04-06T14:45:15.767Z",
                releasedAt: "2022-04-06T15:05:33.334Z",
                totalParts: 2,
                createdAt: "2022-04-02T09:59:01.000Z",
                updatedAt: "2022-04-06T15:07:10.667Z",
                version: 3,
                unallocatedParts: undefined,
                unallocatedPoints: undefined
            };
            expect(actual).toStrictEqual(expected);
        });
    });
    describe("mapDbToApiBacklogItemPart", () => {
        it("should map a sample backlog item part correctly", () => {
            // arrange
            const shellDbItem = {
                id: "fake-id",
                externalId: "fake-external-id",
                backlogitemId: "fake-backlog-item-id",
                partIndex: 9,
                percentage: 99,
                points: 40,
                status: "P",
                startedAt: new Date("2022-04-04T14:15:39.446Z"),
                finishedAt: new Date("2022-04-06T12:39:23.223Z"),
                createdAt: new Date("2022-04-02T09:59:01.000Z"),
                updatedAt: new Date("2022-04-06T15:07:10.667Z"),
                version: 5
            } as BacklogItemPartDataModel;
            const dbItem = mockBuildDataModelFromObj(shellDbItem);

            // act
            const actual = dataAccessToApiMappers.mapDbToApiBacklogItemPart(dbItem);

            // assert
            const expected: ApiBacklogItemPart = {
                id: "fake-id",
                externalId: "fake-external-id",
                backlogitemId: "fake-backlog-item-id",
                partIndex: 9,
                percentage: 99,
                points: 40,
                status: "P",
                startedAt: "2022-04-04T14:15:39.446Z",
                finishedAt: "2022-04-06T12:39:23.223Z",
                createdAt: "2022-04-02T09:59:01.000Z",
                updatedAt: "2022-04-06T15:07:10.667Z",
                version: 5
            };
            expect(actual).toStrictEqual(expected);
        });
    });
});
