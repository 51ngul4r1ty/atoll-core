// externals
import { Model, DataTypes, Deferrable } from "sequelize";

// data access
import { sequelize } from "../connection";

export class SprintModel extends Model {}

SprintModel.init(
    {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true
        },
        projectId: {
            type: DataTypes.STRING(32),
            primaryKey: false,
            references: {
                model: "project",
                key: "id",
                deferrable: Deferrable.INITIALLY_DEFERRED as any
            },
            get: function() {
                return this.getDataValue("projectId");
            }
        },
        name: DataTypes.STRING(50),
        displayindex: DataTypes.INTEGER,
        startdate: DataTypes.DATE,
        finishdate: DataTypes.DATE,
        plannedPoints: DataTypes.INTEGER,
        acceptedPoints: DataTypes.INTEGER,
        velocityPoints: DataTypes.INTEGER,
        usedSplitPoints: DataTypes.INTEGER,
        remainingSplitPoints: DataTypes.INTEGER
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
