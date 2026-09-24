export type VariantInput = { id?: number; sku: string; size: string; price: string; quantity: number; stockVersion?: number; active: boolean };
export type ProductInput = {
  fitments?: { make: string; model: string; year: number; note: string }[];
  id?: number; version: number; name: string; slug: string; brandId: number | null; categoryId: number | null;
  status: "DRAFT" | "PUBLISHED"; wearable: boolean; price: string; compareAtPrice: string;
  description: string; highlights: string; images: string[]; videoUrl: string;
  seoTitle: string; seoDescription: string; variants: VariantInput[];
};
export class InputError extends Error {}
function text(value: unknown, max: number) {
  if (typeof value !== "string" || value.length > max) throw new InputError(`A text field exceeds its ${max}-character limit.`);
  return value.trim();
}
function id(value: unknown, optional = false): number | null {
  if (optional && (value === null || value === "" || value === undefined)) return null;
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) throw new InputError("Invalid record identifier.");
  return value;
}
function money(value: unknown, optional = false) {
  if (optional && value === "") return "";
  if (typeof value !== "string" || !/^\d{1,8}(\.\d{1,2})?$/.test(value)) throw new InputError("Enter a valid non-negative price with at most two decimal places.");
  return Number(value).toFixed(2);
}
export function imageUrl(value: unknown) {
  const url = text(value, 2048);
  if (/^\/images\/[a-zA-Z0-9/_ .-]+$/.test(url) && !url.includes("..")) return url;
  try { const parsed = new URL(url); if (parsed.protocol === "https:" && !parsed.username && !parsed.password) return url; } catch {}
  throw new InputError("Images must use an HTTPS URL or a local /images/ path.");
}
export function parseProduct(raw: unknown): ProductInput {
  if (!raw || typeof raw !== "object") throw new InputError("Invalid product.");
  const r = raw as Record<string, unknown>;
  let fitments: ProductInput["fitments"];
  if (r.fitments !== undefined) {
    if (!Array.isArray(r.fitments) || r.fitments.length > 500) throw new InputError("Use up to 500 bike fitments.");
    fitments = r.fitments.map((value) => {
      if (!value || typeof value !== "object") throw new InputError("Invalid bike fitment.");
      const f = value as Record<string, unknown>;
      const make = text(f.make, 100).replace(/\s+/g, " "), model = text(f.model, 191).replace(/\s+/g, " ");
      if (!make || !model || !Number.isInteger(f.year) || Number(f.year) < 1900 || Number(f.year) > new Date().getFullYear() + 2) throw new InputError("Enter a bike make, exact model and valid year.");
      return { make, model, year: Number(f.year), note: text(f.note, 500) };
    });
    if (new Set(fitments.map((f) => JSON.stringify([f.make.toLowerCase(), f.model.toLowerCase(), f.year]))).size !== fitments.length) throw new InputError("Remove duplicate bike fitments.");
  }
  const name = text(r.name, 255), slug = text(r.slug, 191);
  if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new InputError("A name and a lowercase, hyphen-separated URL slug are required.");
  if (r.status !== "DRAFT" && r.status !== "PUBLISHED") throw new InputError("Invalid publication status.");
  if (typeof r.wearable !== "boolean") throw new InputError("Invalid product type.");
  if (!Number.isSafeInteger(r.version) || Number(r.version) < 0) throw new InputError("Invalid version.");
  const price = money(r.price), compareAtPrice = money(r.compareAtPrice, true);
  if (compareAtPrice && Number(compareAtPrice) < Number(price)) throw new InputError("Compare-at price must be at least the selling price.");
  if (!Array.isArray(r.images) || r.images.length > 12) throw new InputError("Use up to 12 images.");
  const images = r.images.filter((value) => value !== "").map(imageUrl);
  if (new Set(images).size !== images.length) throw new InputError("Remove duplicate images.");
  if (!Array.isArray(r.variants) || !r.variants.length || r.variants.length > 60) throw new InputError("Add between 1 and 60 variants.");
  const variants = r.variants.map((raw): VariantInput => {
    const v = raw as Record<string, unknown>;
    if (!v || typeof v !== "object") throw new InputError("Invalid variant.");
    const sku = text(v.sku, 191), size = text(v.size, 50);
    if (!Number.isSafeInteger(v.quantity) || Number(v.quantity) < 0 || Number(v.quantity) > 1000000) throw new InputError("Stock must be a whole number between 0 and 1,000,000.");
    if (typeof v.active !== "boolean") throw new InputError("Invalid variant status.");
    if (v.id && (!Number.isSafeInteger(v.stockVersion) || Number(v.stockVersion) < 0)) throw new InputError("Reload this product to get the latest stock.");
    if (r.wearable && !size) throw new InputError("Enter a size for every wearable variant.");
    return { id: id(v.id, true) ?? undefined, sku, size, price: money(v.price, true), quantity: Number(v.quantity), stockVersion: v.id ? Number(v.stockVersion) : undefined, active: v.active };
  });
  if (r.wearable && new Set(variants.map((v) => v.size.toLowerCase())).size !== variants.length) throw new InputError("Each size must be unique.");
  const variantIds = variants.filter((v) => v.id).map((v) => v.id);
  if (new Set(variantIds).size !== variantIds.length) throw new InputError("Duplicate variant identifiers.");
  const categoryId = id(r.categoryId, true), brandId = id(r.brandId, true);
  if (r.status === "PUBLISHED" && (!categoryId || !images.length || !variants.some((v) => v.active))) throw new InputError("Publishing requires a category, an image and at least one active variant.");
  const videoUrl = text(r.videoUrl, 2048);
  if (videoUrl && (!/^https:\/\//.test(videoUrl) || !/\.(mp4|webm)(\?.*)?$/i.test(videoUrl))) throw new InputError("Use a direct HTTPS MP4 or WebM video URL.");
  return { id: id(r.id, true) ?? undefined, version: Number(r.version), name, slug, categoryId, brandId, price, compareAtPrice,
    status: r.status, wearable: r.wearable, images, variants, videoUrl, fitments,
    description: text(r.description, 30000), highlights: text(r.highlights, 10000), seoTitle: text(r.seoTitle, 255), seoDescription: text(r.seoDescription, 500) };
}
