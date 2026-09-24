import Link from "next/link";
import { getDatabase } from "@/lib/db";
import { getStoreProducts } from "@/lib/store";
import { StorefrontHeader } from "@/components/storefront-header";
import { GarageSelector } from "@/components/garage-selector";
import { StoreCatalogue } from "@/components/store/store-catalogue";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Garage | Adventures Moto", robots: { index: false, follow: true } };
export default async function GaragePage({ searchParams }: { searchParams: Promise<{ bike?: string | string[] }> }) {
  const { bike: raw } = await searchParams;
  const id = typeof raw === "string" && /^\d+$/.test(raw) ? Number(raw) : 0;
  let bike = null;
  let unavailable = false;
  let hasBikes = true;
  let data: Awaited<ReturnType<typeof getStoreProducts>> = { products: [], unavailable: false };
  try {
    const db = getDatabase();
    if (!db) unavailable = true;
    else if (Number.isSafeInteger(id) && id > 0) {
      bike = await db.motorcycleYear.findUnique({ where: { id }, include: { model: { include: { make: true } } } });
      if (bike) data = await getStoreProducts("all", "", id);
    } else hasBikes = Boolean(await db.motorcycleYear.findFirst({ select: { id: true } }));
  } catch { unavailable = true; }
  const name = bike ? `${bike.model.make.name} ${bike.model.name} ${bike.year}` : "";
  return <><StorefrontHeader /><main><GarageSelector /><div className="site-container store-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">My Garage</span></nav>
    {bike && !unavailable && data.products.length ? <><p>Confirmed fitments for your bike. Check each product’s fitment notes before ordering.</p><StoreCatalogue key={id} name={`Products for ${name}`} {...data} /></> : <section className="store-empty"><h1>{unavailable ? "Garage temporarily unavailable" : bike ? `No parts found for ${name}` : raw ? "Bike not found" : !hasBikes ? "No bikes available" : "Find parts for your bike"}</h1><p>{unavailable ? "Please try again shortly." : bike ? "We couldn’t find parts confirmed to fit this bike. Try another bike or browse all products." : raw ? "Please select a make, model and year from the options above." : !hasBikes ? "Browse all products or contact our team for help finding parts for your bike." : "Select your bike’s make, model and year above to see matching parts."}</p><Link href="/store">Browse all products</Link></section>}
  </div></main></>;
}
