// a quick-and-dirty util for reverse engineering the webpack config

const isPrimitive = (obj) => {
    const type = typeof(obj);
    switch (type) {
        case 'function':
        case 'number':
        case 'string':
        case 'boolean':
        case 'undefined':
            return true;
        case 'object':
            return false;
        default:
            console.log('------------- UNKNOWN  TYPE: ' + type);
            return false;
    };
};

const needsQuotes = (obj) => {
    const type = typeof(obj);
    switch (type) {
        case 'function':
        case 'number':
        case 'boolean':
        case 'undefined':
        case 'object':
            return false;
        case 'string':
            return true;
        default:
            console.log('------------- UNKNOWN  TYPE: ' + type);
            return false;
    };
};

const valueToString = (value) => {
    if (value === undefined) {
        return 'undefined';
    }
    else if (value === null) {
        return 'null';
    }
    else {
        return `${value}`;
    }
};

const isRegex = (obj) => {
    return obj instanceof RegExp;
}

const regexToString = (value) => {
    return '/' + value.source + '/' + value.flags;
};

const indentLevelAsSpaces = (indentLevel) => {
    let result = '';
    for (let i = 1; i <= indentLevel; i++) {
        result += '  ';
    }
    return result;
};

const buildStringFromValue = (value, currentIndentLevel) => {
    let result = '';
    if (isPrimitive(value)) {
        const quote = needsQuotes(value);
        if (quote) result += '"';
        const rawValue = valueToString(value);
        const valueToUse = quote ? rawValue.replace(/\\/g, '\\\\').replace(/"/g, '\"') : rawValue;
        result += valueToUse;
        if (quote) result += '"';
    }
    else if (isRegex(value)) {
        result += regexToString(value);
    }
    else {
        result += jsonRegexStringify(value, currentIndentLevel + 1);
    }
    return result;
};

const formatKey = (key) => {
    if ((key.indexOf('-') >= 0) || (key.indexOf('.') >= 0)) {
        return `"${key}"`;
    }
    else {
        return key;
    }
};

const jsonRegexStringify = (obj, indentLevel) => {
    let currentIndentLevel = indentLevel || 0;
    let result = '';
    let itemIndex = 0;
    if (obj.length || obj.length === 0) {
        result += '[\n';
        currentIndentLevel++;
        for (let i = 0; i < obj.length; i++) {
            if (i > 0) {
                result += ',\n';
            }
            const value = obj[i];
            result += indentLevelAsSpaces(currentIndentLevel) + buildStringFromValue(value, currentIndentLevel);
        }
        result += '\n';
        currentIndentLevel--;
        result += indentLevelAsSpaces(currentIndentLevel);
        result += ']';
        return result;
    }
    for (let key in obj) {
        if (itemIndex > 0) {
            result += ',\n';
        }
        result += indentLevelAsSpaces(currentIndentLevel);
        const value = obj[key];
        // console.log('KEY= ' + key);
        // console.log('VALUE TYPE= ' + typeof(value));
        // console.log('VALUE= ' + JSON.stringify(value));
        result += formatKey(key) + ': '; 
        result += buildStringFromValue(value, currentIndentLevel);
        itemIndex++;
    }
    return '{' + result + '}';
};

module.exports = {
    jsonRegexStringify,
    isRegex,
    regexToString
};
