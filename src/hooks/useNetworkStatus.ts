import { useState, useEffect, useCallback } from 'react';
import * as Network from 'expo-network';

export interface NetworkStatus {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: Network.NetworkStateType | null;
  isWifi: boolean;
  isCellular: boolean;
}

export interface UseNetworkStatusResult {
  /** Current network status */
  status: NetworkStatus;
  /** Whether the device is definitely offline */
  isOffline: boolean;
  /** Whether the device is definitely online */
  isOnline: boolean;
  /** Whether the network status is still being determined */
  isLoading: boolean;
  /** Manually refresh network status */
  refresh: () => Promise<void>;
}

/**
 * Hook for monitoring network connectivity status.
 * Uses native event listeners for efficient real-time updates (no polling).
 * 
 * @example
 * ```tsx
 * const { isOffline, isOnline } = useNetworkStatus();
 * 
 * if (isOffline) {
 *   return <OfflineBanner />;
 * }
 * ```
 */
export function useNetworkStatus(): UseNetworkStatusResult {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: null,
    isInternetReachable: null,
    type: null,
    isWifi: false,
    isCellular: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const updateStatus = useCallback((state: Network.NetworkState) => {
    setStatus({
      isConnected: state.isConnected ?? null,
      isInternetReachable: state.isInternetReachable ?? null,
      type: state.type ?? null,
      isWifi: state.type === Network.NetworkStateType.WIFI,
      isCellular: state.type === Network.NetworkStateType.CELLULAR,
    });
    setIsLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const state = await Network.getNetworkStateAsync();
      updateStatus(state);
    } catch (error) {
      console.warn('Failed to fetch network status:', error);
      setIsLoading(false);
    }
  }, [updateStatus]);

  useEffect(() => {
    // Get initial state
    Network.getNetworkStateAsync().then(updateStatus);

    // Subscribe to network state changes (efficient, battery-friendly)
    const subscription = Network.addNetworkStateListener(updateStatus);

    return () => {
      subscription.remove();
    };
  }, [updateStatus]);

  // Derive convenience booleans
  const isOffline = status.isConnected === false || status.isInternetReachable === false;
  const isOnline = status.isConnected === true && status.isInternetReachable !== false;

  return {
    status,
    isOffline,
    isOnline,
    isLoading,
    refresh,
  };
}
