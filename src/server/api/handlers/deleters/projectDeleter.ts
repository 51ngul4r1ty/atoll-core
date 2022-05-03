// externals
import { StatusCodes } from "http-status-codes";
import { FindOptions, InstanceDestroyOptions, Transaction } from "sequelize";

// data access
import { ProjectDataModel } from "../../../dataaccess/models/ProjectDataModel";

// utils
import { buildOptionsWithTransaction } from "../../utils/sequelizeHelper";
import { buildResponseFromCatchError, buildResponseWithItem } from "../../utils/responseBuilder";
import { mapDbToApiProject } from "../../../dataaccess/mappers/dataAccessToApiMappers";

export const deleteProject = async (projectId: string | null, transaction?: Transaction) => {
    try {
        const findItemOptions: FindOptions = buildOptionsWithTransaction({ where: { id: projectId } }, transaction);
        const item = await ProjectDataModel.findOne(findItemOptions);
        if (!item) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: `Project ${projectId} was not found`
            };
        }
        const project = mapDbToApiProject(item);
        const destroyOptions: InstanceDestroyOptions = buildOptionsWithTransaction(undefined, transaction);
        await item.destroy(destroyOptions);
        return buildResponseWithItem(project);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};
