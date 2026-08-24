import Image from "next/image";
import Link from "next/link";

import type { ShopCategory } from "@/data/shop-categories";

type CategoryCardProps = {
  category: ShopCategory;
};

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      className="category-card lift-on-hover"
      href={category.href}
      aria-label={`Shop ${category.title}`}
    >
      <div className="category-card-media">
        <Image
          className="category-card-image"
          src={category.image}
          alt={category.alt}
          width={360}
          height={280}
          sizes="(max-width: 767px) 44vw, (max-width: 1100px) 45vw, 23vw"
        />
      </div>

      <div className="category-card-copy">
        <span>Shop</span>
        <h3>{category.title}</h3>
      </div>
    </Link>
  );
}
