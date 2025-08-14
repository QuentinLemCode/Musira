// Root flat ESLint config for the monorepo
// - Backend (NestJS): mirrors packages/backend/.eslintrc.js
// - Frontend (Angular): applies angular-eslint recommended rules (TS + templates)
// - API (library): TypeScript recommended + stylistic rules

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({
  baseDirectory: new URL('.', import.meta.url).pathname,
});

export default [
  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.angular/**',
      'playwright-report/**',
      'test-results/**',
      '**/*.d.ts',
      'eslint.config.*',
      '.lintstagedrc.js',
      'packages/backend/.eslintrc.js',
      'packages/frontend/karma.conf.js',
      'packages/frontend/src/generated/**',
    ],
  },

  // Base JS recommendations for any JS files in the repo
  js.configs.recommended,

  // ------------------------------
  // Backend (NestJS)
  // ------------------------------
  // Use typescript-eslint recommended (non type-checked) like the legacy config
  ...tseslint.configs.recommended.map((cfg) => ({
    ...cfg,
    files: ['packages/backend/**/*.ts'],
    languageOptions: {
      ...(cfg.languageOptions ?? {}),
      parserOptions: {
        ...(cfg.languageOptions?.parserOptions ?? {}),
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  })),
  // Match legacy rule customizations from packages/backend/.eslintrc.js
  {
    files: ['packages/backend/**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  // Disable stylistic rules that conflict with Prettier
  eslintConfigPrettier,

  // ------------------------------
  // Frontend (Angular)
  // ------------------------------
  // Also include TS core ruleset to avoid missing-rule errors in specs
  ...tseslint.configs.recommended.map((cfg) => ({
    ...cfg,
    files: ['packages/frontend/**/*.ts'],
  })),
  // Apply angular-eslint recommended (TS rules)
  ...compat
    .extends('plugin:@angular-eslint/recommended')
    .map((cfg) => ({ ...cfg, files: ['packages/frontend/**/*.ts'] })),
  // Apply angular-eslint template recommended (HTML templates)
  ...compat
    .extends('plugin:@angular-eslint/template/recommended')
    .map((cfg) => ({ ...cfg, files: ['packages/frontend/**/*.html'] })),
  // Ensure parserOptions point to the frontend tsconfig
  {
    files: ['packages/frontend/**/*.{ts,html}'],
    languageOptions: {
      parserOptions: {
        // keep non type-aware for speed/compat
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        fetch: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@angular-eslint/prefer-inject': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'off',
    },
  },
  {
    files: ['packages/frontend/**/*.spec.ts'],
    languageOptions: {
      globals: {
        ...globals.jasmine,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // ------------------------------
  // API (TypeScript library) - closest equivalent to "tslint recommended + stylistic"
  // ------------------------------
  ...tseslint.configs.recommended.map((cfg) => ({
    ...cfg,
    files: ['packages/api/**/*.ts'],
    languageOptions: {
      ...(cfg.languageOptions ?? {}),
      parserOptions: {
        ...(cfg.languageOptions?.parserOptions ?? {}),
      },
    },
    plugins: {
      ...(cfg.plugins ?? {}),
      '@typescript-eslint': tseslint.plugin,
    },
  })),
  // Add stylistic rules (kept gentle to avoid CI failures)
  {
    files: ['packages/api/**/*.ts'],
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      // Use stylistic recommended set as a baseline
      ...((stylistic.configs &&
        stylistic.configs['recommended'] &&
        stylistic.configs['recommended'].rules) ||
        {}),
    },
  },
];
