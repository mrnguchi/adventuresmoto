"use client";
import { usePathname } from "next/navigation";
import { SiteFooter } from "./site-footer";
export function StorefrontFooter() {
  const pathname = usePathname();
  return pathname === "/admin" || pathname.startsWith("/admin/") ? null : <SiteFooter />;
}
