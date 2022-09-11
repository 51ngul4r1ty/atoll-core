export interface PatchValidationResult {
    valid: boolean;
    extraFields: string[];
}

export const validateBaseKeys = (targetNode: any, sourceNode: any): PatchValidationResult => {
    const sourceKeys = Object.keys(sourceNode || {});
    const extraFields = [];
    sourceKeys.forEach((key) => {
        if (!targetNode.hasOwnProperty(key)) {
            extraFields.push(key);
        }
    });
    return {
        valid: extraFields.length === 0,
        extraFields
    };
};

export type ValidatePatchObjectsOptions = {
    allowExtraFields: boolean;
};

export const validatePatchObjects = (
    targetNode: any,
    sourceNode: any,
    options: ValidatePatchObjectsOptions = { allowExtraFields: false }
): PatchValidationResult => {
    const validationResult = validateBaseKeys(targetNode, sourceNode);
    const sourceKeys = Object.keys(sourceNode || {});
    sourceKeys.forEach((key) => {
        const newSourceNode = sourceNode[key];
        if (typeof newSourceNode === "object") {
            const newTargetNode = targetNode[key];
            if (newTargetNode) {
                const childValidationResult = validatePatchObjects(newTargetNode, newSourceNode);
                childValidationResult.extraFields.forEach((field) => {
                    validationResult.extraFields.push(key + "." + field);
                });
            }
        }
    });
    return {
        valid: validationResult.extraFields.length === 0 || options.allowExtraFields,
        extraFields: validationResult.extraFields
    };
};

export const getValidationFailureMessage = (validationResult: PatchValidationResult): string => {
    if (validationResult.valid) {
        return "patch object is valid";
    }
    return "extra fields found in new object: " + validationResult.extraFields.join(", ");
};

export const getInvalidPatchMessage = (obj: any, fields: any) => {
    const validationResult = validatePatchObjects(obj, fields);
    if (!validationResult.valid) {
        return getValidationFailureMessage(validationResult);
    }
    return null;
};

export type GetPatchedItemOptions = {
    preserveNestedFields: boolean;
    allowExtraFields: boolean;
};

const getPatchedItemInternal = <T>(obj: T, fields: any, basePropertyPath: string, options: GetPatchedItemOptions): T => {
    if (options.allowExtraFields && !options.preserveNestedFields) {
        throw new Error("getPatchedItem may not work properly when allowExtraFields is used without preserveNestedFields");
    }
    const validationResult = validatePatchObjects(obj, fields, { allowExtraFields: options.allowExtraFields });
    if (!validationResult.valid) {
        throw new Error(getValidationFailureMessage(validationResult));
    }
    if (options.preserveNestedFields) {
        const result: any = {};
        const sourceFieldSet = new Set();
        Object.keys(obj).forEach((fieldName) => {
            sourceFieldSet.add(fieldName);
            const propertyPath = basePropertyPath ? `${basePropertyPath}.${fieldName}` : fieldName;
            const sourceFieldValue = obj[fieldName];
            if (!fields.hasOwnProperty(fieldName)) {
                result[fieldName] = sourceFieldValue;
            } else if (typeof sourceFieldValue === "object") {
                const targetFieldObjectValue = fields[fieldName];
                if (targetFieldObjectValue === null) {
                    result[fieldName] = null;
                } else if (typeof targetFieldObjectValue !== "object") {
                    throw new Error(
                        `Unable to patch object- nested target property "${propertyPath}"` +
                            " is not an object, but source property is"
                    );
                } else {
                    result[fieldName] = getPatchedItemInternal(sourceFieldValue, targetFieldObjectValue, propertyPath, options);
                }
            } else {
                const targetFieldValue = fields[fieldName];
                result[fieldName] = targetFieldValue;
            }
        });
        Object.keys(fields).forEach((fieldName) => {
            if (!sourceFieldSet.has(fieldName)) {
                result[fieldName] = fields[fieldName];
            }
        });
        return result;
    }
    return { ...obj, ...fields };
};

export const getPatchedItem = <T>(
    obj: T,
    fields: any,
    options: GetPatchedItemOptions = { preserveNestedFields: false, allowExtraFields: false }
): T => {
    return getPatchedItemInternal(obj, fields, "", options);
};
