import typescript from "@rollup/plugin-typescript";
import externals from "rollup-plugin-node-externals";
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

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
            production && terser(),
        ],
        input: `${PACKAGE_ROOT}/src/index.ts`,
        output: {
            file: `${PACKAGE_ROOT}/dist/index.js`,
            sourcemap: true,
        },
    },
    {
        plugins: [dts()],
        input: `${PACKAGE_ROOT}/src/index.ts`,
        output: {
            file: `${PACKAGE_ROOT}/dist/index.d.ts`,
        },
    },
];
