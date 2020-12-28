import "jest";

expect.extend({
    toEqualX(actual, msgAndValueObj) {
        const name = msgAndValueObj.name;
        const value = msgAndValueObj.value;
        if (actual === value) {
            return {
                message: () => `${name} equals "${value}"`,
                pass: true
            };
        } else {
            return {
                message: () => `${name} should equal "${value}" but received "${actual}"`,
                pass: false
            };
        }
    }
});
