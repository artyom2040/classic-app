// Jest setup file for react-native testing

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo modules
jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    notificationAsync: jest.fn(),
    selectionAsync: jest.fn(),
    ImpactFeedbackStyle: {
        Light: 'light',
        Medium: 'medium',
        Heavy: 'heavy',
    },
    NotificationFeedbackType: {
        Success: 'success',
        Warning: 'warning',
        Error: 'error',
    },
}));

jest.mock('expo-linking', () => ({
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('expo-network', () => ({
    getNetworkStateAsync: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Silence console warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
    if (
        typeof args[0] === 'string' &&
        args[0].includes('Animated: `useNativeDriver`')
    ) {
        return;
    }
    originalWarn.apply(console, args);
};
