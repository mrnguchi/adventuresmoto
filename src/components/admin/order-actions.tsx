"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function OrderActions({ id, status, updatedAt }: { id: number; status: string; updatedAt: string }) {
  const router = useRouter(); const [busy,setBusy]=useState(false),[notice,setNotice]=useState("");
  async function submit(action: string, nextStatus?: string) {
    setBusy(true); setNotice("");
    try { const response=await fetch("/api/admin/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,action,status:nextStatus,updatedAt})}); const data=await response.json(); if(!response.ok) throw new Error(data.error); setNotice(data.message || "Saved."); router.refresh(); }
    catch(error){setNotice(error instanceof Error ? error.message : "Unable to save.");} finally {setBusy(false);}
  }
  return <div className="admin-form-panel"><form onSubmit={(event)=>{event.preventDefault(); const data=new FormData(event.currentTarget); void submit("status",String(data.get("status")));}}><label>Order status<select name="status" defaultValue={status} disabled={busy}><option value="PENDING">Pending confirmation</option><option value="CONFIRMED">Awaiting payment</option><option value="PROCESSING">Paid — confirmed manually</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></label><p className="admin-muted">Only mark paid after verifying payment outside this website. Status changes do not adjust stock or send payment instructions.</p><button className="admin-button" disabled={busy}>Update status</button></form><button type="button" className="admin-button secondary" disabled={busy} onClick={()=>void submit("email")}>Retry pending emails</button>{notice && <p role="status">{notice}</p>}</div>;
}
