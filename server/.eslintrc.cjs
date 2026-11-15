// ESLint config for the API workspace.
//
// `root: true` stops the cascade from the repository-root config, which enables the
// React, react-hooks and jsx-a11y plugins. Those rules are wrong for Node code: they
// flagged a cache helper named `useFallback` in src/config/redis.config.js as a
// React Hook called outside a component. This workspace is plain ESM server code.
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: ['node_modules/', 'coverage/', 'dist/'],
};
