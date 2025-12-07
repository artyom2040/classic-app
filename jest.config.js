module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
        '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|expo|@expo|expo-modules-core)/)',
    ],
    moduleNameMapper: {
        // Mock any problematic imports
        '^expo$': '<rootDir>/__mocks__/expo.js',
        '^expo-haptics$': '<rootDir>/__mocks__/expo-haptics.js',
    },
    collectCoverageFrom: [
        'src/utils/**/*.{ts,tsx}',
        'src/services/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
    ],
};
