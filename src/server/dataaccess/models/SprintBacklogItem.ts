// externals
import { Model, DataTypes, Deferrable } from "sequelize";

// data access
import { sequelize } from "../connection";
import { BacklogItemPartDataModel } from "./BacklogItemPart";

export class SprintBacklogItemDataModel extends Model {
    id: string;
    sprintId: string;
    backlogitempartId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly version: number;
}

SprintBacklogItemDataModel.init(
    {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true
        },
        sprintId: {
            type: DataTypes.STRING(32),
            allowNull: false,
            primaryKey: false,
            references: {
                model: "sprint",
                key: "id",
                deferrable: Deferrable.INITIALLY_DEFERRED as any
            },
            get: function() {
                return this.getDataValue("sprintId");
            }
        },
        backlogitempartId: {
            type: DataTypes.STRING(32),
            allowNull: false,
            primaryKey: false,
            references: {
                model: "backlogitempart",
                key: "id",
                deferrable: Deferrable.INITIALLY_DEFERRED as any
            },
            get: function() {
                return this.getDataValue("backlogitempartId");
            }
        },
        displayindex: DataTypes.INTEGER
    },
    {
        modelName: "sprintbacklogitem",
        freezeTableName: true,
        paranoid: false,
        timestamps: true,
        version: true,
        sequelize
    }
);

BacklogItemPartDataModel.hasMany(SprintBacklogItemDataModel, { foreignKey: "backlogitempartId" });
SprintBacklogItemDataModel.belongsTo(BacklogItemPartDataModel, { foreignKey: "backlogitempartId" });
