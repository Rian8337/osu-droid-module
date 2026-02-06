const base = require("../../jest.config.base.js");
const pack = require("./package.json");

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
    ...base,
    displayName: pack.name,
};
