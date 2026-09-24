"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./controls";

const links = [ ["/admin/orders", "", "Orders"], ["/admin", "◈", "Overview"], ["/admin/products", "▦", "Products"], ["/admin/categories", "▤", "Categories"], ["/admin/inventory", "▥", "Inventory"], ["/admin/activity", "↺", "Activity log"] ];
export function AdminSidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  return <aside className="admin-sidebar"><Link href="/admin" className="admin-wordmark">ADVENTURES<span>MOTO<span className="admin-wordmark-dot">.</span></span></Link><span className="admin-workspace-label">STORE MANAGEMENT</span><nav aria-label="Administration">{links.map(([href, icon, label]) => <Link key={href} href={href} className={(href === "/admin" ? pathname === href : pathname.startsWith(href)) ? "active" : ""} aria-current={(href === "/admin" ? pathname === href : pathname.startsWith(href)) ? "page" : undefined}><span aria-hidden="true">{icon}</span>{label}</Link>)}</nav><Link className="admin-store-link" href="/store">Visit storefront ↗</Link><div className="admin-profile"><span className="admin-avatar">{name.charAt(0)}</span><div><strong>{name}</strong><small>{email}</small></div></div><LogoutButton /></aside>;
}
