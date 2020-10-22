// externals
import { Model, DataTypes, Deferrable } from "sequelize";

// data access
import { sequelize } from "../connection";
import { BacklogItemModel } from "./BacklogItem";
import { SprintModel } from "./Sprint";

export class SprintBacklogModel extends Model {}

SprintBacklogModel.init(
    {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true
        },
        sprintId: {
            type: DataTypes.STRING(32),
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
        modelName: "sprintbacklog",
        freezeTableName: true,
        paranoid: false,
        timestamps: true,
        version: true,
        sequelize
    }
);

BacklogItemModel.hasMany(SprintBacklogModel, { foreignKey: "backlogitemId" });
SprintBacklogModel.belongsTo(BacklogItemModel, { foreignKey: "backlogitemId" });
