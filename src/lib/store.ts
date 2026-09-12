import { getDatabase } from "@/lib/db";
import { categoryMatchesRoute } from "@/lib/store-categories";

export type StoreProduct = {
  id: number; name: string; slug: string; brand: string; image: string | null;
  price: number; compareAtPrice: number | null; sizes: string[]; inStock: boolean; priceFrom?: boolean; wearable: boolean;
};

export function variantAvailable(variant: { inStock: boolean; isActive: boolean; archivedAt: Date | null; inventory: { onHand: number; reserved: number; safetyStock: number; location: { isActive: boolean; fulfillsOnline: boolean } }[] }) {
  return variant.isActive && !variant.archivedAt && (variant.inventory.length ? variant.inventory.some((i) => i.location.isActive && i.location.fulfillsOnline && i.onHand - i.reserved - i.safetyStock > 0) : variant.inStock);
}

export async function getStoreProducts(slug: string): Promise<{ products: StoreProduct[]; unavailable: boolean }> {
  const database = getDatabase();
  if (!database) return { products: [], unavailable: true };
  // Include published descendants so parent categories show their entire range.
  const categories = await database.category.findMany({
    where: { status: "PUBLISHED", archivedAt: null }, select: { id: true, parentId: true, slug: true },
  });
  const ids = new Set(categories.filter((category) => categoryMatchesRoute(category.slug, slug)).map((category) => category.id));
  let previousSize = -1;
  while (previousSize !== ids.size) {
    previousSize = ids.size;
    for (const category of categories) if (category.parentId && ids.has(category.parentId)) ids.add(category.id);
  }
  const products = await database.product.findMany({
    where: { status: "PUBLISHED", archivedAt: null, ...(slug === "all" || slug === "sale" ? {} : { OR: [{ primaryCategoryId: { in: [...ids] } }, { categories: { some: { categoryId: { in: [...ids] } } } }] }) },
    include: { brand: true, variants: { where: { isActive: true, archivedAt: null }, include: { inventory: { include: { location: true } } } } },
    orderBy: [{ displayOrder: "asc" }, { id: "desc" }],
  });
  return { unavailable: false, products: products.map((product) => {
    const prices = product.variants.map((v) => Number(v.price ?? product.price));
    const price = prices.length ? Math.min(...prices) : Number(product.price);
    const lowest = product.variants.find((v) => Number(v.price ?? product.price) === price);
    const compare = lowest?.price !== null && lowest?.price !== undefined ? lowest.compareAtPrice : product.compareAtPrice;
    return ({
    id: product.id, name: product.name, slug: product.slug, brand: product.brand?.name ?? "",
    image: product.imageUrl, price, priceFrom: new Set(prices).size > 1, wearable: product.isWearable,
    compareAtPrice: compare === null || compare === undefined ? null : Number(compare),
    sizes: [...new Set(product.variants.filter((variant) => variantAvailable(variant) && variant.size).map((variant) => variant.size!))],
    inStock: product.variants.some(variantAvailable),
  }); }).filter((product) => slug !== "sale" || (product.compareAtPrice !== null && product.compareAtPrice > product.price)) };
}
