import { getDatabase } from "@/lib/db";

export type StoreProduct = {
  id: number; name: string; slug: string; brand: string; image: string | null;
  price: number; compareAtPrice: number | null; sizes: string[]; inStock: boolean;
};

export async function getStoreProducts(slug: string): Promise<{ products: StoreProduct[]; unavailable: boolean }> {
  const database = getDatabase();
  if (!database) return { products: [], unavailable: true };
  // Include published descendants so parent categories show their entire range.
  const categories = await database.category.findMany({
    where: { status: "PUBLISHED", archivedAt: null }, select: { id: true, parentId: true, slug: true },
  });
  const ids = new Set(categories.filter((category) => category.slug === slug).map((category) => category.id));
  let previousSize = -1;
  while (previousSize !== ids.size) {
    previousSize = ids.size;
    for (const category of categories) if (category.parentId && ids.has(category.parentId)) ids.add(category.id);
  }
  const products = await database.product.findMany({
    where: { status: "PUBLISHED", archivedAt: null, ...(slug === "all" || slug === "sale" ? {} : { categories: { some: { categoryId: { in: [...ids] } } } }) },
    include: { brand: true, variants: true },
    orderBy: [{ displayOrder: "asc" }, { id: "desc" }],
  });
  return { unavailable: false, products: products.map((product) => ({
    id: product.id, name: product.name, slug: product.slug, brand: product.brand?.name ?? "",
    image: product.imageUrl, price: Number(product.price),
    compareAtPrice: product.compareAtPrice === null ? null : Number(product.compareAtPrice),
    sizes: [...new Set(product.variants.filter((variant) => variant.inStock && variant.size).map((variant) => variant.size!))],
    inStock: product.variants.some((variant) => variant.inStock),
  })).filter((product) => slug !== "sale" || (product.compareAtPrice !== null && product.compareAtPrice > product.price)) };
}
