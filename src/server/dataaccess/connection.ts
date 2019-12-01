import { Sequelize } from "sequelize";

export const sequelize = new Sequelize("atoll", "atoll", "l1m3atoll", {
    host: "localhost",
    dialect: "postgres",
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
