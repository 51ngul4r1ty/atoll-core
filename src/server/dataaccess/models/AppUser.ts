// externals
import { Model, DataTypes } from "sequelize";

// data access
import { sequelize } from "../connection";

export class AppUserDataModel extends Model {}

AppUserDataModel.init(
    {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(80),
            allowNull: false
        },
        description: DataTypes.STRING(240),
        firstName: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        lastName: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        passwordHash: {
            type: DataTypes.STRING(240),
            allowNull: true // NOTE: A null passwordHash and passwordSalt simply means that the account needs to be set up
        },
        passwordSalt: {
            type: DataTypes.STRING(240),
            allowNull: true
        },
        emailAddress: {
            type: DataTypes.STRING(254),
            allowNull: true
        },
        status: {
            type: DataTypes.CHAR(1), // 'A' = active, 'L' = locked, 'D' = disabled
            allowNull: false
        },
        lockedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        modelName: "appuser",
        freezeTableName: true,
        paranoid: false,
        timestamps: true,
        version: true,
        sequelize
    }
);
