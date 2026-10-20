// ESLint 9, not 10: eslint-plugin-jsx-a11y (the accessibility rules) does not accept 10
// yet. ponytail: move to 10 with eslint-plugin-astro 3 once jsx-a11y's peer range allows.
import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["dist/", ".astro/", "node_modules/", ".pnpm-store/"] },
  js.configs.recommended,
  tseslint.configs.strict,
  astro.configs.recommended,
  // Registers jsx-a11y for every file; the islands below only add its strict rules.
  astro.configs["jsx-a11y-strict"],
  {
    files: ["**/*.tsx"],
    plugins: { "react-hooks": reactHooks },
    rules: { ...jsxA11y.flatConfigs.strict.rules, ...reactHooks.configs.recommended.rules },
  },
  { languageOptions: { globals: { ...globals.browser } } },
  { files: ["*.config.{js,mjs}"], languageOptions: { globals: { ...globals.node } } },
);
