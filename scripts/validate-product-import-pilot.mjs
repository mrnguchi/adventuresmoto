import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const pilotDirectory = path.join(projectRoot, "data", "product-import-pilot");
const outputDirectory = path.join(pilotDirectory, "csv");
const raw = JSON.parse(
  await readFile(path.join(pilotDirectory, "raw-products.json"), "utf8"),
);
const review = JSON.parse(
  await readFile(path.join(outputDirectory, "review.json"), "utf8"),
);
const errors = [];
const warnings = [];
const productIds = new Set();
const variantIds = new Set();
const skus = new Set();
const slugs = new Set();
const allowedAvailabilityStatuses = new Set([
  "IN_STOCK",
  "OUT_OF_STOCK",
  "SPECIAL_ORDER",
  "MIXED_OR_UNKNOWN",
  "UNKNOWN",
]);

function isMoney(value) {
  return /^\d+\.\d{2}$/.test(value);
}

for (const record of raw.products) {
  if (productIds.has(record.sourceProductId)) {
    errors.push(`Duplicate source product ID: ${record.sourceProductId}`);
  }
  productIds.add(record.sourceProductId);

  if (slugs.has(record.product.slug)) {
    errors.push(`Duplicate product slug: ${record.product.slug}`);
  }
  slugs.add(record.product.slug);

  if (!record.sourceUrl.startsWith("https://www.adventuremoto.com.au/")) {
    errors.push(`Unexpected source URL: ${record.sourceUrl}`);
  }

  if (record.product.publicationStatus !== "DRAFT") {
    errors.push(`${record.sourceProductId} must remain DRAFT.`);
  }

  if (!record.product.name || !record.product.brandName) {
    errors.push(`${record.sourceProductId} is missing its name or brand.`);
  }

  if (record.variants.length === 0) {
    errors.push(`${record.sourceProductId} has no observed variants.`);
  }

  for (const variant of record.variants) {
    if (variantIds.has(variant.sourceVariantId)) {
      errors.push(`Duplicate source variant ID: ${variant.sourceVariantId}`);
    }
    variantIds.add(variant.sourceVariantId);

    if (!variant.sku) {
      errors.push(`${variant.sourceVariantId} is missing its required SKU.`);
    } else if (skus.has(variant.sku.toLowerCase())) {
      errors.push(`Duplicate SKU: ${variant.sku}`);
    }
    skus.add(variant.sku.toLowerCase());

    if (!allowedAvailabilityStatuses.has(variant.availabilityStatus)) {
      errors.push(
        `${variant.sourceVariantId} has unsupported availability ${variant.availabilityStatus}.`,
      );
    }

    if (variant.price) {
      if (variant.price.currency !== "AUD") {
        errors.push(`${variant.sourceVariantId} does not use AUD.`);
      }

      if (!isMoney(variant.price.amount)) {
        errors.push(`${variant.sourceVariantId} has an invalid price.`);
      }

      if (
        variant.price.compareAtAmount &&
        (!isMoney(variant.price.compareAtAmount) ||
          Number(variant.price.compareAtAmount) < Number(variant.price.amount))
      ) {
        errors.push(
          `${variant.sourceVariantId} has an invalid compare-at price.`,
        );
      }
    } else {
      warnings.push(`${variant.sourceVariantId} has no observed price.`);
    }
  }

  for (const fitment of record.fitments) {
    if (
      fitment.yearFrom !== null &&
      fitment.yearTo !== null &&
      fitment.yearFrom > fitment.yearTo
    ) {
      errors.push(
        `${record.sourceProductId} has a reversed fitment year range.`,
      );
    }

    if (fitment.confidence === "LOW") {
      warnings.push(
        `${record.sourceProductId} contains low-confidence fitment that must not be published.`,
      );
    }
  }

  if (record.sourcePageType === "category-listing") {
    warnings.push(
      `${record.sourceProductId} came from a listing rather than a canonical product page.`,
    );
  }
}

if (raw.products.length < 10 || raw.products.length > 20) {
  errors.push("The pilot must contain between 10 and 20 products.");
}

if (review.counts["products.csv"] !== raw.products.length) {
  errors.push("products.csv count does not match the raw pilot.");
}

if (review.counts["variants.csv"] !== variantIds.size) {
  errors.push("variants.csv count does not match the raw pilot.");
}

if (review.coverage.mediaRows !== 0) {
  errors.push("The image-free pilot must not contain media rows.");
}

for (const warning of warnings) {
  console.warn(`WARNING: ${warning}`);
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`ERROR: ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Pilot validation passed: ${productIds.size} products and ${variantIds.size} observed variants.`,
  );
  console.log(
    `${review.coverage.productsWithObservedPrice} variants have observed prices; ` +
      `${review.coverage.productsWithFitment} products have fitment records.`,
  );
  console.log("No database records were created or changed.");
}
