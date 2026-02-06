const base = require("./jest.config.base.js");

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
    ...base,
    preset: "ts-jest",
    projects: ["<rootDir>/packages/*/jest.config.js"],
    testEnvironment: "node",
};
