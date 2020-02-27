// NOTE: When adding new entries here manually you can use `npm run output:now`

export const FEATURE_TOGGLE_LIST = {
    /* NOTE: To test browser dark mode prefs on/off just toggle this - it will move to DB later */
    showEditButton: {
        enabled: false,
        createdDateTime: new Date("2020-02-23T15:55:15.335Z"),
        modifiedDateTime: new Date("2020-02-23T15:55:15.335Z")
    },
    enableSprintTab: {
        enabled: false,
        createdDateTime: new Date("2020-02-27T13:56:44.341Z"),
        modifiedDateTime: new Date("2020-02-27T13:56:44.341Z")
    },
    enableReviewTab: {
        enabled: false,
        createdDateTime: new Date("2020-02-27T13:56:44.341Z"),
        modifiedDateTime: new Date("2020-02-27T13:56:44.341Z")
    }
};
