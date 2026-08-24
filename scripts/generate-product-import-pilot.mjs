import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const pilotDirectory = path.join(projectRoot, "data", "product-import-pilot");
const outputDirectory = path.join(pilotDirectory, "csv");
const raw = JSON.parse(
  await readFile(path.join(pilotDirectory, "raw-products.json"), "utf8"),
);

function csvCell(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(headers, rows) {
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
  ].join("\n") + "\n";
}

function optionColumns(options) {
  return Object.entries(options).slice(0, 3).reduce(
    (columns, [name, value], index) => ({
      ...columns,
      [`option_${index + 1}_name`]: name,
      [`option_${index + 1}_value`]: value,
    }),
    {},
  );
}

const productRows = [];
const variantRows = [];
const priceRows = [];
const productCategoryRows = [];
const fitmentRows = [];
const inventoryRows = [];

for (const record of raw.products) {
  productRows.push({
    source_product_id: record.sourceProductId,
    source_url: record.sourceUrl,
    source_page_type: record.sourcePageType,
    source_confidence: record.sourceConfidence,
    name: record.product.name,
    slug: record.product.slug,
    brand_name: record.product.brandName,
    product_type: record.product.productType,
    publication_status: record.product.publicationStatus,
    short_description: "",
    description_html: "",
    tax_class: "",
    is_dangerous_goods: record.product.isDangerousGoods,
    is_special_order: record.product.isSpecialOrder,
    is_preorder: record.product.isPreorder,
    captured_at: raw.capturedAt,
    capture_method: raw.captureMethod,
    notes: record.product.notes,
  });

  for (const categorySlug of record.product.categorySlugs) {
    productCategoryRows.push({
      source_product_id: record.sourceProductId,
      category_slug: categorySlug,
    });
  }

  for (const variant of record.variants) {
    variantRows.push({
      source_variant_id: variant.sourceVariantId,
      source_product_id: record.sourceProductId,
      sku: variant.sku,
      mpn: variant.mpn,
      supplier_sku: variant.supplierSku,
      barcode: variant.barcode,
      ...optionColumns(variant.options),
      weight_grams: variant.weightGrams,
      length_mm: variant.lengthMm,
      width_mm: variant.widthMm,
      height_mm: variant.heightMm,
      availability_status: variant.availabilityStatus,
    });

    if (variant.price) {
      priceRows.push({
        source_variant_id: variant.sourceVariantId,
        currency: variant.price.currency,
        price_amount: variant.price.amount,
        compare_at_amount: variant.price.compareAtAmount,
        cost_amount: "",
        captured_at: raw.capturedAt,
      });
    }

    inventoryRows.push({
      source_variant_id: variant.sourceVariantId,
      location_code: "",
      quantity: "",
      availability_status: variant.availabilityStatus,
      allow_backorder: variant.allowBackorder,
      captured_at: raw.capturedAt,
    });
  }

  for (const [index, fitment] of record.fitments.entries()) {
    fitmentRows.push({
      source_fitment_id: `${record.sourceProductId}-f${index + 1}`,
      source_product_id: record.sourceProductId,
      source_variant_id: fitment.sourceVariantId,
      make: fitment.make,
      model: fitment.model,
      year_from: fitment.yearFrom,
      year_to: fitment.yearTo,
      fitment_note: fitment.note,
      confidence: fitment.confidence,
    });
  }
}

const files = [
  {
    name: "products.csv",
    headers: [
      "source_product_id",
      "source_url",
      "source_page_type",
      "source_confidence",
      "name",
      "slug",
      "brand_name",
      "product_type",
      "publication_status",
      "short_description",
      "description_html",
      "tax_class",
      "is_dangerous_goods",
      "is_special_order",
      "is_preorder",
      "captured_at",
      "capture_method",
      "notes",
    ],
    rows: productRows,
  },
  {
    name: "variants.csv",
    headers: [
      "source_variant_id",
      "source_product_id",
      "sku",
      "mpn",
      "supplier_sku",
      "barcode",
      "option_1_name",
      "option_1_value",
      "option_2_name",
      "option_2_value",
      "option_3_name",
      "option_3_value",
      "weight_grams",
      "length_mm",
      "width_mm",
      "height_mm",
      "availability_status",
    ],
    rows: variantRows,
  },
  {
    name: "prices.csv",
    headers: [
      "source_variant_id",
      "currency",
      "price_amount",
      "compare_at_amount",
      "cost_amount",
      "captured_at",
    ],
    rows: priceRows,
  },
  {
    name: "product-categories.csv",
    headers: ["source_product_id", "category_slug"],
    rows: productCategoryRows,
  },
  {
    name: "fitments.csv",
    headers: [
      "source_fitment_id",
      "source_product_id",
      "source_variant_id",
      "make",
      "model",
      "year_from",
      "year_to",
      "fitment_note",
      "confidence",
    ],
    rows: fitmentRows,
  },
  {
    name: "inventory.csv",
    headers: [
      "source_variant_id",
      "location_code",
      "quantity",
      "availability_status",
      "allow_backorder",
      "captured_at",
    ],
    rows: inventoryRows,
  },
  {
    name: "media.csv",
    headers: [
      "source_media_id",
      "source_product_id",
      "source_variant_id",
      "role",
      "sort_order",
      "file_path",
      "alt_text",
    ],
    rows: [],
  },
];

const review = {
  reviewStatus: "PILOT_ONLY",
  directCrawlStatus: raw.directCrawlStatus,
  captureMethod: raw.captureMethod,
  capturedAt: raw.capturedAt,
  counts: Object.fromEntries(
    files.map((file) => [file.name, file.rows.length]),
  ),
  coverage: {
    productsWithObservedPrice: new Set(
      priceRows.map((row) => row.source_variant_id),
    ).size,
    productsWithFitment: new Set(
      fitmentRows.map((row) => row.source_product_id),
    ).size,
    variantsWithKnownQuantity: inventoryRows.filter(
      (row) => row.quantity !== "",
    ).length,
    mediaRows: 0,
  },
  limitations: [
    "Cloudflare blocked direct sitemap and product-page crawling.",
    "The pilot uses public search-index records rather than live HTML.",
    "Only observed SKUs are included; missing variant combinations were not invented.",
    "Prices and availability are historical snapshots and require revalidation.",
    "Inventory quantities and locations are unknown.",
    "Descriptions and media are intentionally empty.",
  ],
};

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  ...files.map((file) =>
    writeFile(
      path.join(outputDirectory, file.name),
      toCsv(file.headers, file.rows),
      "utf8",
    ),
  ),
  writeFile(
    path.join(outputDirectory, "review.json"),
    `${JSON.stringify(review, null, 2)}\n`,
    "utf8",
  ),
]);

console.log(
  `Generated ${productRows.length} products, ${variantRows.length} observed variants, ` +
    `${priceRows.length} prices and ${fitmentRows.length} fitment rows.`,
);
console.log("No database records were created or changed.");
