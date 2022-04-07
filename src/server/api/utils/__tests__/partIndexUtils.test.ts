// test related
import "jest";

// libraries
import { ApiBacklogItem } from "@atoll/shared";

// code under test
import * as partIndexUtils from "../partIndexUtils";

describe("Part Index Utils", () => {
    describe("getUpdatedDataItemWhenStatusChanges", () => {
        it("should handle null values correctly", () => {
            // arrange
            const oldPartIndex = 5;
            const removedPartIndexes = [2, 3, 9];

            // act
            const actual = partIndexUtils.calcNewPartIndex(oldPartIndex, removedPartIndexes);

            // assert
            expect(actual).toBe(3);
        });
    });
});
