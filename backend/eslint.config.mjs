import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "prisma/client/**",
      "coverage/**",
      "build/**",
      "*.log",
      "jest.config.js"
    ]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // 1. Force you to await Prisma/Async calls
      "@typescript-eslint/no-floating-promises": "error",
      // 2. Prevent accidental use of 'any' in your Zod/Prisma types
      "@typescript-eslint/no-explicit-any": "warn",
      // 3. Ensure you don't forget to handle errors in async functions
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ]
    },
  },
  {
    // A separate block for JS/MJS config files so they don't trigger the parser error
    files: ["*.config.mjs", "*.config.js", "*.config.ts"],
    extends: [tseslint.configs.disableTypeChecked],
  }
);
