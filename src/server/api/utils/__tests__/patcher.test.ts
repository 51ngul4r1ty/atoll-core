// test related
import "jest";

// code under test
import { getValidationFailureMessage, validateBaseKeys, validatePatchObjects } from "../patcher";

describe("Patcher", () => {
    describe("validateBaseKeys", () => {
        it("should handle empty objects correctly", () => {
            const actual = validateBaseKeys({}, {});
            expect(actual.valid).toBeTruthy();
        });
        it("should treat null and empty objects the same", () => {
            const actual = validateBaseKeys(null, {});
            expect(actual.valid).toBeTruthy();
        });
        it("should treat empty and null objects the same", () => {
            const actual = validateBaseKeys({}, null);
            expect(actual.valid).toBeTruthy();
        });
        it("should handle flat object structure correctly", () => {
            const actual = validateBaseKeys({ a: 1, b: 2, c: 3 }, { a: 10, b: 20, c: 30 });
            expect(actual.valid).toBeTruthy();
        });
        it("should return invalid when extra fields found", () => {
            const actual = validateBaseKeys({ a: 1, b: 2 }, { a: 10, b: 20, c: 30 });
            expect(actual.valid).toBeFalsy();
            expect(actual.extraFields).toStrictEqual(["c"]);
        });
        it("should ignore complex object fields in target node", () => {
            const actual = validateBaseKeys({ a: 1, complex: { x: 5, y: 9 } }, { a: 10 });
            expect(actual.valid).toBeTruthy();
        });
        it("should treat extra complex object fields in source node as invalid", () => {
            const actual = validateBaseKeys({ a: 1 }, { a: 10, complex: { x: 5, y: 9 } });
            expect(actual.valid).toBeFalsy();
            expect(actual.extraFields).toStrictEqual(["complex"]);
        });
        it("should ignore complex object extra fields in source node", () => {
            const actual = validateBaseKeys({ a: 1, complex: { x: 5, y: 9 } }, { a: 10, complex: { x: 5, y: 9, z: 7 } });
            expect(actual.valid).toBeTruthy();
        });
    });
    describe("validatePatchObjects", () => {
        it("should handle unpatchable nested objects correctly", () => {
            const actual = validatePatchObjects(
                {
                    a: 1,
                    b: {
                        ba: 2,
                        c: {
                            ca: 3
                        }
                    }
                },
                {
                    a: 1,
                    b: {
                        ba: 2,
                        c: {
                            ca: 3,
                            cb: "invalid"
                        }
                    }
                }
            );
            expect(actual.valid).toBeFalsy();
            expect(actual.extraFields).toStrictEqual(["b.c.cb"]);
        });
        it("should handle patchable nested objects correctly", () => {
            const actual = validatePatchObjects(
                {
                    a: 1,
                    b: {
                        ba: 2,
                        c: {
                            ca: 3,
                            cb: "valid"
                        }
                    }
                },
                {
                    a: 1,
                    b: {
                        ba: 2,
                        c: {
                            ca: 3
                        }
                    }
                }
            );
            expect(actual.valid).toBeTruthy();
        });
    });
    describe("getValidationFailureMessage", () => {
        it("should handle a single invalid nested field", () => {
            const actual = getValidationFailureMessage({ valid: false, extraFields: ["b.c.cb"] });
            expect(actual).toEqual("extra fields found in new object: b.c.cb");
        });
        it("should handle valid scenario", () => {
            const actual = getValidationFailureMessage({ valid: true, extraFields: [] });
            expect(actual).toEqual("patch object is valid");
        });
    });
});
