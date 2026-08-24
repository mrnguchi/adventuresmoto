import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  expectedMimeTypeForFile,
  readLocalMedia,
} from "./catalogue-seed-utils.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const seedDirectory = path.join(projectRoot, "prisma", "seed-data");
const errors = [];
const warnings = [];

async function readJson(fileName) {
  return JSON.parse(
    await readFile(path.join(seedDirectory, fileName), "utf8"),
  );
}

function requireUnique(records, field, collectionName) {
  const seen = new Set();

  for (const record of records) {
    const value = record[field];

    if (seen.has(value)) {
      errors.push(`${collectionName} contains a duplicate ${field}: ${value}`);
    }

    seen.add(value);
  }
}

function isSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

const [mediaAssets, brands, categories, redirects, review] =
  await Promise.all([
    readJson("media-assets.json"),
    readJson("brands.json"),
    readJson("categories.json"),
    readJson("redirects.json"),
    readJson("review.json"),
  ]);

requireUnique(mediaAssets, "storageKey", "media assets");
requireUnique(brands, "name", "brands");
requireUnique(brands, "slug", "brands");
requireUnique(categories, "slug", "categories");
requireUnique(redirects, "sourcePath", "redirects");

const mediaByStorageKey = new Map(
  mediaAssets.map((asset) => [asset.storageKey, asset]),
);
const categoriesBySlug = new Map(
  categories.map((category) => [category.slug, category]),
);

for (const asset of mediaAssets) {
  if (asset.storageProvider !== "local-public") {
    errors.push(
      `Unexpected storage provider for ${asset.storageKey}: ${asset.storageProvider}`,
    );
    continue;
  }

  try {
    const current = (
      await readLocalMedia(projectRoot, asset.publicUrl, asset.altText)
    ).record;

    for (const field of ["storageKey", "mimeType", "byteSize", "checksum"]) {
      if (current[field] !== asset[field]) {
        errors.push(
          `${asset.storageKey} has stale ${field} metadata (${asset[field]} != ${current[field]}).`,
        );
      }
    }

    const expectedMimeType = expectedMimeTypeForFile(asset.originalFileName);

    if (expectedMimeType && expectedMimeType !== asset.mimeType) {
      warnings.push(
        `${asset.storageKey}: extension suggests ${expectedMimeType}, contents are ${asset.mimeType}.`,
      );
    }
  } catch (error) {
    errors.push(`${asset.storageKey}: ${error.message}`);
  }
}

for (const brand of brands) {
  if (!isSlug(brand.slug)) {
    errors.push(`Invalid brand slug: ${brand.slug}`);
  }

  if (!mediaByStorageKey.has(brand.logoStorageKey)) {
    errors.push(
      `Brand ${brand.name} references missing media ${brand.logoStorageKey}.`,
    );
  }

  if (brand.status !== "DRAFT") {
    errors.push(
      `Provisional brand ${brand.name} must remain DRAFT before import approval.`,
    );
  }
}

for (const category of categories) {
  if (!isSlug(category.slug)) {
    errors.push(`Invalid category slug: ${category.slug}`);
  }

  if (
    category.parentSlug &&
    !categoriesBySlug.has(category.parentSlug)
  ) {
    errors.push(
      `Category ${category.slug} has missing parent ${category.parentSlug}.`,
    );
  }

  if (category.parentSlug === category.slug) {
    errors.push(`Category ${category.slug} cannot be its own parent.`);
  }

  if (
    category.imageStorageKey &&
    !mediaByStorageKey.has(category.imageStorageKey)
  ) {
    errors.push(
      `Category ${category.slug} references missing media ${category.imageStorageKey}.`,
    );
  }

  if (category.status !== "DRAFT") {
    errors.push(
      `Provisional category ${category.name} must remain DRAFT before import approval.`,
    );
  }

  const ancestors = new Set([category.slug]);
  let parentSlug = category.parentSlug;

  while (parentSlug) {
    if (ancestors.has(parentSlug)) {
      errors.push(`Category hierarchy cycle detected at ${category.slug}.`);
      break;
    }

    ancestors.add(parentSlug);
    parentSlug = categoriesBySlug.get(parentSlug)?.parentSlug ?? null;
  }
}

for (const redirect of redirects) {
  if (!redirect.sourcePath.startsWith("/")) {
    errors.push(`Redirect source must begin with /: ${redirect.sourcePath}`);
  }

  if (
    !redirect.destinationPath.startsWith("/") &&
    !/^https?:\/\//.test(redirect.destinationPath)
  ) {
    errors.push(
      `Redirect destination is not a path or URL: ${redirect.destinationPath}`,
    );
  }

  if (![301, 302, 307, 308].includes(redirect.httpStatus)) {
    errors.push(
      `Unsupported redirect status ${redirect.httpStatus} for ${redirect.sourcePath}.`,
    );
  }

  if (redirect.sourcePath === redirect.destinationPath) {
    errors.push(`Redirect loops to itself: ${redirect.sourcePath}`);
  }
}

const actualCounts = {
  mediaAssets: mediaAssets.length,
  brands: brands.length,
  featuredBrands: brands.filter((brand) => brand.isFeatured).length,
  categories: categories.length,
  redirects: redirects.length,
};

for (const [name, count] of Object.entries(actualCounts)) {
  if (review.counts[name] !== count) {
    errors.push(
      `Review count for ${name} is stale (${review.counts[name]} != ${count}).`,
    );
  }
}

if (!["REVIEW_REQUIRED", "APPROVED"].includes(review.reviewStatus)) {
  errors.push(`Unsupported review status: ${review.reviewStatus}`);
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
    `Seed validation passed: ${actualCounts.brands} brands, ` +
      `${actualCounts.categories} categories, ${actualCounts.mediaAssets} media assets, ` +
      `${actualCounts.redirects} redirects.`,
  );
  console.log(`Review status: ${review.reviewStatus}`);
  console.log("No database records were created or changed.");
}
