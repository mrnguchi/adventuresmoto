import Link from "next/link";
import { GarageSelector } from "@/components/garage-selector";
import { StorefrontHeader } from "@/components/storefront-header";
import { StoreCatalogue } from "./store-catalogue";
import { getStoreProducts } from "@/lib/store";
import { hasWearableSizes } from "@/lib/store-categories";

export async function StorePage({ name, slug, parent }: { name: string; slug: string; parent?: { name: string; href: string } }) {
  const data = await getStoreProducts(slug);
  return <><StorefrontHeader /><main><GarageSelector /><div className="site-container store-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/store">Store</Link>{parent && <><span aria-hidden="true">/</span><Link href={parent.href}>{parent.name}</Link></>}<span aria-hidden="true">/</span><span aria-current="page">{name}</span></nav><StoreCatalogue key={slug} name={name} showSizeFilter={hasWearableSizes(slug)} {...data} /></div></main></>;
}
