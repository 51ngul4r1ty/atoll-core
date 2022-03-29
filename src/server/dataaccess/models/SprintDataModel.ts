// externals
import { Model, DataTypes, Deferrable } from "sequelize";

// data access
import { sequelize } from "../connection";

// utils
import restoreSequelizeAttributesOnClass from "../sequelizeModelHelpers";

export class SprintDataModel extends Model {
    id: string;
    projectId: string | null;
    name: string | null;
    startdate: string | null; // DATEONLY is returned as a string
    finishdate: string | null; // DATEONLY is returned as a string
    plannedPoints: number | null;
    acceptedPoints: number | null;
    velocityPoints: number | null;
    usedSplitPoints: number | null;
    remainingSplitPoints: number | null;
    totalPoints: number | null;
    archived: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly version: number;
    constructor(...args) {
        super(...args);
        restoreSequelizeAttributesOnClass(new.target, this);
    }
}

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
            get: function () {
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
