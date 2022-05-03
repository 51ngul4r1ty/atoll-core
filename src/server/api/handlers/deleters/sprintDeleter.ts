// externals
import { StatusCodes } from "http-status-codes";
import { FindOptions, InstanceDestroyOptions, Transaction } from "sequelize";

// data access
import { SprintDataModel } from "../../../dataaccess/models/SprintDataModel";

// utils
import { buildOptionsWithTransaction } from "../../utils/sequelizeHelper";
import { buildResponseFromCatchError, buildResponseWithItem } from "../../utils/responseBuilder";
import { mapDbToApiSprint } from "../../../dataaccess/mappers/dataAccessToApiMappers";

export const deleteSprint = async (sprintId: string | null, transaction?: Transaction) => {
    try {
        const findItemOptions: FindOptions = buildOptionsWithTransaction({ where: { id: sprintId } }, transaction);
        const item = await SprintDataModel.findOne(findItemOptions);
        if (!item) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: `Sprint ${sprintId} was not found`
            };
        }
        const sprint = mapDbToApiSprint(item);
        const destroyOptions: InstanceDestroyOptions = buildOptionsWithTransaction(undefined, transaction);
        await item.destroy(destroyOptions);
        return buildResponseWithItem(sprint);
    } catch (error) {
        return buildResponseFromCatchError(error);
    }
};
