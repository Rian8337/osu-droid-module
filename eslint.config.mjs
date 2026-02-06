// @ts-check

import eslint from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
    {
        ignores: [
            "**/dist/",
            "**/node_modules/",
            "testing.js",
            "*.md",
            "*.osu",
        ],
    },
    eslint.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.es2022,
            },
        },
    },
    {
        files: ["**/*.ts"],
        ignores: ["**/*.d.ts"],
        extends: [
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
        ],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-extraneous-class": "off",
        },
    },
    {
        files: [
            "eslint.config.mjs",
            "prettier.config.mjs",
            "rollup.config.mjs",
        ],
        ...tseslint.configs.disableTypeChecked,
    },
);
