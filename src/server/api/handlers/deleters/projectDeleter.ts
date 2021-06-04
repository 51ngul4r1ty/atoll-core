// externals
import * as HttpStatus from "http-status-codes";
import { FindOptions, InstanceDestroyOptions, Transaction } from "sequelize";

// utils
import { buildOptionsWithTransaction } from "../../utils/sequelizeHelper";
import { mapDbToApiProject } from "../../../dataaccess/mappers/dataAccessToApiMappers";
import { getMessageFromError } from "../../utils/errorUtils";

// data access
import { ProjectDataModel } from "../../../dataaccess/models/Project";

export const deleteProject = async (projectId: string | null, transaction?: Transaction) => {
    try {
        const findItemOptions: FindOptions = buildOptionsWithTransaction({ where: { id: projectId } }, transaction);
        const item = await ProjectDataModel.findOne(findItemOptions);
        if (!item) {
            return {
                status: HttpStatus.NOT_FOUND,
                message: `Project ${projectId} was not found`
            };
        }
        const project = mapDbToApiProject(item);
        const destroyOptions: InstanceDestroyOptions = buildOptionsWithTransaction(undefined, transaction);
        await item.destroy(destroyOptions);
        return {
            status: HttpStatus.OK,
            data: {
                item: project
            }
        };
    } catch (error) {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: getMessageFromError(error)
        };
    }
};
