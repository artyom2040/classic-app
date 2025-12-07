import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationState } from '@react-navigation/native';

import { STORAGE_KEYS } from '../constants';

/**
 * Hook for persisting and restoring navigation state
 * Useful for crash recovery and app restore
 */
export function useNavigationPersistence() {
    const [isReady, setIsReady] = useState(false);
    const [initialState, setInitialState] = useState<NavigationState | undefined>();

    // Load saved navigation state on mount
    useEffect(() => {
        const loadState = async () => {
            try {
                const savedState = await AsyncStorage.getItem(STORAGE_KEYS.NAVIGATION_STATE);
                if (savedState) {
                    setInitialState(JSON.parse(savedState));
                }
            } catch (error) {
                console.warn('[Navigation] Failed to load saved state:', error);
            } finally {
                setIsReady(true);
            }
        };

        loadState();
    }, []);

    // Save navigation state on change
    const onStateChange = useCallback((state: NavigationState | undefined) => {
        if (state) {
            AsyncStorage.setItem(
                STORAGE_KEYS.NAVIGATION_STATE,
                JSON.stringify(state)
            ).catch((error) => {
                console.warn('[Navigation] Failed to save state:', error);
            });
        }
    }, []);

    // Clear saved navigation state (useful after logout)
    const clearNavigationState = useCallback(async () => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.NAVIGATION_STATE);
        } catch (error) {
            console.warn('[Navigation] Failed to clear state:', error);
        }
    }, []);

    return {
        isReady,
        initialState,
        onStateChange,
        clearNavigationState,
    };
}

export default useNavigationPersistence;
