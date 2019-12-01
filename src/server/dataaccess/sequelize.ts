import { Sequelize, Model, DataTypes } from "sequelize";
// import * as SprintModel from "./models/sprint";

const sequelize = new Sequelize("atoll", "atoll", "l1m3atoll", {
    host: "localhost",
    dialect: "postgres",
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

export class Sprint extends Model {}

Sprint.init(
    {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true
        },
        name: DataTypes.STRING(50),
        displayindex: DataTypes.BIGINT,
        startdate: DataTypes.DATE,
        finishdate: DataTypes.DATE
    },
    {
        modelName: "sprint",
        freezeTableName: true,
        paranoid: false,
        timestamps: true,
        version: true,
        sequelize
    }
);

export class BacklogItem extends Model {}

BacklogItem.init(
    {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true
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
            type: DataTypes.BIGINT,
            allowNull: true
        },
        type: DataTypes.STRING(50),
        displayIndex: DataTypes.BIGINT
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

export class BacklogItemTag extends Model {}

BacklogItemTag.init(
    {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true
        },
        label: DataTypes.STRING(50)
    },
    {
        modelName: "backlogitemtag",
        freezeTableName: true,
        paranoid: false,
        timestamps: false,
        version: false,
        sequelize
    }
);

// export const Sprint = SprintModel(sequelize, Sequelize);
// // BlogTag will be our way of tracking relationship between Blog and Tag models
// // each Blog can have multiple tags and each Tag can have multiple blogs
// const BlogTag = sequelize.define("blog_tag", {});

// BacklogItem.belongsToMany(BacklogItemTag, { through: BacklogItemTag, unique: false });
// Tag.belongsToMany(Blog, { through: BlogTag, unique: false });
BacklogItemTag.belongsTo(BacklogItem);

sequelize
    .sync({ force: false })
    .then(() => {
        console.log(`Database & tables created!`);
    })
    .catch((err) => {
        console.log(`An error occurred: ${err}`);
    });
