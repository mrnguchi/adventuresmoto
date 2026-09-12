import { createHash, randomUUID } from "node:crypto";
import { database } from "./auth";
import { InputError, type ProductInput } from "./product-input";

export async function saveProduct(input: ProductInput, actorId: number) {
  return database().$transaction(async (tx) => {
    const previous = input.id ? await tx.product.findUnique({ where: { id: input.id }, include: { variants: true, options: { include: { attribute: true } } } }) : null;
    if (input.id && (!previous || previous.archivedAt)) throw new InputError("This product is no longer available.");
    if (previous && (previous.version !== input.version || previous.options.length > 1)) throw new InputError("This product changed or uses multiple option groups. Reload before editing.");
    if (previous?.options.some((option) => option.attribute.code !== "size")) throw new InputError("This product uses custom options that this editor cannot yet manage.");
    if (previous?.variants.some((v) => !input.variants.some((item) => item.id === v.id))) throw new InputError("Keep existing variants and disable them instead of deleting their history.");
    if (input.variants.some((v) => v.id && !previous?.variants.some((old) => old.id === v.id))) throw new InputError("A variant does not belong to this product.");
    if (input.categoryId && !await tx.category.findFirst({ where: { id: input.categoryId, archivedAt: null, ...(input.status === "PUBLISHED" ? { status: "PUBLISHED" } : {}) } })) throw new InputError("Select an available, published category before publishing.");
    if (input.brandId && !await tx.brand.findFirst({ where: { id: input.brandId, archivedAt: null } })) throw new InputError("Brand not found.");
    const data = { name: input.name, slug: input.slug, brandId: input.brandId, primaryCategoryId: input.categoryId,
      isWearable: input.wearable, description: input.description || null, imageUrl: input.images[0] ?? null,
      price: input.price, compareAtPrice: input.compareAtPrice || null, status: input.status,
      publishedAt: input.status === "PUBLISHED" ? previous?.publishedAt ?? new Date() : null,
      seoTitle: input.seoTitle || null, seoDescription: input.seoDescription || null };
    let productId: number;
    if (previous) {
      const update = await tx.product.updateMany({ where: { id: previous.id, version: input.version }, data: { ...data, version: { increment: 1 } } });
      if (update.count !== 1) throw new InputError("Another edit was saved. Reload to avoid overwriting it.");
      productId = previous.id;
    } else {
      productId = (await tx.product.create({ data })).id;
    }
    // Preserve additional merchandising categories; the selected one is primary.
    if (input.categoryId) await tx.productCategory.upsert({ where: { productId_categoryId: { productId, categoryId: input.categoryId } }, create: { productId, categoryId: input.categoryId }, update: {} });
    await tx.productMedia.deleteMany({ where: { productId } });
    for (const [displayOrder, url] of input.images.entries()) {
      const storageKey = `catalogue/${createHash("sha256").update(url).digest("hex")}`;
      const asset = await tx.mediaAsset.upsert({ where: { storageKey }, create: {
        storageKey, storageProvider: url.startsWith("/") ? "local" : "external", publicUrl: url,
        originalFileName: url.split("/").at(-1)!.split("?")[0].slice(0, 255), mimeType: "image/unknown", altText: input.name,
      }, update: {} });
      await tx.productMedia.create({ data: { productId, assetId: asset.id, displayOrder, altText: input.name } });
    }
    for (const section of [{ code: "highlights", title: "Product highlights", bullets: input.highlights.split("\n").map((s) => s.trim()).filter(Boolean), videoUrl: null }, { code: "video", title: "Product video", bullets: [], videoUrl: input.videoUrl || null }]) {
      await tx.productSection.upsert({ where: { productId_code: { productId, code: section.code } }, create: { productId, ...section }, update: section });
    }
    // One location in this editor; other locations and their stock are preserved.
    const location = await tx.stockLocation.upsert({ where: { code: "MAIN" }, create: { code: "MAIN", name: "Main warehouse", fulfillsOnline: true }, update: {} });
    await tx.variantOption.deleteMany({ where: { productId } });
    await tx.productOptionValue.deleteMany({ where: { productId } });
    await tx.productOption.deleteMany({ where: { productId } });
    // Clear signatures first to allow exchanging size labels between SKUs.
    await tx.productVariant.updateMany({ where: { productId }, data: { optionSignature: null } });
    const definition = input.wearable ? await tx.attributeDefinition.upsert({ where: { code: "size" }, create: { code: "size", name: "Size" }, update: {} }) : null;
    const option = definition ? await tx.productOption.create({ data: { productId, attributeId: definition.id, label: "Size" } }) : null;
    for (const [displayOrder, v] of input.variants.entries()) {
      const sku = previous?.variants.find((existing) => existing.id === v.id)?.sku ?? `AM-${randomUUID().replaceAll("-", "").toUpperCase()}`;
      const variantData = { productId, sku, size: input.wearable ? v.size : null, name: v.size || null, price: v.price || null,
        isActive: v.active, inStock: v.active && v.quantity > 0, displayOrder,
        optionSignature: createHash("sha256").update(input.wearable ? `size:${v.size.toLowerCase()}` : `sku:${sku.toLowerCase()}`).digest("hex") };
      const variant = v.id ? await tx.productVariant.update({ where: { id: v.id }, data: variantData }) : await tx.productVariant.create({ data: variantData });
      if (option) {
        const value = await tx.productOptionValue.create({ data: { productId, optionId: option.id, code: v.size.toLowerCase(), label: v.size, displayOrder } });
        await tx.variantOption.create({ data: { productId, variantId: variant.id, optionId: option.id, valueId: value.id } });
      }
      const balance = await tx.inventoryBalance.upsert({ where: { variantId_locationId: { variantId: variant.id, locationId: location.id } }, create: { variantId: variant.id, locationId: location.id }, update: {} });
      if (v.id && balance.version !== v.stockVersion) throw new InputError("Stock changed since you opened this product. Reload before saving.");
      if (v.quantity < balance.reserved) throw new InputError(`Stock for ${v.sku} cannot fall below its reserved quantity.`);
      const delta = v.quantity - balance.onHand;
      if (delta) {
        const updated = await tx.inventoryBalance.updateMany({ where: { id: balance.id, version: balance.version }, data: { onHand: v.quantity, version: { increment: 1 } } });
        if (updated.count !== 1) throw new InputError("Stock changed during this edit. Reload and try again.");
        await tx.inventoryMovement.create({ data: { inventoryId: balance.id, delta, reason: "Admin product stock adjustment", reference: randomUUID(), actorId } });
      }
    }
    await tx.auditEvent.create({ data: { actorId, action: previous ? "product.update" : "product.create", entityType: "Product", entityId: String(productId), changes: { name: input.name, status: input.status, variantCount: input.variants.length } } });
    return productId;
  }, { timeout: 20000 });
}
