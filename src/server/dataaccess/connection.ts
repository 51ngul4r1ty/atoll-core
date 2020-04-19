// externals
import { Sequelize } from "sequelize";

// libraries
import { getDbConfig } from "@atoll/shared";

const dbConfig = getDbConfig();
if (!dbConfig) {
    console.error("Unable to retrieve database configuration - set ATOLL_DATABASE_URL for local development");
}

export const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: "postgres",
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
