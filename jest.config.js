const paths = require("./config/paths");

module.exports = {
    verbose: true,
    collectCoverageFrom: ["src/**/*.{js,jsx,mjs,ts,tsx}"],
    coverageReporters: ["lcov", "text-summary"],
    coverageThreshold: {
        global: {
            statements: 11.5,
            branches: 7.12,
            functions: 11.88,
            lines: 11.45
        }
    },
    setupFiles: ["<rootDir>/node_modules/regenerator-runtime/runtime", "<rootDir>/config/polyfills.js"],
    setupFilesAfterEnv: ["<rootDir>config/jest/setup.js"],
    testMatch: ["<rootDir>/src/*.test.{js,jsx,mjs,ts,tsx}", "<rootDir>/src/**/*.test.{js,jsx,mjs,ts,tsx}"],
    testEnvironment: "node",
    testURL: "http://localhost",
    transform: {
        "^.+\\.(js|jsx|mjs|ts|tsx)$": "<rootDir>/node_modules/babel-jest",
        "^.+\\.css$": "<rootDir>/config/jest/cssTransform.js",
        "^(?!.*\\.(js|jsx|mjs|ts|tsx|css|json)$)": "<rootDir>/config/jest/fileTransform.js"
    },
    transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx|mjs)$"],
    moduleDirectories: paths.resolveModules,
    moduleFileExtensions: ["js", "json", "jsx", "node", "mjs", "ts", "tsx"]
};
