"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { StoreProduct } from "@/lib/store";

const money = (value: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(value);

function Filter({ title, values, selected, onChange, searchable = false }: { title: string; values: { name: string; count: number }[]; selected: string[]; onChange: (value: string) => void; searchable?: boolean }) {
  const [search, setSearch] = useState("");
  return <details className="store-filter" open><summary>{title}</summary>
    {searchable && <input aria-label={`Search ${title.toLowerCase()}`} placeholder="Search…" value={search} onChange={(event) => setSearch(event.target.value)} />}
    <div className="store-filter-options">{values.filter((value) => value.name.toLowerCase().includes(search.toLowerCase())).map((value) => <label key={value.name}>
      <input type="checkbox" checked={selected.includes(value.name)} onChange={() => onChange(value.name)} /><span>{value.name}</span><small>({value.count})</small>
    </label>)}{values.length === 0 && <p>Options appear with available products.</p>}</div>
  </details>;
}

export function StoreCatalogue({ name, products, unavailable, showSizeFilter = false }: { name: string; products: StoreProduct[]; unavailable: boolean; showSizeFilter?: boolean }) {
  const [brands, setBrands] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [stock, setStock] = useState<string[]>([]);
  const prices = products.map((product) => Math.round(product.price * 100));
  const minimum = prices.length ? Math.min(...prices) : 0;
  const maximum = prices.length ? Math.max(...prices) : 0;
  const [priceRange, setPriceRange] = useState<[number, number]>([minimum, maximum]);
  const priceFiltered = priceRange[0] !== minimum || priceRange[1] !== maximum;
  const [sort, setSort] = useState("featured");
  const [limit, setLimit] = useState(24);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const toggle = (value: string, selected: string[], setter: (value: string[]) => void) => { setter(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]); setPage(1); };
  const clear = () => { setBrands([]); setSizes([]); setStock([]); setPriceRange([minimum, maximum]); setSearch(""); setPage(1); };
  const filtered = products.filter((product) => (!brands.length || brands.includes(product.brand)) && (!showSizeFilter || !sizes.length || sizes.some((size) => product.sizes.includes(size))) && (!stock.length || stock.includes(product.inStock ? "In Stock" : "Out of Stock")) && Math.round(product.price * 100) >= priceRange[0] && Math.round(product.price * 100) <= priceRange[1] && product.name.toLowerCase().includes(search.toLowerCase()));
  if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  const pages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, pages);
  const facet = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((name) => ({ name, count: values.filter((value) => value === name).length }));
  const pagination = <nav className="store-pagination" aria-label="Product pages"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page">‹</button>{Array.from({ length: pages }, (_, index) => index + 1).filter((number) => number === 1 || number === pages || Math.abs(number - currentPage) <= 1).map((number, index, numbers) => <span key={number}>{index > 0 && number - numbers[index - 1] > 1 && <span>…</span>}<button aria-current={currentPage === number ? "page" : undefined} onClick={() => setPage(number)}>{number}</button></span>)}<button disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)} aria-label="Next page">›</button></nav>;

  return <div className="store-layout">
    <aside className="store-sidebar"><details className="store-mobile-filters" open><summary>Filter products</summary>
      <div className="store-filter-heading"><strong>Refine your ride</strong><button onClick={clear}>Clear all</button></div>
      {showSizeFilter && <Filter title="Size" searchable values={facet(products.flatMap((product) => product.sizes))} selected={sizes} onChange={(value) => toggle(value, sizes, setSizes)} />}
      <Filter title="Brand" values={facet(products.map((product) => product.brand).filter(Boolean))} selected={brands} onChange={(value) => toggle(value, brands, setBrands)} />
      <Filter title="In stock" values={[{ name: "In Stock", count: products.filter((product) => product.inStock).length }, { name: "Out of Stock", count: products.filter((product) => !product.inStock).length }]} selected={stock} onChange={(value) => toggle(value, stock, setStock)} />
      <details className="store-filter store-price-filter" open><summary>Price</summary>
        {products.length ? <><div className="store-price-labels"><output>{money(priceRange[0] / 100)}</output><output>{money(priceRange[1] / 100)}</output></div>
          <div className="store-price-slider">
            <div className="store-price-track"><span style={{ left: `${maximum === minimum ? 0 : (priceRange[0] - minimum) / (maximum - minimum) * 100}%`, right: `${maximum === minimum ? 0 : (maximum - priceRange[1]) / (maximum - minimum) * 100}%` }} /></div>
            <input type="range" aria-label="Minimum price" aria-valuetext={money(priceRange[0] / 100)} min={minimum} max={maximum} step={1} value={priceRange[0]} disabled={minimum === maximum} onChange={(event) => { setPriceRange([Math.min(Number(event.target.value), priceRange[1]), priceRange[1]]); setPage(1); }} />
            <input type="range" aria-label="Maximum price" aria-valuetext={money(priceRange[1] / 100)} min={minimum} max={maximum} step={1} value={priceRange[1]} disabled={minimum === maximum} onChange={(event) => { setPriceRange([priceRange[0], Math.max(Number(event.target.value), priceRange[0])]); setPage(1); }} />
          </div></> : <p className="store-price-empty">Prices appear with available products.</p>}
      </details>
    </details><div className="store-sidebar-note"><strong>Ready for the ride ahead.</strong><p>Gear, parts and essentials for your next adventure.</p></div></aside>
    <section className="store-results" aria-labelledby="store-title">
      <header className="store-heading"><p>Gear for the ride ahead</p><h1 id="store-title">{name}</h1></header>
      <div className="store-toolbar"><p aria-live="polite"><span>Total:</span> {filtered.length} products</p><label>Show <select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }}><option value={24}>24</option><option value={48}>48</option><option value={60}>60</option></select></label><label>Sort <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name">Name: A–Z</option></select></label></div>
      <div className="store-search-row"><input type="search" aria-label="Search products in this category" placeholder="Search this collection…" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />{(brands.length > 0 || sizes.length > 0 || stock.length > 0 || priceFiltered || search) && <button onClick={clear}>Clear filters ×</button>}</div>
      {filtered.length > 0 ? <><div className="store-product-grid">{filtered.slice((currentPage - 1) * limit, currentPage * limit).map((product) => <article className="store-product-card" key={product.id}><Link className="store-product-link" href={`/products/${encodeURIComponent(product.slug)}`}>
        <div className="store-product-image">{product.image ? <Image src={product.image} alt={product.name} unoptimized width={360} height={360} /> : <span className="store-image-placeholder">Image coming soon</span>}{product.compareAtPrice !== null && product.compareAtPrice > product.price && <span className="store-sale-badge">Sale</span>}</div>
        <div className="store-product-copy"><span className="store-product-brand">{product.brand}</span><h2>{product.name}</h2><p className="store-product-price">{product.priceFrom && <small>From </small>}{money(product.price)} {product.compareAtPrice !== null && product.compareAtPrice > product.price && <del>{money(product.compareAtPrice)}</del>}</p><p className="store-product-stock"><span className={product.inStock ? "is-in-stock" : ""}>{product.inStock ? "In stock" : "Out of stock"}</span>{product.inStock && product.sizes.length > 0 && <span>: {product.sizes.join(" · ")}</span>}</p></div>
      </Link></article>)}</div>{pagination}</> : <div className="store-empty" role="status"><span aria-hidden="true">↗</span><h2>{unavailable ? "This collection is on its way" : products.length ? "No matching products" : "More adventure is coming"}</h2><p>{unavailable ? "Our catalogue is temporarily unavailable. Please check back soon or contact our team for help." : products.length ? "Try another search or clear your filters to see more gear." : "There are no products in this collection yet. Explore our other collections for your next ride."}</p>{products.length ? <button onClick={clear}>Clear filters</button> : <Link href="/">Explore categories</Link>}</div>}
      <div className="store-help"><p className="store-help-eyebrow">A little advice goes a long way</p><h2>Got a question?</h2><p>Looking for something in particular? Our team can help you find the right gear for your next adventure.</p><a href="tel:+61283485100">Call our team <span aria-hidden="true">↗</span></a></div>
    </section>
  </div>;
}
