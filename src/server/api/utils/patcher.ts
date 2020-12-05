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

export const validatePatchObjects = (targetNode: any, sourceNode: any): PatchValidationResult => {
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
        valid: validationResult.extraFields.length === 0,
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

export const getPatchedItem = (obj: any, fields: any) => {
    const validationResult = validatePatchObjects(obj, fields);
    if (!validationResult.valid) {
        throw new Error(getValidationFailureMessage(validationResult));
    }
    return { ...obj, ...fields };
};
