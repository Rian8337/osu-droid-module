/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
    roots: ["<rootDir>/tests"],
    transform: {
        "^.+\\.ts$": ["ts-jest", { tsconfig: { isolatedModules: true } }],
    },
    verbose: true,
};
