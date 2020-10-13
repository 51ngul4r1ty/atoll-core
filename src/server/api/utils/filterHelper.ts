import { Request } from "express";

export const buildOptions = (req: Request) => {
    const projectId = req.query.projectId;
    const options = projectId
        ? {
              where: {
                  projectId
              }
          }
        : {};
    return options;
};
