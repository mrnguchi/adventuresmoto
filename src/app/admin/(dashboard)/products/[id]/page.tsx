import { notFound } from "next/navigation";
import { database, requireAdmin } from "@/lib/admin/auth";
import { ProductEditor } from "@/components/admin/product-editor";
import type { ProductInput } from "@/lib/admin/product-input";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin(); const { id } = await params; const { saved } = await searchParams;
  const [categories, brands] = await Promise.all([database().category.findMany({ where: { archivedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }), database().brand.findMany({ where: { archivedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } })]);
  let initial: ProductInput = { version: 0, name: "", slug: "", brandId: null, categoryId: null, status: "DRAFT", wearable: false, price: "0.00", compareAtPrice: "", description: "", highlights: "", images: [], videoUrl: "", seoTitle: "", seoDescription: "", variants: [{ sku: "", size: "", price: "", quantity: 0, active: true }] };
  if (id !== "new") {
    if (!/^\d+$/.test(id)) notFound();
    const product = await database().product.findFirst({ where: { id: Number(id), archivedAt: null }, include: { variants: { orderBy: { displayOrder: "asc" }, include: { inventory: { include: { location: true } } } }, media: { orderBy: { displayOrder: "asc" }, include: { asset: true } }, sections: true, fitments: { include: { motorcycle: { include: { model: { include: { make: true } } } } } } } });
    if (!product) notFound();
    const bullets = product.sections.find((s) => s.code === "highlights")?.bullets;
    initial = { fitments: product.fitments.map((f) => ({ make: f.motorcycle.model.make.name, model: f.motorcycle.model.name, year: f.motorcycle.year, note: f.note ?? "" })), id: product.id, version: product.version, name: product.name, slug: product.slug, brandId: product.brandId, categoryId: product.primaryCategoryId,
      status: product.status, wearable: product.isWearable, price: product.price.toFixed(2), compareAtPrice: product.compareAtPrice?.toFixed(2) ?? "", description: product.description ?? "",
      highlights: Array.isArray(bullets) ? bullets.filter((b) => typeof b === "string").join("\n") : "", images: product.media.length ? product.media.map((m) => m.asset.publicUrl).filter((url): url is string => Boolean(url)) : product.imageUrl ? [product.imageUrl] : [],
      videoUrl: product.sections.find((s) => s.code === "video")?.videoUrl ?? "", seoTitle: product.seoTitle ?? "", seoDescription: product.seoDescription ?? "",
      variants: product.variants.map((v) => ({ id: v.id, sku: v.sku, size: v.size ?? v.name ?? "", price: v.price?.toFixed(2) ?? "", stockVersion: v.inventory.find((i) => i.location.code === "MAIN")?.version ?? 0, quantity: v.inventory.find((i) => i.location.code === "MAIN")?.onHand ?? 0, active: v.isActive })) };
  }
  return <>{saved && <p className="admin-success" role="status">Product saved successfully.</p>}<ProductEditor key={`${id}-${initial.version}`} initial={initial} categories={categories} brands={brands} /></>;
}
