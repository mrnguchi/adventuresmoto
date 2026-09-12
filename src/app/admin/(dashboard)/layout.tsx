import { requireAdmin } from "@/lib/admin/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
export default async function Layout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <div className="admin-shell"><AdminSidebar name={admin.name} email={admin.email} /><div className="admin-workspace"><header className="admin-topbar"><span>Workspace <b>/ Adventures Moto</b></span><span className="admin-live-dot">Store administration</span></header><main className="admin-main">{children}</main><footer className="admin-footer">Adventures Moto <span>Built for the ride ahead.</span></footer></div></div>;
}
