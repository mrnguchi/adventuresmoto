"use client";
import { useState } from "react";
import { accountRequest, useAccount } from "./account-provider";
export function ProfileForm() {
  const { user, setUser } = useAccount();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  if (!user) return null;
  return <><form className="auth-form" onSubmit={async (event) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); setBusy(true); setNotice("");
    try { const result = await accountRequest("profile", Object.fromEntries(data)); setUser(result.user); setNotice("Your details have been saved."); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Unable to save."); } finally { setBusy(false); }
  }}>
    <div className="auth-name-fields"><div className="auth-field"><label htmlFor="profile-first">First name</label><input id="profile-first" name="firstName" defaultValue={user.firstName} required maxLength={100} autoComplete="given-name" /></div><div className="auth-field"><label htmlFor="profile-last">Last name</label><input id="profile-last" name="lastName" defaultValue={user.lastName} required maxLength={100} autoComplete="family-name" /></div></div>
    <div className="auth-field"><label htmlFor="profile-email">Email address</label><input id="profile-email" value={user.email} readOnly /></div>
    <div className="auth-field"><label htmlFor="profile-phone">Phone (optional)</label><input id="profile-phone" name="phone" type="tel" defaultValue={user.phone ?? ""} maxLength={50} autoComplete="tel" /></div>
    {notice && <p role="status">{notice}</p>}<button className="auth-submit" disabled={busy}>{busy ? "Saving…" : "Save details"}</button>
  </form><div className="auth-login-links"><button disabled={busy} type="button" onClick={async () => { setBusy(true); try { await accountRequest("logout", {}); setUser(null); } catch { setNotice("Unable to log out. Please try again."); } finally { setBusy(false); } }}>Log out</button></div></>;
}
