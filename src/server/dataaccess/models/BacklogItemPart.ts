// externals
import { Model, DataTypes, Deferrable } from "sequelize";

// data access
import { sequelize } from "../connection";
import { BacklogItemDataModel } from "./BacklogItem";

export class BacklogItemPartDataModel extends Model {}

BacklogItemPartDataModel.init(
    {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true
        },
        externalId: {
            type: DataTypes.STRING(30),
            allowNull: true
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
        partindex: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        percentage: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        points: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        startedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        finishedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        status: {
            type: DataTypes.CHAR(1),
            allowNull: true
        }
    },
    {
        modelName: "backlogitempart",
        freezeTableName: true,
        paranoid: false,
        timestamps: true,
        version: true,
        sequelize
    }
);

BacklogItemPartDataModel.belongsTo(BacklogItemDataModel);
