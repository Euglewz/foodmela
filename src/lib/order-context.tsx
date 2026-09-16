"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { RestaurantSlug } from "@/lib/cart-context";
import type { PaymentMethodId } from "@/lib/delivery";

export type OrderLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export type ActiveOrder = {
  restaurant: RestaurantSlug;
  restaurantName: string;
  lines: OrderLine[];
  total: number;
  sector: string;
  roadNumber: string;
  houseDetails: string;
  paymentMethod: PaymentMethodId;
  confirmedAt: string;
};

const STORAGE_KEY = "food-mela-active-order";

type OrderContextValue = {
  activeOrder: ActiveOrder | null;
  placeOrder: (order: ActiveOrder) => void;
  clearOrder: () => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time sync from localStorage (an external system) on mount.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveOrder(JSON.parse(raw));
      }
    } catch {
      // ignore malformed/unavailable storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    // Skip writing until hydration above has applied, so this doesn't clobber
    // storage with the pre-hydration null state.
    if (!hydrated) return;
    try {
      if (activeOrder) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(activeOrder));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore write failures (e.g. private browsing)
    }
  }, [activeOrder, hydrated]);

  const placeOrder = (order: ActiveOrder) => setActiveOrder(order);
  const clearOrder = () => setActiveOrder(null);

  return (
    <OrderContext.Provider value={{ activeOrder, placeOrder, clearOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrderContext() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrderContext must be used within OrderProvider");
  return ctx;
}
