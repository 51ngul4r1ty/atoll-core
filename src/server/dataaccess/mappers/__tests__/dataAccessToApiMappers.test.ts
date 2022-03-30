// test related
import "jest";

// code under test
import * as dataAccessToApiMappers from "../dataAccessToApiMappers";

// interfaces/types
import type { ProjectSettingsDataModel } from "../../models/ProjectSettingsDataModel";

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
});
