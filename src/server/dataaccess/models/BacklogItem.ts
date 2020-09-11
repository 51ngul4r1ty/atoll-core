// externals
import { Model, DataTypes } from "sequelize";

// data access
import { sequelize } from "../connection";

export class BacklogItemModel extends Model {}

BacklogItemModel.init(
    {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true
        },
        friendlyId: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        externalId: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        rolePhrase: {
            type: DataTypes.STRING(80),
            allowNull: true
        },
        storyPhrase: DataTypes.STRING(80),
        reasonPhrase: {
            type: DataTypes.STRING(80),
            allowNull: true
        },
        estimate: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        type: DataTypes.STRING(50)
    },
    {
        modelName: "backlogitem",
        freezeTableName: true,
        paranoid: false,
        timestamps: true,
        version: true,
        sequelize
    }
);
