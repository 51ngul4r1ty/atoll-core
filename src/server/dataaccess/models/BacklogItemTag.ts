// externals
import { Model, DataTypes } from "sequelize";

// data access
import { sequelize } from "../connection";

// other models
import { BacklogItemModel } from "./BacklogItem";

export class BacklogItemTag extends Model {}

BacklogItemTag.init(
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

BacklogItemTag.belongsTo(BacklogItemModel);
