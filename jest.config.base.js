/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    roots: ["<rootDir>/tests"],
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    verbose: true,
};
