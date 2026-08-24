import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { brands } from "../src/data/brands.ts";
import { featuredBrands } from "../src/data/featured-brands.ts";
import { shopCategories } from "../src/data/shop-categories.ts";
import {
  expectedMimeTypeForFile,
  readLocalMedia,
  writeJson,
} from "./catalogue-seed-utils.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const seedDirectory = path.join(projectRoot, "prisma", "seed-data");

const featuredAliases = new Map([
  ["/brands/advmoto", "/brands/advworx"],
  ["/brands/doubletake-mirror", "/brands/doubletake-mirrors"],
]);

const categoryDefinitions = [
  {
    name: "Riding Gear",
    slug: "riding-gear",
    parentSlug: null,
    imageTitle: null,
    displayOrder: 10,
  },
  {
    name: "Parts",
    slug: "parts",
    parentSlug: null,
    imageTitle: null,
    displayOrder: 20,
  },
  {
    name: "Luggage",
    slug: "luggage",
    parentSlug: null,
    imageTitle: "Luggage",
    displayOrder: 30,
  },
  {
    name: "Accessories",
    slug: "accessories",
    parentSlug: null,
    imageTitle: null,
    displayOrder: 40,
  },
  {
    name: "Tyres",
    slug: "tyres",
    parentSlug: null,
    imageTitle: "Tyres",
    displayOrder: 50,
  },
  {
    name: "Tools",
    slug: "tools",
    parentSlug: null,
    imageTitle: null,
    displayOrder: 60,
  },
  {
    name: "Men's Jackets",
    slug: "mens-jackets",
    parentSlug: "riding-gear",
    imageTitle: "Men's Jackets",
    displayOrder: 10,
  },
  {
    name: "Men's Pants",
    slug: "mens-pants",
    parentSlug: "riding-gear",
    imageTitle: "Men's Pants",
    displayOrder: 20,
  },
  {
    name: "Women's Jackets",
    slug: "womens-jackets",
    parentSlug: "riding-gear",
    imageTitle: "Women's Jackets",
    displayOrder: 30,
  },
  {
    name: "Women's Pants",
    slug: "womens-pants",
    parentSlug: "riding-gear",
    imageTitle: "Women's Pants",
    displayOrder: 40,
  },
  {
    name: "Helmets",
    slug: "helmets",
    parentSlug: "riding-gear",
    imageTitle: "Helmets",
    displayOrder: 50,
  },
  {
    name: "Boots",
    slug: "boots",
    parentSlug: "riding-gear",
    imageTitle: "Boots",
    displayOrder: 60,
  },
];

const redirects = [
  {
    sourcePath: "/brands/advmoto",
    destinationPath: "/brands/advworx",
    httpStatus: 301,
    preserveQueryString: true,
    isActive: true,
    note: "Corrects the former featured-brand label and link.",
    archivedAt: null,
  },
  {
    sourcePath: "/brands/doubletake-mirror",
    destinationPath: "/brands/doubletake-mirrors",
    httpStatus: 301,
    preserveQueryString: true,
    isActive: true,
    note: "Preserves the former singular featured-brand link.",
    archivedAt: null,
  },
];

const currentCategoriesByTitle = new Map(
  shopCategories.map((category) => [category.title, category]),
);
const featuredRankByHref = new Map(
  featuredBrands.map((brand, index) => [
    featuredAliases.get(brand.href) ?? brand.href,
    (index + 1) * 10,
  ]),
);
const mediaByStorageKey = new Map();
const warnings = [];

async function registerMedia(publicUrl, altText) {
  const { record } = await readLocalMedia(projectRoot, publicUrl, altText);
  const existingRecord = mediaByStorageKey.get(record.storageKey);

  if (existingRecord) {
    return existingRecord.storageKey;
  }

  mediaByStorageKey.set(record.storageKey, record);

  const expectedMimeType = expectedMimeTypeForFile(record.originalFileName);

  if (expectedMimeType && expectedMimeType !== record.mimeType) {
    warnings.push({
      code: "FILE_EXTENSION_MIME_MISMATCH",
      record: record.storageKey,
      detail: `The extension suggests ${expectedMimeType}, but the file contains ${record.mimeType} data.`,
    });
  }

  return record.storageKey;
}

// I snapshot the current UI data here so database imports never depend directly
// on presentation components that may change later.
const brandRecords = [];

for (const brand of brands) {
  const logoStorageKey = await registerMedia(
    brand.image,
    `${brand.name} logo`,
  );
  const featuredDisplayOrder = featuredRankByHref.get(brand.href) ?? 0;

  brandRecords.push({
    name: brand.name,
    slug: brand.href.replace("/brands/", ""),
    shortDescription: null,
    description: null,
    websiteUrl: null,
    seoTitle: null,
    seoDescription: null,
    isFeatured: featuredDisplayOrder > 0,
    displayOrder: featuredDisplayOrder,
    status: "DRAFT",
    publishedAt: null,
    logoStorageKey,
    alternateLogoStorageKey: null,
    heroStorageKey: null,
    archivedAt: null,
  });
}

const categoryRecords = [];

for (const category of categoryDefinitions) {
  const currentCategory = category.imageTitle
    ? currentCategoriesByTitle.get(category.imageTitle)
    : null;

  if (category.imageTitle && !currentCategory) {
    throw new Error(`Missing homepage category: ${category.imageTitle}`);
  }

  const imageStorageKey = currentCategory
    ? await registerMedia(currentCategory.image, currentCategory.alt)
    : null;

  categoryRecords.push({
    name: category.name,
    slug: category.slug,
    parentSlug: category.parentSlug,
    shortDescription: null,
    description: null,
    seoTitle: null,
    seoDescription: null,
    displayOrder: category.displayOrder,
    status: "DRAFT",
    publishedAt: null,
    imageStorageKey,
    archivedAt: null,
  });
}

const review = {
  reviewStatus: "REVIEW_REQUIRED",
  sourceClassification:
    "Provisional snapshot of the current local presentation data",
  authoritativeExportRequired: true,
  counts: {
    mediaAssets: mediaByStorageKey.size,
    brands: brandRecords.length,
    featuredBrands: brandRecords.filter((brand) => brand.isFeatured).length,
    categories: categoryRecords.length,
    redirects: redirects.length,
  },
  normalizations: [
    {
      from: "ADVmoto",
      to: "ADVWORX",
      sourcePath: "/brands/advmoto",
      destinationPath: "/brands/advworx",
      reason:
        "The current logo and source-store brand page identify the brand as ADVWORX.",
    },
    {
      from: "Doubletake Mirror",
      to: "Doubletake Mirrors",
      sourcePath: "/brands/doubletake-mirror",
      destinationPath: "/brands/doubletake-mirrors",
      reason:
        "The current source-store brand page uses the plural canonical name.",
    },
  ],
  excludedAssets: [
    {
      path: "images/brands/brand-10001.png",
      reason:
        "This is a site/Adventure Moto logo and is not referenced by the local brand directory mapping.",
    },
    {
      path: "images/brands/brand-10002.png",
      reason:
        "This is a Merlin logo, but Merlin is absent from the local brand data. It requires confirmation from an authoritative export.",
    },
    {
      path: "images/brands/brand-10228.svg",
      reason:
        "This is a close icon placed in the brand folder, not a catalogue logo.",
    },
  ],
  warnings,
  importGates: [
    "Reconcile brand names and legacy IDs against an authoritative store export.",
    "Approve the initial canonical category hierarchy.",
    "Confirm that the local brand and category artwork may be reused.",
    "Choose the production media-storage provider; local-public paths are only the initial development source.",
    "Resolve or deliberately accept every warning in this review file.",
    "Change reviewStatus to APPROVED only after the preceding checks are complete.",
  ],
};

await mkdir(seedDirectory, { recursive: true });
await Promise.all([
  writeJson(
    path.join(seedDirectory, "media-assets.json"),
    [...mediaByStorageKey.values()].sort((left, right) =>
      left.storageKey.localeCompare(right.storageKey),
    ),
  ),
  writeJson(path.join(seedDirectory, "brands.json"), brandRecords),
  writeJson(path.join(seedDirectory, "categories.json"), categoryRecords),
  writeJson(path.join(seedDirectory, "redirects.json"), redirects),
  writeJson(path.join(seedDirectory, "review.json"), review),
]);

console.log(
  `Prepared ${review.counts.brands} brands, ${review.counts.categories} categories, ` +
    `${review.counts.mediaAssets} media assets and ${review.counts.redirects} redirects.`,
);
console.log("No database records were created or changed.");
