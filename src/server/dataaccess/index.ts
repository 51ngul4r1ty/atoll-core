export * from "./models/AppUser";
export * from "./models/BacklogItem";
export * from "./models/BacklogItemRank";
export * from "./models/BacklogItemTag";
export * from "./models/Counter";
export * from "./models/Project";
export * from "./models/ProjectSettings";
export * from "./models/Sprint";
export * from "./models/SprintBacklog";
export * from "./models/UserSettings";
export * from "./mappers";

// data access
import { sequelize } from "./connection";

// export const Sprint = SprintModel(sequelize, Sequelize);
// // BlogTag will be our way of tracking relationship between Blog and Tag models
// // each Blog can have multiple tags and each Tag can have multiple blogs
// const BlogTag = sequelize.define("blog_tag", {});

// BacklogItem.belongsToMany(BacklogItemTag, { through: BacklogItemTag, unique: false });
// Tag.belongsToMany(Blog, { through: BlogTag, unique: false });

export const init = () => {
    sequelize
        .sync({ force: false })
        .then(() => {
            console.log(`Database & tables created!`);
        })
        .catch((err) => {
            console.log(`An error occurred: ${err}`);
        });
};
