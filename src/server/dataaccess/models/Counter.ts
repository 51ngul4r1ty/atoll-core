// externals
import { Model, DataTypes } from "sequelize";

// data access
import { sequelize } from "../connection";

export class CounterModel extends Model {}

CounterModel.init(
    {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true
        },
        entity: {
            type: DataTypes.STRING(32),
            allowNull: false
        },
        entityId: {
            type: DataTypes.STRING(32),
            allowNull: true // NOTE: null means that this is the default that applies to all entities
        },
        lastNumber: {
            type: DataTypes.BIGINT,
            allowNull: true // NOTE: null means that we're going to start at the beginning of the sequence
        },
        lastCounterValue: {
            type: DataTypes.STRING(32), // BIGINT needs 20 digits and we allow a 12 digit prefix
            allowNull: true
        }
    },
    {
        modelName: "Counter",
        freezeTableName: true,
        paranoid: false,
        timestamps: true,
        version: true,
        sequelize
    }
);
