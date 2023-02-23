import typescript from "@rollup/plugin-typescript";
import externals from "rollup-plugin-node-externals";
import dts from "rollup-plugin-dts";

const PACKAGE_ROOT = process.cwd();

export default [
    {
        plugins: [
            typescript({
                removeComments: false,
                sourceMap: true,
                tsconfig: `${PACKAGE_ROOT}/tsconfig.json`,
            }),
            externals({
                deps: true,
            }),
        ],
        input: `${PACKAGE_ROOT}/src/index.ts`,
        output: {
            file: `${PACKAGE_ROOT}/dist/index.js`,
            format: "cjs",
            sourcemap: true,
        },
    },
    {
        plugins: [dts()],
        input: `${PACKAGE_ROOT}/src/index.ts`,
        output: {
            file: `${PACKAGE_ROOT}/typings/index.d.ts`,
            format: "cjs",
        },
    },
];
