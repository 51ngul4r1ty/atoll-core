export * from "./models/AppUser";
export * from "./models/BacklogItem";
export * from "./models/BacklogItemPart";
export * from "./models/BacklogItemRank";
export * from "./models/BacklogItemTag";
export * from "./models/Counter";
export * from "./models/Project";
export * from "./models/ProjectSettings";
export * from "./models/Sprint";
export * from "./models/SprintBacklogItem";
export * from "./models/UserSettings";
export * from "./mappers/apiToDataAccessMappers";

// data access
import { sequelize } from "./connection";

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
