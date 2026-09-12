import { productCategories, slugify } from "@/components/header/header-data";
import { shopCategories } from "@/data/shop-categories";

export type StoreCategory = { name: string; slug: string; href: string };
export const storeCategories: StoreCategory[] = [];
for (const category of productCategories.filter((item) => item.label !== "Brands")) {
  const root = slugify(category.label);
  storeCategories.push({ name: category.label, slug: root, href: `/collections/${root}` });
  for (const section of category.sections ?? category.columns?.flatMap((column) => column.sections) ?? []) {
    for (const item of section.items) {
      const itemSlug = slugify(item);
      const slug = root === "riding-gear" && ["mens", "womens"].includes(section.slug)
        ? `${section.slug}-${itemSlug}` : `${root}-${section.slug}-${itemSlug}`;
      storeCategories.push({ name: `${section.slug === "mens" ? "Men's " : section.slug === "womens" ? "Women's " : ""}${item}`, slug, href: `/collections/${root}/${section.slug}/${itemSlug}` });
    }
  }
}
for (const category of shopCategories) {
  const slug = category.href.split("/").at(-1)!;
  const existing = storeCategories.find((item) => item.slug === slug || (item.name === category.title && item.href.startsWith("/collections/riding-gear/")));
  if (existing) existing.slug = slug;
  storeCategories.push({ name: category.title, slug, href: category.href });
}
storeCategories.push({ name: "Sale", slug: "sale", href: "/collections/sale" });

export function findStoreCategory(path: string[]) {
  return storeCategories.find((category) => category.href === `/collections/${path.join("/")}`);
}

// Accept the singular labels used by admin-created categories as well as the
// plural labels used by the curated homepage and navigation.
export function categorySlugKey(slug: string) {
  const aliases: Record<string, string> = {
    "mens-jacket": "mens-jackets", "womens-jacket": "womens-jackets",
    "mens-pant": "mens-pants", "womens-pant": "womens-pants",
    "helmet": "helmets", "boot": "boots", "tyre": "tyres",
  };
  return aliases[slug] ?? slug;
}

export function categoryMatchesRoute(categorySlug: string, routeSlug: string) {
  const key = categorySlugKey(categorySlug);
  if (key === categorySlugKey(routeSlug)) return true;
  // Curated top-level menus also include their known children when an admin
  // created a child category without explicitly assigning its database parent.
  return storeCategories.some((category) => categorySlugKey(category.slug) === key
    && category.href.startsWith(`/collections/${routeSlug}/`));
}

export function hasWearableSizes(slug: string) {
  return slug === "riding-gear" || slug === "helmets" || slug === "boots"
    || /^(mens|womens)-/.test(slug)
    || ["airbag-systems", "body-armour", "knee-guards", "knee-braces", "kidney-belts", "goggles"].some(
      (item) => slug === `riding-gear-protection-${item}`,
    ) || slug.startsWith("riding-gear-bundles-");
}
