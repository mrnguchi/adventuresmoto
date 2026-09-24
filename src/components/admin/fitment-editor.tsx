"use client";
import { useState } from "react";
import type { ProductInput } from "@/lib/admin/product-input";

type Fitment = NonNullable<ProductInput["fitments"]>[number];
export function FitmentEditor({ value, onChange }: { value: Fitment[]; onChange: (value: Fitment[]) => void }) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  function add() {
    const first = Number(from), last = Number(to || from);
    if (!make.trim() || !model.trim() || !Number.isInteger(first) || !Number.isInteger(last) || first < 1900 || last < first || last > new Date().getFullYear() + 2 || last - first > 50) {
      setError("Enter a make, exact model and a valid year range (up to 51 years)."); return;
    }
    const next = [...value];
    for (let year = first; year <= last; year++) {
      const row = { make: make.trim().replace(/\s+/g, " "), model: model.trim().replace(/\s+/g, " "), year, note: note.trim() };
      if (!next.some((f) => f.make.toLowerCase() === row.make.toLowerCase() && f.model.toLowerCase() === row.model.toLowerCase() && f.year === year)) next.push(row);
    }
    if (next.length > 500) { setError("Use up to 500 fitments per product."); return; }
    onChange(next); setError(""); setFrom(""); setTo(""); setNote("");
  }
  return <section className="admin-panel admin-form-panel">
    <h2>Bike compatibility</h2>
    <p>Add only supplier-confirmed fitments that apply to every option of this product. Include model editions such as Adventure R in the model name. Leave empty for clothing or unconfirmed compatibility.</p>
    <div className="admin-field-pair"><label>Make<input value={make} maxLength={100} placeholder="e.g. Husqvarna" onChange={(e) => setMake(e.target.value)} /></label><label>Exact model<input value={model} maxLength={191} placeholder="e.g. 701 Enduro" onChange={(e) => setModel(e.target.value)} /></label></div>
    <div className="admin-field-pair"><label>From year<input type="number" value={from} onChange={(e) => setFrom(e.target.value)} /></label><label>To year (optional)<input type="number" value={to} onChange={(e) => setTo(e.target.value)} /></label></div>
    <label>Fitment note (optional)<input value={note} maxLength={500} placeholder="e.g. Requires mounting kit" onChange={(e) => setNote(e.target.value)} /></label>
    {error && <p role="alert" className="admin-error">{error}</p>}
    <button type="button" className="admin-button secondary" onClick={add}>Add compatible bike</button>
    <p>{value.length} confirmed model years</p>
    {value.map((f, index) => <div className="admin-variant" key={`${f.make}-${f.model}-${f.year}`}><strong>{f.make} {f.model} {f.year}</strong>{f.note && <p>{f.note}</p>}<button type="button" className="admin-text-button" aria-label={`Remove ${f.make} ${f.model} ${f.year}`} onClick={() => onChange(value.filter((_, i) => i !== index))}>Remove</button></div>)}
  </section>;
}
