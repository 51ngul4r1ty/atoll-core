// externals
import { Model, DataTypes, Deferrable } from "sequelize";

// data access
import { sequelize } from "../connection";

export class ProjectSettingsDataModel extends Model {
    public id!: string;
    public projectId!: string;
    public settings!: any;
}

ProjectSettingsDataModel.init(
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
        settings: {
            type: DataTypes.JSON,
            allowNull: false,
            get: function () {
                return this.getDataValue("settings");
            }
        }
    },
    {
        modelName: "projectsettings",
        freezeTableName: true,
        paranoid: false,
        timestamps: true,
        version: true,
        sequelize
    }
);
