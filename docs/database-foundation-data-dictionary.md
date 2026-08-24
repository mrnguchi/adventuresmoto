# Database foundation data dictionary

This document defines the first small database slice for Adventures Moto. It is
based on the catalogue, media and migration requirements identified in the
discovery audit.

## Shared conventions

- Integer IDs are the internal database keys.
- `publicId` values are stable identifiers that can be exposed by APIs without
  exposing sequential database IDs.
- Slugs are lowercase, URL-safe values and are unique where they define a public
  route.
- Dates are stored in UTC with millisecond precision.
- `createdAt` and `updatedAt` provide the basic audit trail.
- Catalogue records are archived instead of being deleted during normal
  administration.
- Stored files do not live in MySQL. `MediaAsset` stores only the metadata needed
  to locate, describe and validate a file.

## MediaAsset

Represents an image or other reusable file stored locally, on object storage or
through a CDN.

| Field | Purpose |
| --- | --- |
| `id` | Internal integer primary key |
| `publicId` | Stable public identifier |
| `storageProvider` | Storage service, such as `local`, `s3` or `cloudinary` |
| `storageKey` | Unique path/key used by the storage provider |
| `publicUrl` | Optional resolved public or CDN URL |
| `originalFileName` | Original uploaded filename |
| `mimeType` | File MIME type |
| `altText` | Accessible description for images |
| `caption` | Optional editorial caption |
| `width`, `height` | Optional pixel dimensions |
| `byteSize` | Optional file size in bytes |
| `checksum` | Optional SHA-256 checksum used to detect duplicate or damaged files |
| `createdAt`, `updatedAt` | Audit timestamps |
| `archivedAt` | Marks a file as unavailable for new assignments without erasing its history |

### Relationships and deletion

- A media asset can be used as the logo, alternate logo or hero image for many
  brands, and as the image for many categories.
- Normal removal archives the record and removes the underlying file only after
  reference and retention checks.
- If an unreferenced media row is hard-deleted, nullable brand and category media
  references are set to `NULL` so no parent record is accidentally deleted.

## Brand

Represents a manufacturer or commercial brand and its public landing-page
content.

| Field | Purpose |
| --- | --- |
| `id` | Internal integer primary key |
| `publicId` | Stable public identifier |
| `name` | Canonical, unique brand name |
| `slug` | Canonical, unique URL slug |
| `shortDescription` | Concise text for cards and summaries |
| `description` | Full landing-page content |
| `websiteUrl` | Optional official brand website |
| `seoTitle`, `seoDescription` | Search metadata |
| `isFeatured` | Whether the brand is eligible for featured-brand placements |
| `displayOrder` | Manual ordering within equally ranked brand lists |
| `status` | `DRAFT` or `PUBLISHED` |
| `publishedAt` | When the brand was first or most recently published |
| `logoAssetId` | Primary logo |
| `alternateLogoAssetId` | Alternate logo for different backgrounds/layouts |
| `heroAssetId` | Brand landing-page hero/banner |
| `createdAt`, `updatedAt` | Audit timestamps |
| `archivedAt` | Soft-removal timestamp |

### Relationships and deletion

- Media relationships are optional because content may be drafted before its
  artwork is ready.
- A brand is archived instead of deleted. Product relations added in a later
  migration will prevent hard deletion while catalogue records still use it.

## Category

Represents the canonical product taxonomy. Navigation menus will be modelled
separately so the same category can appear in several menus without being
duplicated.

| Field | Purpose |
| --- | --- |
| `id` | Internal integer primary key |
| `publicId` | Stable public identifier |
| `parentId` | Optional parent category |
| `name` | Display name |
| `slug` | Globally unique canonical URL slug |
| `shortDescription` | Concise card/listing text |
| `description` | Full category landing-page content |
| `seoTitle`, `seoDescription` | Search metadata |
| `displayOrder` | Ordering among sibling categories |
| `status` | `DRAFT` or `PUBLISHED` |
| `publishedAt` | Publication timestamp |
| `imageAssetId` | Optional category artwork |
| `createdAt`, `updatedAt` | Audit timestamps |
| `archivedAt` | Soft-removal timestamp |

### Relationships and deletion

- `parentId` creates the canonical category tree.
- Global slug uniqueness gives each category one unambiguous public route and
  supports the audit recommendation to consolidate duplicate categories.
- Application validation must prevent a category from becoming its own ancestor.
- Categories are archived instead of deleted.
- The database blocks hard deletion of a category that still has children.
- Deleting an unused media asset sets `imageAssetId` to `NULL`.

## Redirect

Preserves old links and renamed routes during migration and future catalogue
changes.

| Field | Purpose |
| --- | --- |
| `id` | Internal integer primary key |
| `publicId` | Stable public identifier |
| `sourcePath` | Unique incoming path, beginning with `/` and excluding the domain |
| `destinationPath` | Internal destination path or approved absolute URL |
| `httpStatus` | Redirect status, normally `301`, `302`, `307` or `308` |
| `preserveQueryString` | Whether incoming query parameters should be retained |
| `isActive` | Allows a redirect to be disabled without deleting it |
| `note` | Optional migration or administrative context |
| `createdAt`, `updatedAt` | Audit timestamps |
| `archivedAt` | Soft-removal timestamp |

### Relationships and deletion

- Redirects deliberately store paths rather than foreign keys. This preserves a
  redirect even if its destination content is renamed again.
- `sourcePath` values are normalized before saving so duplicate legacy routes do
  not compete.
- Routine removal disables or archives a redirect. Hard deletion is reserved for
  incorrect, unused records.

## Deferred from this migration

The following remain intentionally outside this first slice:

- products, variants, options, product-category assignments and product media;
- navigation and menu placement;
- motorcycle fitment and customer garage records;
- inventory, pricing, carts, orders and fulfilment;
- users, roles, sessions and authentication-provider tables;
- generic media assignments and editorial content blocks.

They will reference this foundation in later, separately reviewed migrations.
