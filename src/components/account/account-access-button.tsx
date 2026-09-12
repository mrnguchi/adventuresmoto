"use client";

import type { ReactNode } from "react";

import { useAccount } from "@/components/account/account-provider";
import type { ProtectedAccountArea } from "@/components/account/account-types";

type AccountAccessButtonProps = {
  area?: ProtectedAccountArea;
  children: ReactNode;
  className?: string;
};

export function AccountAccessButton({
  area = "account",
  children,
  className,
}: AccountAccessButtonProps) {
  const { requireAccount, openAccount } = useAccount();

  return (
    <button
      className={className}
      type="button"
      onClick={() => area === "account" ? openAccount() : requireAccount(area)}
    >
      {children}
    </button>
  );
}
