import Link from "next/link";
import { StorefrontHeader } from "@/components/storefront-header";
import { StoreCatalogue } from "@/components/store/store-catalogue";
import { getStoreProducts } from "@/lib/store";
import "./search.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Search products | Adventures Moto",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim().replace(/\s+/g, " ").slice(0, 200) ?? "";
  let data: Awaited<ReturnType<typeof getStoreProducts>> = { products: [], unavailable: false };
  if (query) {
    try {
      data = await getStoreProducts("all", query);
    } catch {
      data = { products: [], unavailable: true };
    }
  }

  return <>
    <StorefrontHeader />
    <main className="site-container store-page search-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Search</span>
      </nav>
      <form className="product-search-form" action="/search" role="search">
        <label htmlFor="results-query">Search by product or SKU</label>
        <div>
          <input key={query} id="results-query" name="q" type="search" defaultValue={query} maxLength={200} placeholder="What are you looking for?" />
          <button type="submit">Search</button>
        </div>
      </form>
      {query && data.products.length > 0 ? (
        <StoreCatalogue key={query} name={`Results for “${query}”`} {...data} showSizeFilter={data.products.some((product) => product.wearable)} searchResults />
      ) : (
        <section className="search-message" aria-labelledby="search-title">
          <h1 id="search-title">{!query ? "Search our store" : data.unavailable ? "Search is temporarily unavailable" : `No results for “${query}”`}</h1>
          <p>{!query ? "Enter a product name, brand or SKU to find your gear." : data.unavailable ? "Please try again in a moment." : "Check the spelling or try a broader search, such as jacket, helmet or Klim."}</p>
          <Link href="/store">Browse all products</Link>
        </section>
      )}
    </main>
  </>;
}
