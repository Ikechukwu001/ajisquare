"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";

const STORAGE_KEY = "fashion-house-cart";
const DEFAULT_MAX = 99;

const CartContext = createContext(null);

// One cart line = same product + same size + same color
function makeLineId(item) {
  return [item.productId, item.size || "", item.color || ""].join("|");
}

// Stock is per product, so the limit applies across all sizes/colors of that product
function otherLinesTotal(items, productId, lineId) {
  return items
    .filter((i) => i.productId === productId && i.lineId !== lineId)
    .reduce((sum, i) => sum + i.quantity, 0);
}

export function maxQuantityFor(items, line) {
  return Math.max(1, (line.maxStock ?? DEFAULT_MAX) - otherLinesTotal(items, line.productId, line.lineId));
}

// Minimum order quantity for a line (older saved carts without it default to 1)
export function minQuantityFor(line) {
  return Math.max(1, line.minQty || 1);
}

function isValidItem(i) {
  return (
    i &&
    typeof i.lineId === "string" &&
    typeof i.productId === "string" &&
    typeof i.name === "string" &&
    Number.isFinite(i.price) &&
    Number.isInteger(i.quantity) &&
    i.quantity >= 1
  );
}

function cartReducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return action.items.filter(isValidItem);

    case "ADD": {
      const lineId = makeLineId(action.item);
      const max = action.item.maxStock ?? DEFAULT_MAX;
      const minQty = Math.max(1, action.item.minQty || 1);
      const requested = action.item.quantity || 1;
      const allowed = max - otherLinesTotal(state, action.item.productId, lineId);
      const existing = state.find((i) => i.lineId === lineId);

      if (existing) {
        if (allowed < 1) return state;
        return state.map((i) =>
          i.lineId === lineId
            ? {
                ...i,
                price: action.item.price,
                priceUsd: action.item.priceUsd ?? null,
                maxStock: max,
                minQty,
                preorder: Boolean(action.item.preorder),
                quantity: Math.min(i.quantity + requested, allowed),
              }
            : i
        );
      }

      // A new line must meet the minimum order quantity
      if (allowed < minQty) return state;
      return [
        ...state,
        {
          ...action.item,
          lineId,
          maxStock: max,
          minQty,
          quantity: Math.min(Math.max(requested, minQty), allowed),
        },
      ];
    }

    case "SET_QTY": {
      const line = state.find((i) => i.lineId === action.lineId);
      if (!line) return state;
      const minQty = minQuantityFor(line);
      const allowed = maxQuantityFor(state, line);
      const next = Math.max(minQty, Math.min(Math.floor(action.quantity) || minQty, allowed));
      return state.map((i) => (i.lineId === action.lineId ? { ...i, quantity: next } : i));
    }

    case "REMOVE":
      return state.filter((i) => i.lineId !== action.lineId);

    case "CLEAR":
      return [];

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [hydrated, setHydrated] = useState(false);

  // Load saved cart once in the browser
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) dispatch({ type: "HYDRATE", items: saved });
    } catch {
      // ignore corrupted data
    }
    setHydrated(true);
  }, []);

  // Save cart whenever it changes (after the first load)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full or blocked, cart still works for this session
    }
  }, [items, hydrated]);

  const addItem = useCallback((item) => dispatch({ type: "ADD", item }), []);
  const updateQuantity = useCallback((lineId, quantity) => dispatch({ type: "SET_QTY", lineId, quantity }), []);
  const removeItem = useCallback((lineId) => dispatch({ type: "REMOVE", lineId }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    // Display only. The server always recalculates real prices from the database.
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return { items, hydrated, itemCount, subtotal, addItem, updateQuantity, removeItem, clearCart };
  }, [items, hydrated, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}