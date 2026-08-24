"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { AccountModal } from "@/components/account/account-modal";
import type {
  AccountModalView,
  ProtectedAccountArea,
} from "@/components/account/account-types";

type AccountContextValue = {
  isAuthenticated: boolean;
  openAccount: (
    view?: AccountModalView,
    area?: ProtectedAccountArea,
  ) => void;
  requireAccount: (area: ProtectedAccountArea) => boolean;
};

type AccountProviderProps = {
  authenticated?: boolean;
  children: ReactNode;
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({
  authenticated = false,
  children,
}: AccountProviderProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<AccountModalView>("login");
  const [area, setArea] = useState<ProtectedAccountArea>("account");

  const contextValue = useMemo<AccountContextValue>(
    () => ({
      isAuthenticated: authenticated,
      openAccount: (nextView = "login", nextArea = "account") => {
        setView(nextView);
        setArea(nextArea);
        setOpen(true);
      },
      requireAccount: (nextArea) => {
        if (authenticated) {
          return true;
        }

        setView("login");
        setArea(nextArea);
        setOpen(true);
        return false;
      },
    }),
    [authenticated],
  );

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
      <AccountModal
        area={area}
        open={open}
        view={view}
        onClose={() => setOpen(false)}
        onViewChange={setView}
      />
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);

  if (!context) {
    throw new Error("useAccount must be used inside AccountProvider.");
  }

  return context;
}
