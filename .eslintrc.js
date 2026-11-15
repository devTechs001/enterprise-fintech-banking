// Repository-root ESLint config. This is the React/JSX ruleset; it is what the
// client workspace lints against. The server workspace overrides it with its own
// server/.eslintrc.cjs because React rules do not belong in Node code.
module.exports = {
  // Build output and generated reports are not source. Linting dist/ alone produced
  // 375 errors against minified bundle code (no-func-assign, no-cond-assign, ...).
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    'client/dist/',
    'docs/security-review.html',
  ],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', 'jsx-a11y', 'import'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    // autoFocus is deliberate here: it moves focus into a freshly opened dialog or
    // search field. Kept as a warning so new uses stay visible in review without
    // failing the build over an intentional pattern.
    'jsx-a11y/no-autofocus': 'warn',
    // These three come from eslint-plugin-react-hooks v7 and encode what the React
    // Compiler requires. This app builds with React 18 and no compiler in the
    // pipeline, so they are advisory: warnings rather than off, so the patterns stay
    // on the record for a future compiler migration.
    'react-hooks/set-state-in-effect': 'warn',
    'react-hooks/immutability': 'warn',
    'react-hooks/purity': 'warn',
    'react/prop-types': 'warn',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
      },
    },
  },
};
