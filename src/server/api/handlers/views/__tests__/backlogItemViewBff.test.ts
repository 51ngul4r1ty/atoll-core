// test related
import "jest";

// libraries
import { ApiBacklogItem, ApiProject } from "@atoll/shared";

// externals
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// code under test
import * as backlogItemViewBff from "../backlogItemViewBff";

// interfaces/types
import type { ProjectItemsResult } from "../../fetchers/projectFetcher";
import type { BacklogItemsResult } from "../../fetchers/backlogItemFetcher";
import type { BacklogItemWithSprintAllocationInfoResult } from "../../aggregators/backlogItemAggregator";

// mock related
import * as filterHelper from "../../../utils/filterHelper";
import * as projectFetcher from "../../fetchers/projectFetcher";
import * as backlogItemFetcher from "../../fetchers/backlogItemFetcher";
import * as backlogItemAggregator from "../../aggregators/backlogItemAggregator";

describe("Backlog Item View BFF Handler", () => {
    describe("backlogItemViewBffGetHandler", () => {
        it("should handle missing items by sending a 404 response", async () => {
            // arrange
            const req = {} as Request;
            const sendSpy: any = jest.fn();
            const res = {
                status: (code: number) => res,
                send: sendSpy
            } as Response;
            jest.spyOn(filterHelper, "getParamsFromRequest").mockReturnValueOnce({
                backlogItemDisplayId: "fake-backlog-item-display-id",
                projectDisplayId: "fake-project-display-id"
            });
            const projectsResult: ProjectItemsResult = {
                status: StatusCodes.OK,
                data: {
                    items: []
                }
            };
            jest.spyOn(projectFetcher, "projectByDisplayIdFetcher").mockResolvedValueOnce(projectsResult);

            // act
            await backlogItemViewBff.backlogItemViewBffGetHandler(req, res);

            // assert
            expect(sendSpy).toHaveBeenCalledWith({
                message: 'No matching project with display ID "fake-project-display-id" found.',
                status: 404
            });
        });
        it("should handle succesful items response sending a 200 response", async () => {
            // arrange
            const req = {} as Request;
            const sendSpy: any = jest.fn();
            const res = {
                status: (code: number) => res,
                send: sendSpy
            } as Response;
            jest.spyOn(filterHelper, "getParamsFromRequest").mockReturnValueOnce({
                backlogItemDisplayId: "fake-backlog-item-display-id",
                projectDisplayId: "fake-project-display-id"
            });
            const projectsResult: ProjectItemsResult = {
                status: StatusCodes.OK,
                data: {
                    items: [
                        {
                            id: "fake-project-id"
                        } as ApiProject
                    ]
                }
            };
            jest.spyOn(projectFetcher, "projectByDisplayIdFetcher").mockResolvedValueOnce(projectsResult);
            const backlogItemsResult: BacklogItemsResult = {
                status: StatusCodes.OK,
                data: {
                    items: [
                        {
                            id: "fake-backlog-item-id"
                        } as ApiBacklogItem
                    ]
                }
            };
            const fetchBacklogItemsByDisplayIdSpy = jest.spyOn(backlogItemFetcher, "fetchBacklogItemsByDisplayId");
            fetchBacklogItemsByDisplayIdSpy.mockResolvedValueOnce(backlogItemsResult);
            const fetchBacklogItemWithSprintAllocationInfoSpy = jest.spyOn(
                backlogItemAggregator,
                "fetchBacklogItemWithSprintAllocationInfo"
            );
            const backlogItemWithSprintAllocInfoResult: BacklogItemWithSprintAllocationInfoResult = {
                status: StatusCodes.OK,
                data: {
                    item: {
                        id: "fake-backlog-item-id"
                    } as ApiBacklogItem
                }
            };
            fetchBacklogItemWithSprintAllocationInfoSpy.mockResolvedValueOnce(backlogItemWithSprintAllocInfoResult);

            // act
            await backlogItemViewBff.backlogItemViewBffGetHandler(req, res);

            // assert
            expect(fetchBacklogItemsByDisplayIdSpy).toHaveBeenCalledWith("fake-project-id", "fake-backlog-item-display-id");
            expect(sendSpy).toHaveBeenCalledWith({
                data: {
                    backlogItem: {
                        id: "fake-backlog-item-id"
                    },
                    backlogItemPartsAndSprints: [],
                    inProductBacklog: false
                },
                status: 200
            });
        });
    });
});
