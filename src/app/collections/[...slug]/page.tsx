import { notFound } from "next/navigation";
import { StorePage } from "@/components/store/store-page";
import { findStoreCategory } from "@/lib/store-categories";

type Props = { params: Promise<{ slug: string[] }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props) {
  const category = findStoreCategory((await params).slug);
  return { title: category?.name ?? "Collection not found" };
}
export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = findStoreCategory(slug);
  if (!category) notFound();
  const parent = slug.length > 1 ? findStoreCategory([slug[0]]) : undefined;
  return <StorePage name={category.name} slug={category.slug} parent={parent} />;
}
