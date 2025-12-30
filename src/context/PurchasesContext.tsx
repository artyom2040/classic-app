/**
 * Purchases Context
 * Provides subscription state and actions across the app
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import {
    initializePurchases,
    getSubscriptionStatus,
    getSubscriptionPackages,
    purchasePackage,
    restorePurchases,
    identifyUser,
    logOutUser,
    SubscriptionPackage,
    SubscriptionStatus,
    PurchaseResult,
} from '../services/purchases';
import { useAuth } from './AuthContext';

interface PurchasesContextType {
    // State
    isPremium: boolean;
    isLoading: boolean;
    subscriptionStatus: SubscriptionStatus | null;
    packages: SubscriptionPackage[];

    // Actions
    purchase: (packageId: string) => Promise<PurchaseResult>;
    restore: () => Promise<PurchaseResult>;
    refreshStatus: () => Promise<void>;
}

const PurchasesContext = createContext<PurchasesContextType | null>(null);

interface PurchasesProviderProps {
    children: ReactNode;
}

export function PurchasesProvider({ children }: PurchasesProviderProps) {
    const { user } = useAuth();
    const [isPremium, setIsPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
    const [packages, setPackages] = useState<SubscriptionPackage[]>([]);

    // Initialize RevenueCat and fetch initial data
    useEffect(() => {
        async function init() {
            try {
                await initializePurchases(user?.id);
                await refreshStatus();
                const pkgs = await getSubscriptionPackages();
                setPackages(pkgs);
            } catch (error) {
                console.error('[PurchasesProvider] Initialization failed:', error);
            } finally {
                setIsLoading(false);
            }
        }
        init();
    }, []);

    // Update RevenueCat user when auth changes
    useEffect(() => {
        async function handleAuthChange() {
            if (user?.id) {
                await identifyUser(user.id);
            } else {
                await logOutUser();
            }
            await refreshStatus();
        }
        handleAuthChange();
    }, [user?.id]);

    const refreshStatus = useCallback(async () => {
        try {
            const status = await getSubscriptionStatus();
            setSubscriptionStatus(status);
            setIsPremium(status.isPremium);
        } catch (error) {
            console.error('[PurchasesProvider] Failed to refresh status:', error);
        }
    }, []);

    const purchase = useCallback(async (packageId: string): Promise<PurchaseResult> => {
        setIsLoading(true);
        try {
            const result = await purchasePackage(packageId);
            if (result.success && result.isPremium !== undefined) {
                setIsPremium(result.isPremium);
                await refreshStatus();
            }
            return result;
        } finally {
            setIsLoading(false);
        }
    }, [refreshStatus]);

    const restore = useCallback(async (): Promise<PurchaseResult> => {
        setIsLoading(true);
        try {
            const result = await restorePurchases();
            if (result.success && result.isPremium !== undefined) {
                setIsPremium(result.isPremium);
                await refreshStatus();
            }
            return result;
        } finally {
            setIsLoading(false);
        }
    }, [refreshStatus]);

    // Memoize provider value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        isPremium,
        isLoading,
        subscriptionStatus,
        packages,
        purchase,
        restore,
        refreshStatus,
    }), [isPremium, isLoading, subscriptionStatus, packages, purchase, restore, refreshStatus]);

    return (
        <PurchasesContext.Provider value={contextValue}>
            {children}
        </PurchasesContext.Provider>
    );
}

export function usePurchases(): PurchasesContextType {
    const context = useContext(PurchasesContext);
    if (!context) {
        throw new Error('usePurchases must be used within a PurchasesProvider');
    }
    return context;
}

/**
 * Hook to check if user has premium access
 * Returns false while loading
 */
export function useIsPremium(): boolean {
    const { isPremium } = usePurchases();
    return isPremium;
}
