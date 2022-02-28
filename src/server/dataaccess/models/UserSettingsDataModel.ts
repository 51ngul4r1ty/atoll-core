// externals
import { Model, DataTypes, Deferrable } from "sequelize";

// data access
import { sequelize } from "../connection";

export class UserSettingsDataModel extends Model {}

UserSettingsDataModel.init(
    {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true
        },
        appuserId: {
            type: DataTypes.STRING(32),
            primaryKey: false,
            references: {
                model: "appuser",
                key: "id",
                deferrable: Deferrable.INITIALLY_DEFERRED as any
            },
            get: function() {
                return this.getDataValue("appuserId");
            }
        },
        settings: {
            type: DataTypes.JSON,
            allowNull: false,
            get: function() {
                return this.getDataValue("settings");
            }
        }
    },
    {
        modelName: "usersettings",
        freezeTableName: true,
        paranoid: false,
        timestamps: true,
        version: true,
        sequelize
    }
);
