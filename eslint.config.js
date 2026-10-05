const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    {
        files: ['**/*.js'],

        ignores: [
            'node_modules/**',
            'coverage/**',
        ],

        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',

            globals: {
                ...globals.node,
                fetch: 'readonly',
            },
        },

        rules: {
            ...js.configs.recommended.rules,

            'no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
            }],

            'no-console': 'warn',
        },
    },

    // Jest globals
    {
        files: [
            'tests/**/*.js',
            '**/*.test.js',
            '**/*.spec.js',
        ],

        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
    },

    // CLI / manual testing scripts
    {
        files: [
            'migrate.js',
            'src/testwebhooksignature.js',
            'test-production-webhook.js',
        ],

        rules: {
            'no-console': 'off',
        },
    },
];