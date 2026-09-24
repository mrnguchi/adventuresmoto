"use client";
import { useState } from "react";
export function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  if (sent) return <div className="contact-success" role="status"><h3>Thank you for getting in touch</h3><p>Your request has been sent to our team. We’ll reply to the email address you provided.</p><button type="button" onClick={() => setSent(false)}>Send another request</button></div>;
  return <form onSubmit={async (event) => {
    event.preventDefault(); if (busy) return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send your request.");
      setSent(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to send. Please try again or email us directly."); }
    finally { setBusy(false); }
  }}>
    <div className="contact-field-pair"><label>Your name<input name="name" required maxLength={100} autoComplete="name" /></label><label>Email address<input name="email" type="email" required maxLength={191} autoComplete="email" /></label></div>
    <div className="contact-field-pair"><label>Phone (optional)<input name="phone" type="tel" maxLength={50} autoComplete="tel" /></label><label>What can we help with?<select name="topic" required><option value="">Select a topic</option>{["Product advice", "Bike compatibility", "Order enquiry", "Delivery and returns", "Other"].map((topic) => <option key={topic}>{topic}</option>)}</select></label></div>
    <label>Order reference (optional)<input name="reference" maxLength={100} /></label>
    <label>Your message<textarea name="message" required minLength={10} maxLength={5000} rows={7} placeholder="For bike compatibility questions, include the make, model and year." /></label>
    <div className="contact-trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <p className="contact-note">We’ll use these details to respond to your request. Please don’t include passwords or payment card details.</p>
    {error && <p role="alert" className="contact-error">{error}</p>}
    <button className="contact-submit" disabled={busy} type="submit">{busy ? "Sending…" : "Send request"}</button>
  </form>;
}
