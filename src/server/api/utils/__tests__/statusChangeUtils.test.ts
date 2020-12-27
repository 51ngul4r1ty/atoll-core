// test related
import "jest";

// libraries
import { ApiBacklogItem } from "@atoll/shared";

// code under test
import { getUpdatedDataItemWhenStatusChanges } from "../statusChangeUtils";

// mocks
// import * as atollShared from "@atoll/shared";

const MOCK_NOW = new Date(2020, 11, 27, 16, 36, 38);
// jest.spyOn(atollShared, "now").mockImplementation(() => MOCK_NOW);

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
        type: "story"
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
        it("should handle empty objects correctly", () => {
            const actual = getUpdatedDataItemWhenStatusChanges({} as ApiBacklogItem, {} as ApiBacklogItem);
            expect(actual).toStrictEqual({});
        });
        it("should handle same object correctly", () => {
            const item = buildApiBacklogItem();
            const actual = getUpdatedDataItemWhenStatusChanges(item, item);
            expect(actual).toStrictEqual(item);
        });
        it("should update all the time fields when setting status to released", () => {
            const oldItem = buildApiBacklogItem();
            const newItem = buildApiBacklogItem();
            newItem.status = "R";
            const actual = getUpdatedDataItemWhenStatusChanges(oldItem, newItem);
            expect(actual.startedAt).toEqualX({ name: "startedAt", value: MOCK_NOW.toISOString() });
            expect(actual.finishedAt).toEqualX({ name: "finishedAt", value: MOCK_NOW.toISOString() });
            expect(actual.acceptedAt).toEqualX({ name: "acceptedAt", value: MOCK_NOW.toISOString() });
            expect(actual.releasedAt).toEqualX({ name: "releasedAt", value: MOCK_NOW.toISOString() });
            // expect(actual).toStrictEqual({
            //     ...buildApiBacklogItem(),
            //     startedAt: MOCK_NOW,
            //     finishedAt: MOCK_NOW,
            //     acceptedAt: MOCK_NOW,
            //     releasedAt: MOCK_NOW
            // });
        });
    });
});
