// externals
import { Model, DataTypes, Deferrable } from "sequelize";

// utils
import restoreSequelizeAttributesOnClass from "../sequelizeModelHelpers";

// data access
import { sequelize } from "../connection";

export class BacklogItemDataModel extends Model {
    public id!: string;
    public projectId!: string;
    public friendlyId!: string | null;
    public externalId!: string | null;
    public rolePhrase!: string | null;
    public storyPhrase!: string;
    public reasonPhrase!: string | null;
    public estimate!: number | null;
    public type!: string;
    public status!: string | null;
    public acceptanceCriteria!: string | null;
    public startedAt!: Date | null;
    public finishedAt!: Date | null;
    public acceptedAt!: Date | null;
    public releasedAt!: Date | null;
    public totalParts!: number | null;
    readonly createdAt!: Date;
    readonly updatedAt!: Date;
    readonly version: number;
    constructor(...args) {
        super(...args);
        restoreSequelizeAttributesOnClass(new.target, this);
    }
}

BacklogItemDataModel.init(
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
        type: DataTypes.STRING(50),
        status: {
            type: DataTypes.CHAR(1),
            allowNull: true
        },
        acceptanceCriteria: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        totalParts: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        startedAt: DataTypes.DATE,
        finishedAt: DataTypes.DATE,
        acceptedAt: DataTypes.DATE,
        releasedAt: DataTypes.DATE
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
