/* eslint-disable @typescript-eslint/no-var-requires */
const base = require("../../jest.config.base.js");
const pack = require("./package.json");

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    ...base,
    name: pack.name,
    displayName: pack.name,
    rootDir: "../..",
    testMatch: [`<rootDir>/packages/${pack.name}/**/*.test.ts`],
};
