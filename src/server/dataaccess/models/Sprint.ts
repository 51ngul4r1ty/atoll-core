// externals
import { Model, DataTypes, Deferrable } from "sequelize";

// data access
import { sequelize } from "../connection";

export class SprintDataModel extends Model {}

SprintDataModel.init(
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
        startdate: DataTypes.DATEONLY,
        finishdate: DataTypes.DATEONLY,
        plannedPoints: DataTypes.DECIMAL(10, 2),
        acceptedPoints: DataTypes.DECIMAL(10, 2),
        velocityPoints: DataTypes.DECIMAL(10, 2),
        usedSplitPoints: DataTypes.DECIMAL(10, 2),
        remainingSplitPoints: DataTypes.DECIMAL(10, 2),
        totalPoints: DataTypes.DECIMAL(10, 2),
        archived: {
            type: DataTypes.CHAR(1),
            allowNull: false
        }
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
