import typescript from "@rollup/plugin-typescript";
import externals from "rollup-plugin-node-externals";

const PACKAGE_ROOT = process.cwd();

export default {
    input: `${PACKAGE_ROOT}/src/index.ts`,
    plugins: [
        typescript({
            tsconfig: `${PACKAGE_ROOT}/tsconfig.json`,
        }),
        externals({
            deps: true,
        }),
    ],
    output: {
        file: `${PACKAGE_ROOT}/dist/index.js`,
        format: "cjs",
        sourcemap: true,
    }
};