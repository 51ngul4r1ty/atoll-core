import { Request } from "express";

export const getParamsFromRequest = (req: Request) => {
    const projectId = req.query.projectId as string | null;
    return {
        projectId
    };
};

export const buildOptionsFromParams = (projectId: string | null) => {
    const options = projectId
        ? {
              where: {
                  projectId
              }
          }
        : {};
    return options;
};

export const buildOptions = (req: Request) => {
    const params = getParamsFromRequest(req);
    return buildOptionsFromParams(params.projectId);
};
