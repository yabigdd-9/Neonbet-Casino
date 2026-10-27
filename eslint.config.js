import js from "@eslint/js";
import tseslint from "typescript-eslint";
import hooks from "eslint-plugin-react-hooks";
export default [
  { ignores: ["dist/**", "node_modules/**", "test-results/**", "playwright-report/**"] },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        getComputedStyle: "readonly",
        crypto: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        queueMicrotask: "readonly",
        requestAnimationFrame: "readonly",
        process: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
    rules: { "no-unused-vars": "off" },
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["src/**/*.{jsx,tsx}"],
    plugins: { "react-hooks": hooks },
    rules: { "react-hooks/rules-of-hooks": "error" },
  },
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    ignores: ["**/*.test.*"],
    rules: { "no-restricted-imports": ["error", { patterns: ["**/server/**", "node:*"] }] },
  },
];
