import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

// Define common globals manually to avoid dependency issues
const jestGlobals = {
    jest: 'readonly',
    describe: 'readonly',
    test: 'readonly',
    it: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
};

const nodeGlobals = {
    module: 'readonly',
    require: 'readonly',
    process: 'readonly',
    console: 'readonly',
    __dirname: 'readonly',
    exports: 'writable',
};

const reactNativeGlobals = {
    console: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    // Add other common RN globals if necessary
};

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: [
            'node_modules/',
            '.expo/',
            'dist/',
            'build/',
            'web-build/',
            'coverage/',
            'supabase/functions/',
        ],
    },
    // Base config for App Source (TS/TSX)
    {
        files: ['src/**/*.{ts,tsx}', 'App.tsx'],
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...reactNativeGlobals,
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            // TypeScript rules
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],
            '@typescript-eslint/no-require-imports': 'off',

            // React hooks - critical for preventing bugs
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // React
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',

            // Code quality
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-case-declarations': 'off',
            'prefer-const': 'error',
            'no-var': 'error',
        },
    },
    // Config for Test files & Mocks
    {
        files: ['**/__tests__/**/*.{ts,tsx,js}', '**/__mocks__/**/*.js', 'jest.setup.js', '*.test.{ts,tsx,js}'],
        languageOptions: {
            globals: {
                ...jestGlobals,
                ...nodeGlobals, // Mocks often use module.exports
                ...reactNativeGlobals,
            },
        },
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            'no-undef': 'off', // TypeScript/Environment handles this
            '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests
            'no-console': 'off',
        },
    },
    // Config for Logger utility (allows console.log as it's the implementation)
    {
        files: ['src/utils/logger.ts', 'src/utils/storageUtils.ts'],
        rules: {
            'no-console': 'off',
        },
    },
    // Config for Config files & Scripts
    {
        files: ['scripts/**/*', '*.config.js', '*.config.mjs', 'metro.config.js', 'babel.config.js'],
        languageOptions: {
            globals: {
                ...nodeGlobals,
            },
        },
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            'no-console': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    }
);