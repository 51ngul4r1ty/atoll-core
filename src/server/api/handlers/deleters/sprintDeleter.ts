// externals
import * as HttpStatus from "http-status-codes";
import { FindOptions, InstanceDestroyOptions, Transaction } from "sequelize";

// utils
import { buildOptionsWithTransaction } from "../../utils/sequelizeHelper";
import { mapDbToApiSprint } from "../../../dataaccess/mappers/dataAccessToApiMappers";

// data access
import { SprintModel } from "../../../dataaccess/models/Sprint";

export const deleteSprint = async (sprintId: string | null, transaction?: Transaction) => {
    try {
        const findItemOptions: FindOptions = buildOptionsWithTransaction({ where: { id: sprintId } }, transaction);
        const item = await SprintModel.findOne(findItemOptions);
        if (!item) {
            return {
                status: HttpStatus.NOT_FOUND,
                message: `Sprint ${sprintId} was not found`
            };
        }
        const sprint = mapDbToApiSprint(item);
        const destroyOptions: InstanceDestroyOptions = buildOptionsWithTransaction(undefined, transaction);
        await item.destroy(destroyOptions);
        return {
            status: HttpStatus.OK,
            data: {
                item: sprint
            }
        };
    } catch (error) {
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error
        };
    }
};
