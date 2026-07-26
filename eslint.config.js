import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'docs']),
  ...tseslint.config(
    {
      files: ['src/**/*.{js,jsx,ts,tsx}'],
      extends: [
        js.configs.recommended,
        ...tseslint.configs.recommended,
        reactHooks.configs.flat.recommended,
        reactRefresh.configs.vite,
        jsxA11y.flatConfigs.recommended,
      ],
      languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser,
        parserOptions: {
          ecmaVersion: 'latest',
          ecmaFeatures: { jsx: true },
          sourceType: 'module',
        },
      },
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' },
        ],
      },
    },
    {
      files: ['api/**/*.{js,ts}', 'shared/**/*.{js,ts}', '*.config.js'],
      extends: [js.configs.recommended, ...tseslint.configs.recommended],
      languageOptions: {
        ecmaVersion: 'latest',
        globals: globals.node,
      },
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' },
        ],
      },
    },
    {
      files: [
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/test/**/*.{js,jsx,ts,tsx}',
        'api/**/*.test.{js,ts}',
        'shared/**/*.test.{js,ts}',
      ],
      languageOptions: {
        globals: { ...globals.browser, ...globals.node, ...globals.vitest },
      },
    },
    {
      files: ['e2e/**/*.js', 'playwright.config.js'],
      extends: [js.configs.recommended],
      languageOptions: {
        ecmaVersion: 'latest',
        globals: globals.node,
      },
    }
  ),
])
