import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
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
            'no-case-declarations': 'off', // Allow const in case blocks
            'prefer-const': 'error',
            'no-var': 'error',
        },
    },
    {
        ignores: [
            'node_modules/',
            '.expo/',
            'dist/',
            'build/',
            '*.config.js',
            '*.config.mjs',
            'babel.config.js',
            'metro.config.js',
            'scripts/',
        ],
    }
);
