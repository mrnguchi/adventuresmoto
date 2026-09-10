import { cache } from "react";
import { getDatabase } from "@/lib/db";
import { storeCategories, hasWearableSizes } from "@/lib/store-categories";

export type ProductDetails = {
  slug: string; name: string; brand: string; brandLogo?: string;
  price: number; compareAtPrice?: number; images: { src: string; alt: string }[];
  category?: { name: string; href: string }; wearable: boolean;
  variants: { sku: string; label: string; inStock: boolean }[];
  description: string[]; features: { title: string; items: string[] }[];
  videoUrl?: string; sizeChart?: { headings: string[]; rows: string[][] };
  related?: { name: string; href: string; image: string; price: number }[];
};

export const getProductDetails = cache(async (slug: string): Promise<ProductDetails | null> => {
  const database = getDatabase();
  if (!database) return null;
  const product = await database.product.findFirst({
    where: { slug, status: "PUBLISHED", archivedAt: null },
    include: { brand: { include: { logoAsset: true } }, variants: true,
      categories: { include: { category: true } } },
  });
  if (!product) return null;
  const categories = product.categories.filter(({ category }) => category.status === "PUBLISHED" && !category.archivedAt);
  const category = categories.map(({ category }) => storeCategories.find((item) => item.slug === category.slug)).find(Boolean);
  return {
    slug: product.slug, name: product.name, brand: product.brand?.name ?? "",
    brandLogo: product.brand?.logoAsset?.publicUrl ?? undefined,
    price: Number(product.price), compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
    images: product.imageUrl ? [{ src: product.imageUrl, alt: product.name }] : [],
    category, wearable: categories.some(({ category }) => hasWearableSizes(category.slug)),
    variants: product.variants.map((variant) => ({ sku: variant.sku, label: variant.size ?? variant.sku, inStock: variant.inStock })),
    description: [], features: [],
  };
});
