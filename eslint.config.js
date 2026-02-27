const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    files: ['src/**/*.js'],
    rules: {
      // Catch common bugs
      'no-unused-vars': 'error',
      'no-undef': 'error',
      eqeqeq: 'error',

      // Disallow console.log in production code (warn only)
      'no-console': 'warn',
    },
  },
  // Disable any ESLint rules that would conflict with Prettier formatting
  prettierConfig,
];
