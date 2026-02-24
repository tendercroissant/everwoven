/**
 * SubscriptionContext — single source of truth for premium status.
 *
 * Currently a mock implementation. To integrate a real payments SDK
 * (e.g. RevenueCat, Superwall, expo-in-app-purchases), update only this
 * file — no other screens need to change.
 *
 * Usage:
 *   const { isPremium, subscribe, restorePurchases } = useSubscription();
 */

import React, { createContext, useCallback, useContext, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubscriptionContextValue {
  /** Whether the user has an active premium subscription. */
  isPremium: boolean;
  /**
   * Trigger a subscription purchase flow.
   * Returns true if the purchase was successful.
   */
  subscribe: (plan: 'monthly' | 'yearly') => Promise<boolean>;
  /**
   * Attempt to restore previous purchases.
   * Returns true if an active subscription was found.
   */
  restorePurchases: () => Promise<boolean>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  // TODO: Replace with real persisted state (e.g. from AsyncStorage or RevenueCat)
  const [isPremium, setIsPremium] = useState(false);

  const subscribe = useCallback(async (_plan: 'monthly' | 'yearly'): Promise<boolean> => {
    // TODO: Replace with real StoreKit / Play Billing purchase call
    // e.g. await Purchases.purchasePackage(pkg);
    setIsPremium(true);
    return true;
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    // TODO: Replace with real restore call
    // e.g. const customerInfo = await Purchases.restorePurchases();
    setIsPremium(true);
    return true;
  }, []);

  return (
    <SubscriptionContext.Provider value={{ isPremium, subscribe, restorePurchases }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error('useSubscription must be used within a <SubscriptionProvider>');
  }
  return ctx;
}
