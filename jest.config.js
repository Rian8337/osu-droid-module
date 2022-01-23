// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require("./jest.config.base.js");

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    ...base,
    preset: "ts-jest",
    projects: ["<rootDir>/packages/*/jest.config.js"],
    testEnvironment: "node",
};
