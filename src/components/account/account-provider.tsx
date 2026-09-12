"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AccountModal } from "./account-modal";
import type { AccountModalView, ProtectedAccountArea } from "./account-types";
export type Customer = { id: number; firstName: string; lastName: string; email: string; phone: string | null };
export async function accountRequest(action: string, body: unknown) {
  const response = await fetch(`/api/account/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Unable to update your account.");
  return result as { user: Customer | null };
}
type AccountContextValue = {
  user: Customer | null;
  setUser: (user: Customer | null) => void;
  isAuthenticated: boolean;
  openAccount: (view?: AccountModalView, area?: ProtectedAccountArea) => void;
  requireAccount: (area: ProtectedAccountArea) => boolean;
};
const AccountContext = createContext<AccountContextValue | null>(null);
export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Customer | null>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<AccountModalView>("login");
  const [area, setArea] = useState<ProtectedAccountArea>("account");
  useEffect(() => {
    let active = true;
    const refresh = () => fetch("/api/account/session", { cache: "no-store" }).then((r) => r.json()).then((data) => { if (active) setUser(data.user ?? null); }).catch(() => { if (active) setUser(null); });
    void refresh(); window.addEventListener("focus", refresh);
    return () => { active = false; window.removeEventListener("focus", refresh); };
  }, []);
  const openAccount = (nextView: AccountModalView = "login", nextArea: ProtectedAccountArea = "account") => { setView(nextView); setArea(nextArea); setOpen(true); };
  return <AccountContext.Provider value={{ user, setUser, isAuthenticated: !!user, openAccount, requireAccount: (nextArea) => { if (user) return true; openAccount("login", nextArea); return false; } }}>
    {children}<AccountModal area={area} open={open} view={view} onClose={() => setOpen(false)} onViewChange={setView} />
  </AccountContext.Provider>;
}
export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) throw new Error("useAccount must be used inside AccountProvider.");
  return context;
}
