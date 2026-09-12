"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartView } from "@/lib/cart";
const empty: CartView = { items: [], quote: "", version: 0, subtotal: 0, count: 0 };
const Context = createContext<{ cart: CartView; loading: boolean; error: string; refresh: () => Promise<void>; change: (action: string, sku: string, quantity?: number) => Promise<void> } | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState(empty), [loading, setLoading] = useState(true), [error, setError] = useState("");
  async function refresh() {
    try { const response = await fetch("/api/cart", { cache: "no-store" }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setCart(data); setError(""); } catch { setError("Unable to load your cart. Please retry."); } finally { setLoading(false); }
  }
  useEffect(() => {
    let active = true;
    const onFocus = () => { fetch("/api/cart", { cache: "no-store" }).then(async (response) => { if (!response.ok) throw new Error("Unavailable"); return response.json(); }).then((data) => { if (active) { setCart(data); setError(""); } }).catch(() => { if (active) setError("Unable to load your cart. Please retry."); }).finally(() => { if (active) setLoading(false); }); };
    onFocus(); window.addEventListener("focus", onFocus);
    return () => { active = false; window.removeEventListener("focus", onFocus); };
  }, []);
  async function change(action: string, sku: string, quantity?: number) {
    const response = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, sku, quantity, version: cart.version }) });
    const data = await response.json();
    if (!response.ok) { await refresh(); throw new Error(data.error ?? "Unable to update cart."); }
    setCart(data); setError("");
  }
  return <Context.Provider value={{ cart, loading, error, refresh, change }}>{children}</Context.Provider>;
}
export function useCart() { const value = useContext(Context); if (!value) throw new Error("CartProvider missing"); return value; }
