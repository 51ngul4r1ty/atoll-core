// externals
import { Model, DataTypes, Deferrable } from "sequelize";

// data access
import { sequelize } from "../connection";
import { BacklogItemDataModel } from "./BacklogItem";

export class SprintBacklogItemDataModel extends Model {}

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
        backlogitemId: {
            type: DataTypes.STRING(32),
            allowNull: false,
            primaryKey: false,
            references: {
                model: "backlogitem",
                key: "id",
                deferrable: Deferrable.INITIALLY_DEFERRED as any
            },
            get: function() {
                return this.getDataValue("backlogitemId");
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

BacklogItemDataModel.hasMany(SprintBacklogItemDataModel, { foreignKey: "backlogitemId" });
SprintBacklogItemDataModel.belongsTo(BacklogItemDataModel, { foreignKey: "backlogitemId" });
