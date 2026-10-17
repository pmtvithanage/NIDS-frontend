import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'error',
    },
  },
  {
    files: ['vite.config.js', 'eslint.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // api/*.js keep the real Axios call commented out above the active dummy
    // call (AGENTS.md), so the `http` import is intentionally unused until the
    // backend is wired up.
    files: ['src/api/**/*.js'],
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^http$|^_' }] },
  },
  {
    // Router config exports lazy page components alongside the route table.
    files: ['src/routes.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // TanStack Virtual's useVirtualizer() trips the React Compiler heuristic;
    // the virtualizer is only read during render and is safe here.
    files: ['src/components/alerts/AlertsTable.jsx'],
    rules: { 'react-hooks/incompatible-library': 'off' },
  },
]
