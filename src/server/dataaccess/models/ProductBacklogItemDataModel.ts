// externals
import { Model, DataTypes, Deferrable } from "sequelize";

// utils
import restoreSequelizeAttributesOnClass from "../sequelizeModelHelpers";

// data access
import { sequelize } from "../connection";
import { BacklogItemDataModel } from "./BacklogItemDataModel";

export class ProductBacklogItemDataModel extends Model {
    public id!: string;
    public projectId!: string;
    public backlogitemId!: string | null;
    public nextbacklogitemId!: string | null;
    readonly createdAt!: Date;
    readonly updatedAt!: Date;
    readonly version: number;
    constructor(...args) {
        super(...args);
        restoreSequelizeAttributesOnClass(new.target, this);
    }
}

ProductBacklogItemDataModel.init(
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
            get: function () {
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
            get: function () {
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
            get: function () {
                return this.getDataValue("nextbacklogitemId");
            }
        }
    },
    {
        modelName: "productbacklogitem",
        freezeTableName: true,
        paranoid: false,
        timestamps: true,
        version: true,
        sequelize
    }
);

ProductBacklogItemDataModel.belongsTo(BacklogItemDataModel);
ProductBacklogItemDataModel.belongsTo(BacklogItemDataModel, {
    as: "nextbacklogitem"
});
