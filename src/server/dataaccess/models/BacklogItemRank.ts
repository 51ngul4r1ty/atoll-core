// externals
import { Model, DataTypes } from "sequelize";

// data access
import { sequelize } from "../connection";
import { BacklogItemModel } from "./BacklogItem";

export class BacklogItemRankModel extends Model {}

BacklogItemRankModel.init(
    {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true
        }
    },
    {
        modelName: "backlogitemrank",
        freezeTableName: true,
        paranoid: false,
        timestamps: true,
        version: true,
        sequelize
    }
);

BacklogItemRankModel.belongsTo(BacklogItemModel);
BacklogItemRankModel.belongsTo(BacklogItemModel, {
    as: "nextbacklogitem"
});
