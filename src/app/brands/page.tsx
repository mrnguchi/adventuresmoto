import type { Metadata } from "next";
import Link from "next/link";

import { BrandDirectory } from "@/components/brand-directory";
import { GarageSelector } from "@/components/garage-selector";
import { StorefrontHeader } from "@/components/storefront-header";

export const metadata: Metadata = {
  title: "Motorcycle Brands | Adventures Moto",
  description:
    "Browse adventure motorcycle gear, parts, luggage and accessories by brand.",
};

export default function BrandsPage() {
  return (
    <>
      <StorefrontHeader />
      <main>
        <GarageSelector />

        <div className="site-container brands-page">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Brands</span>
          </nav>

          <BrandDirectory />
        </div>
      </main>
    </>
  );
}
