"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export async function adminRequest(path: string, body: unknown) {
  const response = await fetch(`/api/admin/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Request failed.");
  return result;
}

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <><button className="admin-signout" disabled={busy} onClick={async () => {
    setBusy(true); setError("");
    try { await adminRequest("logout", {}); router.replace("/admin/login"); router.refresh(); }
    catch { setError("Sign out failed. Please try again."); } finally { setBusy(false); }
  }}>{busy ? "Signing out…" : "Sign out ↗"}</button>{error && <p role="alert">{error}</p>}</>;
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return <form className="admin-login-form" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    const fields = new FormData(event.currentTarget);
    try { await adminRequest("login", { email: fields.get("email"), password: fields.get("password") }); router.replace("/admin"); router.refresh(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to sign in."); } finally { setBusy(false); }
  }}>
    <label>Email address<input type="email" name="email" autoComplete="username" required placeholder="you@example.com" /></label>
    <label>Password<input type="password" name="password" autoComplete="current-password" maxLength={128} required placeholder="Enter your password" /></label>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <button className="admin-button" disabled={busy}>{busy ? "Signing in…" : "Sign in to dashboard →"}</button>
  </form>;
}

export function ArchiveButton({ id, version }: { id: number; version: number }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return <><button className="admin-button secondary" disabled={busy} onClick={async () => {
    if (!confirm("Archive this product? It will be removed from the storefront. Its records will be preserved.")) return;
    setBusy(true); setError("");
    try { await adminRequest("products/archive", { id, version }); router.push("/admin/products"); router.refresh(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to archive."); } finally { setBusy(false); }
  }}>Archive product</button>{error && <p className="admin-error" role="alert">{error}</p>}</>;
}

export function TaxonomyForm({ kind, categories = [] }: { kind: "categories" | "brands"; categories?: { id: number; name: string }[] }) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  return <form className="admin-taxonomy-form" onSubmit={async (event) => {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); setBusy(true); setNotice("");
    try { await adminRequest(kind, { name: data.get("name"), slug: data.get("slug"), parentId: data.get("parentId") }); form.reset(); setNotice("Created successfully."); router.refresh(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Unable to save."); } finally { setBusy(false); }
  }}><label>Name<input name="name" maxLength={191} required placeholder={kind === "brands" ? "e.g. Klim" : "e.g. Men's Jackets"} /></label><label>URL slug<input name="slug" maxLength={191} pattern="[a-z0-9]+(-[a-z0-9]+)*" required placeholder={kind === "brands" ? "klim" : "mens-jackets"} /></label>{kind === "categories" && <label>Parent category<select name="parentId"><option value="">No parent</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>}<button className="admin-button" disabled={busy}>{busy ? "Creating…" : `Create ${kind === "brands" ? "brand" : "category"}`}</button><p role="status">{notice}</p></form>;
}
