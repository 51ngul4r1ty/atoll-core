// externals
import { Model, DataTypes, Deferrable } from "sequelize";

// utils
import restoreSequelizeAttributesOnClass from "../sequelizeModelHelpers";

// data access
import { sequelize } from "../connection";
import { BacklogItemDataModel } from "./BacklogItem";

export class BacklogItemPartDataModel extends Model {
    public id!: string;
    public externalId!: string | null;
    public backlogitemId!: string;
    public partindex!: number | null;
    public percentage!: number | null;
    public points!: number | null;
    public startedAt!: Date | null;
    public finishedAt!: Date | null;
    public status: string | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly version: number;
    constructor(...args) {
        super(...args);
        restoreSequelizeAttributesOnClass(new.target, this);
    }
}

BacklogItemPartDataModel.init(
    {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true,
            get: function() {
                return this.getDataValue("id");
            }
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
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        version: {
            type: DataTypes.INTEGER,
            allowNull: false
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
BacklogItemDataModel.hasMany(BacklogItemPartDataModel, { foreignKey: "backlogitemId" });
