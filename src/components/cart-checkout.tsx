"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "./cart-provider";
import { useAccount } from "./account/account-provider";
const money = (cents: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(cents / 100);
export function CartCheckout({ checkout = false }: { checkout?: boolean }) {
  const { cart, loading, error, refresh, change } = useCart();
  const { user, openAccount } = useAccount();
  const [busy, setBusy] = useState(false), [notice, setNotice] = useState("");
  const [receipt, setReceipt] = useState<{ number: string; email: string } | null>(null);
  async function update(action: string, sku: string, quantity?: number) {
    setBusy(true); setNotice(""); try { await change(action, sku, quantity); } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to update cart."); } finally { setBusy(false); }
  }
  if (receipt) return <div className="checkout-receipt"><h1>Order request received</h1><p>Your reference is <strong>{receipt.number}</strong>.</p><p>We will contact you at <strong>{receipt.email}</strong> to confirm availability, delivery and payment arrangements.</p><p>No payment has been taken. Please keep your reference number.</p><Link className="checkout-button" href="/store">Continue shopping</Link></div>;
  return <div className="checkout-page"><nav className="checkout-breadcrumb" aria-label="Breadcrumb"><Link href="/store">Store</Link><span>/</span>{checkout ? <><Link href="/cart">Cart</Link><span>/</span><span>Checkout</span></> : <span>Cart</span>}</nav>
    <header><h1>{checkout ? "Checkout" : "Your cart"}</h1><p>{checkout ? "Review your items and send an order request. No payment is taken online." : `${cart.count} ${cart.count === 1 ? "item" : "items"}`}</p></header>
    {loading ? <p role="status">Loading your cart…</p> : error ? <div role="alert"><p>{error}</p><button onClick={() => void refresh()}>Retry</button></div> : !cart.items.length ? <section className="checkout-empty"><h2>Your cart is empty</h2><p>Browse the store and add the items you need.</p><Link className="checkout-button" href="/store">Browse products</Link></section> : <>
      {notice && <p className="checkout-error" role="alert">{notice}</p>}
      <div className="checkout-layout"><div>
        {!checkout ? <div className="cart-items">{cart.items.map((item) => <article className="cart-row" key={item.id}>
          <Link href={`/products/${item.slug}`} className="cart-photo">{item.image ? <Image src={item.image} alt={item.name} width={140} height={140} unoptimized /> : <span>No image</span>}</Link>
          <div className="cart-item-description"><Link href={`/products/${item.slug}`}><h2>{item.name}</h2></Link>{item.option && <p>{item.option}</p>}<p>{money(item.unitPrice)} each</p>{item.available < item.quantity && <p className="checkout-error">{item.available ? `Only ${item.available} available. Reduce the quantity.` : "Currently unavailable. Remove this item to continue."}</p>}<button className="checkout-text-button" disabled={busy} onClick={() => void update("remove", item.sku)}>Remove</button></div>
          <div className="cart-item-amount"><div className="cart-quantity" aria-label={`Quantity for ${item.name}`}><button aria-label={`Decrease quantity for ${item.name}`} disabled={busy || item.quantity <= 1} onClick={() => void update("set", item.sku, item.quantity - 1)}>−</button><output aria-live="polite">{item.quantity}</output><button aria-label={`Increase quantity for ${item.name}`} disabled={busy || item.quantity >= Math.min(99,item.available)} onClick={() => void update("set", item.sku, item.quantity + 1)}>+</button></div><strong>{money(item.lineTotal)}</strong></div>
        </article>)}</div> : <form id="order-request" className="checkout-form" onSubmit={async (event) => {
          event.preventDefault(); if (busy) return; const data = new FormData(event.currentTarget); setBusy(true); setNotice("");
          try {
            const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(data), accepted: data.get("accepted") === "on", quote: cart.quote, version: cart.version }) });
            const result = await response.json(); if (!response.ok) throw new Error(result.error);
            setReceipt(result); await refresh(); window.scrollTo({ top: 0 });
          } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to submit your request."); }
          finally { setBusy(false); }
        }}>
          <fieldset disabled={busy}><legend>Contact details</legend>{!user && <p className="checkout-signin">Have an account? <button type="button" onClick={() => openAccount()}>Log in</button> or continue as a guest.</p>}
          <div className="checkout-fields" key={user?.id ?? "guest"}><label>First name<input name="firstName" required maxLength={100} autoComplete="given-name" defaultValue={user?.firstName} /></label><label>Last name<input name="lastName" required maxLength={100} autoComplete="family-name" defaultValue={user?.lastName} /></label><label>Email<input name="email" type="email" required maxLength={191} autoComplete="email" defaultValue={user?.email} /></label><label>Phone<input name="phone" type="tel" required maxLength={50} autoComplete="tel" defaultValue={user?.phone ?? ""} /></label></div></fieldset>
          <fieldset disabled={busy}><legend>Delivery address</legend><label>Street address<input name="address" required maxLength={255} autoComplete="street-address" /></label><div className="checkout-fields"><label>City / suburb<input name="city" required maxLength={100} autoComplete="address-level2" /></label><label>State / region<input name="region" required maxLength={100} autoComplete="address-level1" /></label><label>Postcode<input name="postcode" required maxLength={20} autoComplete="postal-code" /></label><label>Country<input name="country" required maxLength={100} defaultValue="Australia" autoComplete="country-name" /></label></div></fieldset>
          <fieldset disabled={busy}><legend>Additional information</legend><label>Order notes (optional)<textarea name="notes" maxLength={2000} rows={3} /></label><label className="checkout-consent"><input type="checkbox" name="accepted" required /><span>I understand this is an order request. Availability, delivery charges and payment will be confirmed by the store. No payment is taken now.</span></label></fieldset>
        </form>}
      </div><aside className="checkout-summary"><h2>Order summary</h2>{checkout && <div className="checkout-summary-items">{cart.items.map((item) => <div key={item.id}><span>{item.name}{item.option && <small>{item.option}</small>}<small>Quantity: {item.quantity}</small></span><strong>{money(item.lineTotal)}</strong></div>)}<Link href="/cart">Edit cart</Link></div>}<dl><div><dt>Items subtotal</dt><dd>{money(cart.subtotal)}</dd></div><div><dt>Delivery</dt><dd>To be confirmed</dd></div><div className="checkout-total"><dt>Amount due now</dt><dd>{money(0)}</dd></div></dl><p>We will confirm your final total and payment details after reviewing your request. Items are not reserved until confirmed.</p>
        {cart.items.some((i) => i.quantity > i.available) ? <p className="checkout-error">Update unavailable items in your cart before continuing.</p> : checkout ? <button form="order-request" className="checkout-button" disabled={busy}>{busy ? "Submitting…" : "Submit order request"}</button> : <Link className="checkout-button" href="/checkout">Proceed to checkout</Link>}
        <Link className="checkout-continue" href={checkout ? "/cart" : "/store"}>{checkout ? "Return to cart" : "Continue shopping"}</Link>
      </aside></div></>}
  </div>;
}
