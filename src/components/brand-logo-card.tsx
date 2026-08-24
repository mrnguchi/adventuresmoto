import Image from "next/image";
import Link from "next/link";

import type { FeaturedBrand } from "@/data/featured-brands";

type BrandLogoCardProps = {
  brand: FeaturedBrand;
};

export function BrandLogoCard({ brand }: BrandLogoCardProps) {
  return (
    <Link
      className="brand-logo-card lift-on-hover"
      href={brand.href}
      aria-label={`Shop ${brand.name}`}
    >
      <Image
        src={brand.image}
        alt={`${brand.name} logo`}
        width={465}
        height={151}
        sizes="(max-width: 767px) 42vw, (max-width: 1100px) 30vw, 15vw"
      />
    </Link>
  );
}
