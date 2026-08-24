import Link from "next/link";

import { BrandLogoCard } from "@/components/brand-logo-card";
import { featuredBrands } from "@/data/featured-brands";

export function FeaturedBrands() {
  return (
    <section className="featured-brands" aria-labelledby="featured-brands-title">
      <div className="site-container">
        <header className="featured-brands-header">
          <h2 id="featured-brands-title">Featured Brands</h2>
          <Link href="/brands">View All</Link>
        </header>

        <div className="brand-logo-grid">
          {featuredBrands.map((brand) => (
            <BrandLogoCard key={brand.name} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
}
