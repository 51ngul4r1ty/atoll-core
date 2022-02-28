// externals
import { Model, DataTypes } from "sequelize";

// data access
import { sequelize } from "../connection";

// other models
import { BacklogItemDataModel } from "./BacklogItemDataModel";

export class BacklogItemTagDataModel extends Model {}

BacklogItemTagDataModel.init(
    {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true
        },
        label: DataTypes.STRING(50)
    },
    {
        modelName: "backlogitemtag",
        freezeTableName: true,
        paranoid: false,
        timestamps: false,
        version: false,
        sequelize
    }
);

BacklogItemTagDataModel.belongsTo(BacklogItemDataModel);
