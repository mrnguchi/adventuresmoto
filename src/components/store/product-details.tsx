"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductDetails } from "@/lib/product-details";
import { useCart } from "@/components/cart-provider";

const money = (value: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(value);

export function ProductDetailView({ product, preview = false }: { product: ProductDetails; preview?: boolean }) {
  const { change } = useCart();
  const [adding, setAdding] = useState(false);
  async function addToCart() {
    if (!sku || adding) return;
    setAdding(true); setNotice("");
    try { await change("add", sku, quantity); setNotice("Added to your cart."); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Unable to add this item."); }
    finally { setAdding(false); }
  }
  const [imageIndex, setImageIndex] = useState(0);
  const [sku, setSku] = useState(product.variants.length === 1 ? product.variants[0].sku : "");
  const [quantity, setQuantity] = useState(1);

  const [notice, setNotice] = useState("");
  const [expanded, setExpanded] = useState(false);
  const zoom = useRef<HTMLDialogElement>(null);
  const chart = useRef<HTMLDialogElement>(null);
  const selected = product.variants.find((variant) => variant.sku === sku);
  const inStock = selected ? selected.inStock : product.variants.some((variant) => variant.inStock);
  const image = product.images[imageIndex];
  const displayPrice = selected?.price ?? product.price;
  const displayCompare = selected?.price !== undefined ? selected.compareAtPrice : product.compareAtPrice;
  const sale = displayCompare !== undefined && displayCompare > displayPrice;

  return <div className="site-container product-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/store">Store</Link>{product.category && <><span>/</span><Link href={product.category.href}>{product.category.name}</Link></>}<span>/</span><span aria-current="page">{product.name}</span></nav>
    {preview && <p className="product-preview-note">Design preview · Sample product information for reviewing this page.</p>}
    <header className="product-title"><p>{product.brand || "Gear for the ride ahead"}</p><h1>{product.name}</h1><div className="product-sku">{selected ? <>SKU: {selected.sku} <button aria-label="Copy SKU" onClick={async () => { try { await navigator.clipboard.writeText(selected.sku); setNotice("SKU copied."); } catch { setNotice(`SKU: ${selected.sku}`); } }}>Copy</button></> : "Select an option to view its SKU"}</div></header>
    <div className="product-detail-grid">
      <div className="product-gallery">
        <button className="product-main-image" onClick={() => zoom.current?.showModal()} disabled={!image} aria-label="Enlarge product image">{image ? <Image src={image.src} alt={image.alt} width={900} height={900} unoptimized priority /> : <span>Product image coming soon</span>}<span className="product-zoom-label">{image ? "＋ View larger" : ""}</span></button>
        {product.images.length > 1 && <div className="product-thumbnails">{product.images.map((item, index) => <button key={`${item.src}-${index}`} aria-label={`View image ${index + 1}: ${item.alt}`} aria-pressed={imageIndex === index} onClick={() => setImageIndex(index)}><Image src={item.src} alt={item.alt} width={180} height={180} unoptimized /></button>)}</div>}
      </div>
      <aside className="product-purchase" aria-label="Product options">
        <div className="product-brand-mark">{product.brandLogo ? <Image src={product.brandLogo} alt={product.brand} width={230} height={90} unoptimized /> : <strong>{product.brand}</strong>}</div>
        <div className="product-price-block"><p className="product-detail-price">{money(displayPrice)} {sale && <del>{money(displayCompare!)}</del>}</p><p className="product-currency">AUD</p><span className={`product-stock-badge ${inStock ? "available" : ""}`}>{inStock ? "In stock" : "Out of stock"}</span></div>
        <div className="product-service-copy"><div><strong>Returns & exchanges</strong><p>Need help with your order? Our team is here to help.</p></div><div><strong>Shipping</strong><p>$10 shipping Australia wide.</p></div></div>
        <fieldset className="product-options"><legend>{product.wearable ? "Select size" : "Select option"}</legend>{product.wearable && product.sizeChart && <button className="product-size-chart" onClick={() => chart.current?.showModal()}>Size chart ↗</button>}<div className="product-option-buttons">{product.variants.map((variant) => <button key={variant.sku} disabled={!variant.inStock} aria-pressed={sku === variant.sku} title={variant.inStock ? variant.label : `${variant.label} — out of stock`} onClick={() => { setSku(variant.sku); setNotice(""); }}>{variant.label}</button>)}</div>{product.variants.length === 0 && <p>Options are not available yet.</p>}</fieldset>
        <div className="product-purchase-actions"><label className="product-quantity">Quantity <input type="number" min={1} max={99} value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(99, Math.trunc(Number(event.target.value)) || 1)))} /></label><button className="product-cart-button" disabled={preview || adding || !selected?.inStock} onClick={addToCart}>{!inStock ? "Out of stock" : !selected ? "Select an option" : adding ? "Adding…" : "Add to cart"}</button><p className="product-action-notice" role="status">{notice}</p></div>
        <section className="product-stock-section"><h2>Stock availability</h2><div><strong>Online</strong><span className={`product-stock-badge ${inStock ? "available" : ""}`}>{selected ? selected.inStock ? "In stock" : "Out of stock" : "Select an option"}</span><p>{selected ? `SKU: ${selected.sku}` : "Choose an option above to check availability."}</p></div><p className="product-local-stock">For local store availability, <a href="tel:+61283485100">call our team ↗</a></p></section>
        {!!product.related?.length && <section className="product-related"><h2>Complete your kit</h2>{product.related.map((item) => <Link href={item.href} key={item.href}><Image src={item.image} alt={item.name} width={110} height={130} unoptimized /><span><strong>{item.name}</strong><b>{money(item.price)}</b></span></Link>)}</section>}
      </aside>
      <div className="product-information">
        <details className="product-accordion" open><summary>Description</summary><div className={!expanded && product.features.length > 0 ? "product-description-collapsed" : ""}>{product.description.length ? product.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>More product information will be available soon. Contact our team for specifications and advice.</p>}{product.features.map((section) => <section key={section.title}><h3>{section.title}</h3><ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul></section>)}</div>{product.features.length > 0 && <button className="product-show-more" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? "Show less −" : "Show more +"}</button>}</details>
        <details className="product-accordion" open={Boolean(product.videoUrl)}><summary>Video</summary>{product.videoUrl ? <video className="product-video" controls preload="none" src={product.videoUrl}>Your browser does not support video.</video> : <p>No product video is available yet.</p>}</details>
        <details className="product-accordion"><summary>Reviews <span>No reviews yet</span></summary><p>Customer reviews will be available here.</p></details>
        <details className="product-accordion" open><summary>Delivery & returns</summary><h3>Shipping</h3><p>$10 shipping Australia wide. Contact our team for delivery estimates for your location.</p><h3>Returns</h3><p>For help with sizing, exchanges or returning an item, speak with our team before sending your item back.</p><a className="product-contact-link" href="tel:+61283485100">Call (02) 8348 5100 ↗</a></details>
        <div className="store-help"><p className="store-help-eyebrow">The right gear makes all the difference</p><h2>Need a hand?</h2><p>Talk to our team about sizing, compatibility and finding the right setup for your next ride.</p><a href="tel:+61283485100">Talk to our team ↗</a></div>
      </div>
    </div>
    <dialog className="product-dialog" ref={zoom}><button className="product-dialog-close" onClick={() => zoom.current?.close()} aria-label="Close image">×</button>{image && <Image src={image.src} alt={image.alt} width={1100} height={1100} unoptimized />}</dialog>
    <dialog className="product-dialog product-chart-dialog" ref={chart}><button className="product-dialog-close" onClick={() => chart.current?.close()} aria-label="Close size chart">×</button><h2>Size chart</h2>{product.sizeChart && <table><thead><tr>{product.sizeChart.headings.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{product.sizeChart.rows.map((row, index) => <tr key={index}>{row.map((cell, index) => <td key={index}>{cell}</td>)}</tr>)}</tbody></table>}</dialog>
  </div>;
}
