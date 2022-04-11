export * from "./models/AppUserDataModel";
export * from "./models/BacklogItemDataModel";
export * from "./models/BacklogItemPartDataModel";
export * from "./models/ProductBacklogItemDataModel";
export * from "./models/BacklogItemTagDataModel";
export * from "./models/CounterDataModel";
export * from "./models/ProjectDataModel";
export * from "./models/ProjectSettingsDataModel";
export * from "./models/SprintDataModel";
export * from "./models/SprintBacklogItemPartDataModel";
export * from "./models/UserSettingsDataModel";

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
