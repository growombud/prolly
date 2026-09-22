"use strict";

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: ['coverage/', 'example/'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2015,
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: globals.mocha,
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^should$' }],
    },
  },
];
