// test related
import "jest";

// code under test
import {
    getValidationFailureMessage,
    validateBaseKeys,
    validatePatchObjects,
    getInvalidPatchMessage,
    getPatchedItem
} from "../patcher";

describe("Patcher", () => {
    describe("validateBaseKeys", () => {
        it("should handle empty objects correctly", () => {
            // arrange
            const sourceNode = {};
            const targetNode = {};

            // act
            const actual = validateBaseKeys(targetNode, sourceNode);

            // assert
            expect(actual.valid).toBeTruthy();
        });
        it("should treat null and empty objects the same", () => {
            // arrange
            const sourceNode = {};
            const targetNode = null;

            // act
            const actual = validateBaseKeys(targetNode, sourceNode);

            // assert
            expect(actual.valid).toBeTruthy();
        });
        it("should treat empty and null objects the same", () => {
            // arrange
            const sourceNode = null;
            const targetNode = {};

            // act
            const actual = validateBaseKeys(targetNode, sourceNode);

            // assert
            expect(actual.valid).toBeTruthy();
        });
        it("should handle flat object structure correctly", () => {
            // arrange
            const sourceNode = { a: 10, b: 20, c: 30 };
            const targetNode = { a: 1, b: 2, c: 3 };

            // act
            const actual = validateBaseKeys(targetNode, sourceNode);

            // assert
            expect(actual.valid).toBeTruthy();
        });
        it("should return invalid when extra fields found", () => {
            // arrange
            const sourceNode = { a: 10, b: 20, c: 30 };
            const targetNode = { a: 1, b: 2 };

            // act
            const actual = validateBaseKeys(targetNode, sourceNode);

            // assert
            expect(actual.valid).toBeFalsy();
            expect(actual.extraFields).toStrictEqual(["c"]);
        });
        it("should return valid when original fields have false value", () => {
            // arrange
            const sourceNode = { a: 10, b: 20 };
            const targetNode = { a: false, b: 2 };

            // act
            const actual = validateBaseKeys(targetNode, sourceNode);

            // assert
            expect(actual.valid).toBeTruthy();
        });
        it("should ignore complex object fields in target node", () => {
            // arrange
            const sourceNode = { a: 10 };
            const targetNode = { a: 1, complex: { x: 5, y: 9 } };

            // act
            const actual = validateBaseKeys(targetNode, sourceNode);

            // assert
            expect(actual.valid).toBeTruthy();
        });
        it("should treat extra complex object fields in source node as invalid", () => {
            // arrange
            const sourceNode = { a: 10, complex: { x: 5, y: 9 } };
            const targetNode = { a: 1 };

            // act
            const actual = validateBaseKeys(targetNode, sourceNode);

            // assert
            expect(actual.valid).toBeFalsy();
            expect(actual.extraFields).toStrictEqual(["complex"]);
        });
        it("should ignore complex object extra fields in source node", () => {
            // arrange
            const targetNode = { a: 1, complex: { x: 5, y: 9 } };
            const sourceNode = { a: 10, complex: { x: 5, y: 9, z: 7 } };

            // act
            const actual = validateBaseKeys(targetNode, sourceNode);

            // assert
            expect(actual.valid).toBeTruthy();
        });
    });
    describe("validatePatchObjects", () => {
        it("should handle unpatchable nested objects correctly", () => {
            // arrange
            const obj = {
                a: 1,
                b: {
                    ba: 2,
                    c: {
                        ca: 3
                    }
                }
            };
            const fields = {
                a: 1,
                b: {
                    ba: 2,
                    c: {
                        ca: 3,
                        cb: "invalid"
                    }
                }
            };

            // act
            const actual = validatePatchObjects(obj, fields);

            // assert
            expect(actual.valid).toBeFalsy();
            expect(actual.extraFields).toStrictEqual(["b.c.cb"]);
        });
        it("should handle patchable nested objects correctly", () => {
            // arrange
            const obj = {
                a: 1,
                b: {
                    ba: 2,
                    c: {
                        ca: 3,
                        cb: "valid"
                    }
                }
            };
            const fields = {
                a: 1,
                b: {
                    ba: 2,
                    c: {
                        ca: 3
                    }
                }
            };

            // act
            const actual = validatePatchObjects(obj, fields);

            // assert
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
    describe("getInvalidPatchMessage", () => {
        it("should handle unpatchable nested objects correctly", () => {
            // arrange
            const obj = {
                a: 1,
                b: {
                    ba: 2,
                    c: {
                        ca: 3
                    }
                }
            };
            const fields = {
                a: 1,
                b: {
                    ba: 2,
                    c: {
                        ca: 3,
                        cb: "invalid"
                    }
                }
            };

            // act
            const actual = getInvalidPatchMessage(obj, fields);

            // assert
            expect(actual).toBe("extra fields found in new object: b.c.cb");
        });
        it("should handle patchable nested objects correctly", () => {
            // arrange
            const obj = {
                a: 1,
                b: {
                    ba: 2,
                    c: {
                        ca: 3,
                        cb: "valid"
                    }
                }
            };
            const fields = {
                a: 1,
                b: {
                    ba: 2,
                    c: {
                        ca: 3
                    }
                }
            };

            // act
            const actual = getInvalidPatchMessage(obj, fields);

            // assert
            expect(actual).toBe(null);
        });
    });
    describe("getPatchedItem", () => {
        it("should update a simple object structure 1-1", () => {
            // arrange
            const obj = {
                aSimpleField: "starting-value"
            };
            const fields = {
                aSimpleField: "updated-value"
            };

            // act
            const actual = getPatchedItem(obj, fields);

            // assert
            expect(actual).toStrictEqual({
                aSimpleField: "updated-value"
            });
        });
        it("should update a single field and keep existing fields", () => {
            // arrange
            const obj = {
                aSimpleField: "starting-value",
                missingField: "keep-this"
            };
            const fields = {
                aSimpleField: "updated-value"
            };

            // act
            const actual = getPatchedItem(obj, fields);

            // assert
            expect(actual).toStrictEqual({
                aSimpleField: "updated-value",
                missingField: "keep-this"
            });
        });
    });
});
