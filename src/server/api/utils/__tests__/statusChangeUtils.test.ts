// test related
import "jest";

// libraries
import { ApiBacklogItem } from "@atoll/shared";

// code under test
import { getUpdatedBacklogItemWhenStatusChanges } from "../statusChangeUtils";

// mocks
// import * as atollShared from "@atoll/shared";

const MOCK_NOW = new Date(2020, 11, 27, 16, 36, 38);

const PREV_SET_DATE = new Date(2020, 10, 25, 14, 9, 44);

const buildApiBacklogItem = (): ApiBacklogItem => {
    const result: ApiBacklogItem = {
        id: "897552068bef4b5e9b69f98d2fca2591",
        rolePhrase: "As a tester",
        storyPhrase: "I can chill on the couch",
        reasonPhrase: "because automation does my job for me",
        acceptanceCriteria: "* Not real acceptance criteria",
        acceptedAt: null, // "2020-12-27T19:00:00Z"
        estimate: 5,
        externalId: "ext-123",
        finishedAt: null,
        friendlyId: "s-123",
        projectId: "project-a",
        releasedAt: null,
        startedAt: null,
        status: "N", // not started
        type: "story",
        partIndex: 1,
        storyEstimate: 5,
        totalParts: 1,
        unallocatedParts: 0,
        unallocatedPoints: undefined
    };
    return result;
};

describe("Status Change Utils", () => {
    let oldDate: any;
    let mockDate = MOCK_NOW;
    beforeAll(() => {
        oldDate = Date as any;
        (global as any).Date = class extends Date {
            constructor(date) {
                if (date) {
                    return super(date) as any;
                }
                return mockDate;
            }
        };
    });
    afterAll(() => {
        (global as any).Date = oldDate;
    });
    describe("getUpdatedDataItemWhenStatusChanges", () => {
        it("should handle null values correctly", () => {
            const actual = getUpdatedBacklogItemWhenStatusChanges(null, {} as ApiBacklogItem);
            expect(actual.backlogItem).toStrictEqual({});
        });
        it("should handle empty objects correctly", () => {
            const actual = getUpdatedBacklogItemWhenStatusChanges({} as ApiBacklogItem, {} as ApiBacklogItem);
            expect(actual.backlogItem).toStrictEqual({});
        });
        it("should handle same object correctly", () => {
            const item = buildApiBacklogItem();
            const actual = getUpdatedBacklogItemWhenStatusChanges(item, item);
            expect(actual.backlogItem).toStrictEqual(item);
        });
        it("should update all the time fields when setting status to released", () => {
            const oldItem = buildApiBacklogItem();
            const newItem = buildApiBacklogItem();
            newItem.status = "R";
            const actual = getUpdatedBacklogItemWhenStatusChanges(oldItem, newItem);
            expect(actual.backlogItem.startedAt).toEqualX({ name: "startedAt", value: MOCK_NOW.toISOString() });
            expect(actual.backlogItem.finishedAt).toEqualX({ name: "finishedAt", value: MOCK_NOW.toISOString() });
            expect(actual.backlogItem.acceptedAt).toEqualX({ name: "acceptedAt", value: MOCK_NOW.toISOString() });
            expect(actual.backlogItem.releasedAt).toEqualX({ name: "releasedAt", value: MOCK_NOW.toISOString() });
        });
        it("should update startedAt, finishedAt, acceptedAt when setting status to accepted", () => {
            const oldItem = buildApiBacklogItem();
            const newItem = buildApiBacklogItem();
            newItem.status = "A";
            const actual = getUpdatedBacklogItemWhenStatusChanges(oldItem, newItem);
            expect(actual.backlogItem.startedAt).toEqualX({ name: "startedAt", value: MOCK_NOW.toISOString() });
            expect(actual.backlogItem.finishedAt).toEqualX({ name: "finishedAt", value: MOCK_NOW.toISOString() });
            expect(actual.backlogItem.acceptedAt).toEqualX({ name: "acceptedAt", value: MOCK_NOW.toISOString() });
            expect(actual.backlogItem.releasedAt).toEqualX({ name: "releasedAt", value: null });
        });
        it("should update startedAt, finishedAt, acceptedAt when setting status to accepted", () => {
            const oldItem = buildApiBacklogItem();
            const newItem = buildApiBacklogItem();
            newItem.status = "D";
            const actual = getUpdatedBacklogItemWhenStatusChanges(oldItem, newItem);
            expect(actual.backlogItem.startedAt).toEqualX({ name: "startedAt", value: MOCK_NOW.toISOString() });
            expect(actual.backlogItem.finishedAt).toEqualX({ name: "finishedAt", value: MOCK_NOW.toISOString() });
            expect(actual.backlogItem.acceptedAt).toEqualX({ name: "acceptedAt", value: null });
            expect(actual.backlogItem.releasedAt).toEqualX({ name: "releasedAt", value: null });
        });
        it("should update startedAt, finishedAt, acceptedAt when setting status to accepted", () => {
            const oldItem = buildApiBacklogItem();
            const newItem = buildApiBacklogItem();
            newItem.status = "P";
            const actual = getUpdatedBacklogItemWhenStatusChanges(oldItem, newItem);
            expect(actual.backlogItem.startedAt).toEqualX({ name: "startedAt", value: MOCK_NOW.toISOString() });
            expect(actual.backlogItem.finishedAt).toEqualX({ name: "finishedAt", value: null });
            expect(actual.backlogItem.acceptedAt).toEqualX({ name: "acceptedAt", value: null });
            expect(actual.backlogItem.releasedAt).toEqualX({ name: "releasedAt", value: null });
        });
        it("should not update startedAt if it has already been set", () => {
            const oldItem = buildApiBacklogItem();
            oldItem.startedAt = PREV_SET_DATE.toISOString();
            const newItem = buildApiBacklogItem();
            newItem.startedAt = oldItem.startedAt;
            newItem.status = "P";
            const actual = getUpdatedBacklogItemWhenStatusChanges(oldItem, newItem);
            expect(actual.backlogItem.startedAt).toEqualX({ name: "startedAt", value: PREV_SET_DATE.toISOString() });
            expect(actual.backlogItem.finishedAt).toEqualX({ name: "finishedAt", value: null });
            expect(actual.backlogItem.acceptedAt).toEqualX({ name: "acceptedAt", value: null });
            expect(actual.backlogItem.releasedAt).toEqualX({ name: "releasedAt", value: null });
        });
        it("should not update finishedAt if it has already been set", () => {
            const oldItem = buildApiBacklogItem();
            oldItem.finishedAt = PREV_SET_DATE.toISOString();
            const newItem = buildApiBacklogItem();
            newItem.finishedAt = oldItem.finishedAt;
            newItem.status = "D";
            const actual = getUpdatedBacklogItemWhenStatusChanges(oldItem, newItem);
            expect(actual.backlogItem.startedAt).toEqualX({ name: "startedAt", value: MOCK_NOW.toISOString() });
            expect(actual.backlogItem.finishedAt).toEqualX({ name: "finishedAt", value: PREV_SET_DATE.toISOString() });
            expect(actual.backlogItem.acceptedAt).toEqualX({ name: "acceptedAt", value: null });
            expect(actual.backlogItem.releasedAt).toEqualX({ name: "releasedAt", value: null });
        });
        it("should not update acceptedAt if it has already been set", () => {
            const oldItem = buildApiBacklogItem();
            oldItem.acceptedAt = PREV_SET_DATE.toISOString();
            const newItem = buildApiBacklogItem();
            newItem.acceptedAt = oldItem.acceptedAt;
            newItem.status = "A";
            const actual = getUpdatedBacklogItemWhenStatusChanges(oldItem, newItem);
            expect(actual.backlogItem.startedAt).toEqualX({ name: "startedAt", value: MOCK_NOW.toISOString() });
            expect(actual.backlogItem.finishedAt).toEqualX({ name: "finishedAt", value: MOCK_NOW.toISOString() });
            expect(actual.backlogItem.acceptedAt).toEqualX({ name: "acceptedAt", value: PREV_SET_DATE.toISOString() });
            expect(actual.backlogItem.releasedAt).toEqualX({ name: "releasedAt", value: null });
        });
        it("should not update releasedAt if it has already been set", () => {
            const oldItem = buildApiBacklogItem();
            oldItem.releasedAt = PREV_SET_DATE.toISOString();
            const newItem = buildApiBacklogItem();
            newItem.releasedAt = oldItem.releasedAt;
            newItem.status = "R";
            const actual = getUpdatedBacklogItemWhenStatusChanges(oldItem, newItem);
            expect(actual.backlogItem.startedAt).toEqualX({ name: "startedAt", value: MOCK_NOW.toISOString() });
            expect(actual.backlogItem.finishedAt).toEqualX({ name: "finishedAt", value: MOCK_NOW.toISOString() });
            expect(actual.backlogItem.acceptedAt).toEqualX({ name: "acceptedAt", value: MOCK_NOW.toISOString() });
            expect(actual.backlogItem.releasedAt).toEqualX({ name: "releasedAt", value: PREV_SET_DATE.toISOString() });
        });
    });
});
