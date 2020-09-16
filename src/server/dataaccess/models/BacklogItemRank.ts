// externals
import { Model, DataTypes, Deferrable } from "sequelize";

// data access
import { sequelize } from "../connection";
import { BacklogItemModel } from "./BacklogItem";

export class BacklogItemRankModel extends Model {}

BacklogItemRankModel.init(
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
                // TODO: Find out why it was defined this way:
                deferrable: Deferrable.INITIALLY_DEFERRED as any
            },
            get: function() {
                return this.getDataValue("projectId");
            }
        },
        backlogitemId: {
            type: DataTypes.STRING(32),
            primaryKey: false,
            references: {
                model: "backlogitem",
                key: "id",
                // TODO: Find out why it was defined this way:
                deferrable: Deferrable.INITIALLY_DEFERRED as any
            },
            get: function() {
                return this.getDataValue("backlogitemId");
            }
        },
        nextbacklogitemId: {
            type: DataTypes.STRING(32),
            primaryKey: false,
            references: {
                model: "backlogitem",
                key: "id",
                // TODO: Find out why it was defined this way:
                deferrable: Deferrable.INITIALLY_DEFERRED as any
            },
            get: function() {
                return this.getDataValue("nextbacklogitemId");
            }
        }
    },
    {
        modelName: "backlogitemrank",
        freezeTableName: true,
        paranoid: false,
        timestamps: true,
        version: true,
        sequelize
    }
);

BacklogItemRankModel.belongsTo(BacklogItemModel);
BacklogItemRankModel.belongsTo(BacklogItemModel, {
    as: "nextbacklogitem"
});
