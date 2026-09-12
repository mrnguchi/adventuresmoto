import { cache } from "react";
import { getDatabase } from "@/lib/db";
import { storeCategories, categorySlugKey } from "@/lib/store-categories";
import { variantAvailable } from "@/lib/store";

export type ProductDetails = {
  slug: string; name: string; brand: string; brandLogo?: string;
  seoTitle?: string; seoDescription?: string;
  price: number; compareAtPrice?: number; images: { src: string; alt: string }[];
  category?: { name: string; href: string }; wearable: boolean;
  variants: { sku: string; label: string; inStock: boolean; price?: number; compareAtPrice?: number }[];
  description: string[]; features: { title: string; items: string[] }[];
  videoUrl?: string; sizeChart?: { headings: string[]; rows: string[][] };
  related?: { name: string; href: string; image: string; price: number }[];
};

export const getProductDetails = cache(async (slug: string): Promise<ProductDetails | null> => {
  const database = getDatabase();
  if (!database) return null;
  const product = await database.product.findFirst({
    where: { slug, status: "PUBLISHED", archivedAt: null },
    include: { brand: { include: { logoAsset: true } }, variants: { where: { isActive: true, archivedAt: null }, orderBy: { displayOrder: "asc" }, include: { inventory: { include: { location: true } } } },
      media: { orderBy: { displayOrder: "asc" }, include: { asset: true } }, sections: { orderBy: { displayOrder: "asc" } },
      categories: { include: { category: true } } },
  });
  if (!product) return null;
  const categories = product.categories.filter(({ category }) => category.status === "PUBLISHED" && !category.archivedAt);
  const primary = categories.find((item) => item.category.id === product.primaryCategoryId)?.category ?? categories[0]?.category;
  const category = primary ? storeCategories.find((item) => categorySlugKey(item.slug) === categorySlugKey(primary.slug)) ?? { name: primary.name, href: `/collections/${primary.slug}` } : undefined;
  return {
    slug: product.slug, name: product.name, brand: product.brand?.name ?? "",
    seoTitle: product.seoTitle ?? undefined, seoDescription: product.seoDescription ?? undefined,
    brandLogo: product.brand?.logoAsset?.publicUrl ?? undefined,
    price: Number(product.price), compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
    images: product.media.length ? product.media.filter((m) => m.asset.publicUrl && !m.asset.archivedAt).map((m) => ({ src: m.asset.publicUrl!, alt: m.altText ?? product.name })) : product.imageUrl ? [{ src: product.imageUrl, alt: product.name }] : [],
    category, wearable: product.isWearable,
    variants: product.variants.map((variant) => ({ sku: variant.sku, label: variant.size ?? variant.name ?? variant.sku, inStock: variantAvailable(variant), price: Number(variant.price ?? product.price), compareAtPrice: variant.price !== null ? variant.compareAtPrice === null ? undefined : Number(variant.compareAtPrice) : product.compareAtPrice === null ? undefined : Number(product.compareAtPrice) })),
    description: product.description ? product.description.split(/\n\s*\n/).filter(Boolean) : [],
    features: product.sections.filter((s) => Array.isArray(s.bullets) && s.bullets.length).map((s) => ({ title: s.title, items: (s.bullets as unknown[]).filter((v): v is string => typeof v === "string") })),
    videoUrl: product.sections.find((s) => s.videoUrl)?.videoUrl ?? undefined,
  };
});
