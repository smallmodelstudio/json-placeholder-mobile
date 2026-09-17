const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const tseslint = require('typescript-eslint');

module.exports = defineConfig([
  {
    ignores: ['dist/*', 'coverage/*', '.expo/*', 'expo-env.d.ts'],
  },
  expoConfig,
  {
    // Config files run in Node, not the app runtime.
    files: ['*.config.js'],
    languageOptions: { globals: { __dirname: 'readonly' } },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  eslintPluginPrettierRecommended,
]);
