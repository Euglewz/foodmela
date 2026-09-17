"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type RestaurantSlug = "food-mela" | "anjum-kabab-ghor";

type CartState = Record<RestaurantSlug, Record<string, number>>;

const EMPTY_STATE: CartState = {
  "food-mela": {},
  "anjum-kabab-ghor": {},
};

const STORAGE_KEY = "food-mela-carts";

type CartContextValue = {
  qtyOf: (restaurant: RestaurantSlug, itemId: string) => number;
  increment: (restaurant: RestaurantSlug, itemId: string) => void;
  decrement: (restaurant: RestaurantSlug, itemId: string) => void;
  setQty: (restaurant: RestaurantSlug, itemId: string, qty: number) => void;
  cartOf: (restaurant: RestaurantSlug) => Record<string, number>;
  clearCart: (restaurant: RestaurantSlug) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [carts, setCarts] = useState<CartState>(EMPTY_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time sync from localStorage (an external system) on mount.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCarts({ ...EMPTY_STATE, ...JSON.parse(raw) });
      }
    } catch {
      // ignore malformed/unavailable storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    // Skip writing until hydration above has applied, so this doesn't clobber
    // storage with the pre-hydration EMPTY_STATE.
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(carts));
    } catch {
      // ignore write failures (e.g. private browsing)
    }
  }, [carts, hydrated]);

  const increment = (restaurant: RestaurantSlug, itemId: string) =>
    setCarts((prev) => ({
      ...prev,
      [restaurant]: {
        ...prev[restaurant],
        [itemId]: (prev[restaurant]?.[itemId] ?? 0) + 1,
      },
    }));

  const decrement = (restaurant: RestaurantSlug, itemId: string) =>
    setCarts((prev) => {
      const next = (prev[restaurant]?.[itemId] ?? 0) - 1;
      const restaurantCart = { ...prev[restaurant] };
      if (next <= 0) {
        delete restaurantCart[itemId];
      } else {
        restaurantCart[itemId] = next;
      }
      return { ...prev, [restaurant]: restaurantCart };
    });

  const setQty = (restaurant: RestaurantSlug, itemId: string, qty: number) =>
    setCarts((prev) => {
      const restaurantCart = { ...prev[restaurant] };
      if (qty <= 0) delete restaurantCart[itemId];
      else restaurantCart[itemId] = qty;
      return { ...prev, [restaurant]: restaurantCart };
    });

  const qtyOf = (restaurant: RestaurantSlug, itemId: string) =>
    carts[restaurant]?.[itemId] ?? 0;

  const cartOf = (restaurant: RestaurantSlug) => carts[restaurant] ?? {};

  const clearCart = (restaurant: RestaurantSlug) =>
    setCarts((prev) => ({ ...prev, [restaurant]: {} }));

  return (
    <CartContext.Provider
      value={{ qtyOf, increment, decrement, setQty, cartOf, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext must be used within CartProvider");
  return ctx;
}
