// externals
import { Model, DataTypes } from "sequelize";

// data access
import { sequelize } from "../connection";

export class ProjectDataModel extends Model {}

ProjectDataModel.init(
    {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(80),
            allowNull: false
        },
        description: DataTypes.STRING(240)
    },
    {
        modelName: "project",
        freezeTableName: true,
        paranoid: false,
        timestamps: true,
        version: true,
        sequelize
    }
);
