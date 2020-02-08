// externals
import { Model, DataTypes } from "sequelize";

// data access
import { sequelize } from "../connection";

export class SprintModel extends Model {}

SprintModel.init(
    {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true
        },
        name: DataTypes.STRING(50),
        displayindex: DataTypes.INTEGER,
        startdate: DataTypes.DATE,
        finishdate: DataTypes.DATE
    },
    {
        modelName: "sprint",
        freezeTableName: true,
        paranoid: false,
        timestamps: true,
        version: true,
        sequelize
    }
);
