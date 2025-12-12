import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationState } from '@react-navigation/native';

import { STORAGE_KEYS } from '../constants';
import { Logger } from '../utils/logger';

/**
 * Version for navigation state schema
 * Increment this when navigation structure changes to invalidate old saved states
 */
const NAV_STATE_VERSION = 1;

interface VersionedNavState {
    version: number;
    state: NavigationState;
}

/**
 * Hook for persisting and restoring navigation state
 * Useful for crash recovery and app restore
 * 
 * Includes version control to prevent crashes when navigation structure changes
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
                    const parsed = JSON.parse(savedState) as VersionedNavState | NavigationState;

                    // Check if it's a versioned state
                    if ('version' in parsed && 'state' in parsed) {
                        if (parsed.version === NAV_STATE_VERSION) {
                            setInitialState(parsed.state);
                        } else {
                            // Version mismatch - discard old state to prevent crashes
                            Logger.info('Navigation', 'Discarding old navigation state (version mismatch)');
                            await AsyncStorage.removeItem(STORAGE_KEYS.NAVIGATION_STATE);
                        }
                    } else {
                        // Legacy unversioned state - discard it
                        Logger.info('Navigation', 'Discarding legacy unversioned navigation state');
                        await AsyncStorage.removeItem(STORAGE_KEYS.NAVIGATION_STATE);
                    }
                }
            } catch (error) {
                console.warn('[Navigation] Failed to load saved state:', error);
            } finally {
                setIsReady(true);
            }
        };

        loadState();
    }, []);

    // Save navigation state on change with version info
    const onStateChange = useCallback((state: NavigationState | undefined) => {
        if (state) {
            const versionedState: VersionedNavState = {
                version: NAV_STATE_VERSION,
                state,
            };
            AsyncStorage.setItem(
                STORAGE_KEYS.NAVIGATION_STATE,
                JSON.stringify(versionedState)
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
