import { notFound } from "next/navigation";
import { StorePage } from "@/components/store/store-page";
import { findStoreCategory } from "@/lib/store-categories";
import { getDatabase } from "@/lib/db";

async function resolveCategory(slug: string[]) {
  const known = findStoreCategory(slug);
  if (known) return known;
  if (slug.length !== 1) return null;
  const category = await getDatabase()?.category.findFirst({ where: { slug: slug[0], status: "PUBLISHED", archivedAt: null } });
  return category ? { name: category.name, slug: category.slug, href: `/collections/${category.slug}` } : null;
}

type Props = { params: Promise<{ slug: string[] }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props) {
  const category = await resolveCategory((await params).slug);
  return { title: category?.name ?? "Collection not found" };
}
export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await resolveCategory(slug);
  if (!category) notFound();
  const parent = slug.length > 1 ? findStoreCategory([slug[0]]) : undefined;
  return <StorePage name={category.name} slug={category.slug} parent={parent} />;
}
