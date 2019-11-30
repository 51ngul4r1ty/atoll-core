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
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: DataTypes.STRING,
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

// export const Sprint = SprintModel(sequelize, Sequelize);
// // BlogTag will be our way of tracking relationship between Blog and Tag models
// // each Blog can have multiple tags and each Tag can have multiple blogs
// const BlogTag = sequelize.define("blog_tag", {});

// Blog.belongsToMany(Tag, { through: BlogTag, unique: false });
// Tag.belongsToMany(Blog, { through: BlogTag, unique: false });
// Blog.belongsTo(User);

sequelize.sync({ force: true }).then(() => {
    console.log(`Database & tables created!`);
});
