import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/controls";
export default async function Page() {
  if (await getAdmin()) redirect("/admin");
  return <main className="admin-login"><section className="admin-login-aside"><Link href="/" className="admin-wordmark">ADVENTURES<span>MOTO.</span></Link><div><p>BEHIND EVERY GREAT RIDE</p><h1>A store ready<br />for adventure.</h1><span>Manage your gear. Keep your catalogue moving.</span></div><small>ADVENTURES MOTO / STORE MANAGEMENT</small></section><section className="admin-login-content"><div><span className="admin-eyebrow">YOUR STORE, AT A GLANCE</span><h2>Welcome back.</h2><p>Sign in with your administrator account.</p><LoginForm /><Link href="/">← Back to the storefront</Link></div></section></main>;
}
