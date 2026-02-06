/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
    roots: ["<rootDir>/tests"],
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    verbose: true,
};
