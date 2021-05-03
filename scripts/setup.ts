// externals
const sequelizeLib = require("sequelize");
const cryptoLib = require("crypto");

// libraries
const sharedLib = require("@atoll/shared");

const { Sequelize } = sequelizeLib;
const dbConfig = sharedLib.getDbConfig();

if (!dbConfig) {
    console.error("Unable to retrieve database configuration - set ATOLL_DATABASE_URL for local development");
} else {
    console.log("Database configuration retrieved successfully.");
}

const buildOptions = () /*: Options*/ => ({
    host: dbConfig.host,
    dialect: "postgres",
    dialectOptions: {
        ssl: dbConfig.useSsl
    },
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, buildOptions());

const id = "217796f6e1ab455a980263171099533f";
const username = "test";
const password = "atoll";
const description = "description";
const userStatus = "A";

const computePasswordSalt = (): string => {
    const salt = cryptoLib.randomBytes(16).toString("hex");
    return `${salt}`;
};

const computePasswordHash = (password: string, salt: string): string => {
    const hash = cryptoLib.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
    return hash;
};

const passwordSalt = computePasswordSalt();
const passwordHash = computePasswordHash(password, passwordSalt);

const createdAt = new Date();
const updatedAt = new Date();

const encodeFieldForSql = (field: string | Date) => {
    if (typeof field === "string") {
        return field.replace("'", "'");
    } else {
        return field.toISOString();
    }
};

const sql = `
    insert into appuser(
        id,
        name,
        description,
        "firstName",
        "lastName",
        "passwordHash",
        "passwordSalt",
        status,
        "createdAt",
        "updatedAt",
        version
    ) values (
        '${encodeFieldForSql(id)}',
        '${encodeFieldForSql(username)}',
        '${encodeFieldForSql(description)}',
        null,
        null,
        '${encodeFieldForSql(passwordHash)}',
        '${encodeFieldForSql(passwordSalt)}',
        '${encodeFieldForSql(userStatus)}',
        '${encodeFieldForSql(createdAt)}',
        '${encodeFieldForSql(updatedAt)}',
        0)
`;

console.log(
    `Executing query to create new user.  You should see a successful message below- if you don't then something has gone wrong.`
);

const result = sequelize
    .query(sql)
    .then((result) => {
        console.log("");
        console.log("Executed SQL statement to set up test user account successfully.");
        console.log("");
        process.exit(0);
    })
    .catch((error) => {
        console.log(`Error executing SQL statement to set up test user account: ${error}`);
        process.exit(1);
    });
