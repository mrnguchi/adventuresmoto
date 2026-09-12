# Admin dashboard

Open `/admin/login` and use the account created with `npm.cmd run admin:create`.
Start the app with `npm.cmd run dev`. The MariaDB service must be running and
`DATABASE_URL` in `.env.local` must point to the migrated database.

## Catalogue workflow

1. Create categories and brands from their sidebar pages. A category may have a parent.
2. Open **Products → Add product**. Enter a name, URL slug, description and features.
3. Upload JPEG, PNG or WebP images (5 MB each), or add HTTPS image URLs. The first
   image is the card cover; reorder images with the arrow buttons. Direct MP4/WebM
   video links are supported.
4. Set **Price (AUD)** and **On-hand stock**. SKUs are generated automatically on
   save and retained on edits. For clothing, enable wearable sizes and use **Add
   size** to track stock for each size. All new sizes use the product price.
   **Sale pricing** optionally adds a crossed-out original price. Existing separate
   option prices are preserved, with a button to use the product price instead.
5. Select category and brand. Save as **Draft** to keep the product private, or
   **Published** to show it in the store. Publishing requires a category, image and
   active variant. Zero stock is allowed and appears as out of stock.
6. Use **View in storefront** after publishing. New categories are available at
   `/collections/<slug>`; the homepage/header's curated category links remain separately maintained.

The overview shows live catalogue counts. Products support search, status filters,
pagination, editing and archiving. Archiving preserves records and removes the
product from public listings. Inventory lists location balances; the product editor
adjusts **Main warehouse** only. Reserved units cannot be removed. Activity records
show catalogue changes and the responsible administrator.

Product and inventory versions reject stale saves. Reload the editor if another
change was made. Disable existing variants instead of deleting their history.
The first editor supports one size group or simple non-wearable variants; it rejects
existing custom/multiple option groups to preserve their data.

## Authentication and deployment

Authentication uses the existing scrypt password hashes, role permissions,
database-backed sessions, HTTP-only cookies and same-origin mutation checks.
Sessions expire after eight hours and are revoked at sign-out. Six login attempts
per email are permitted per 15-minute window. Disabled users cannot access the admin.

Apply `20260911000000_admin_sessions` using `npm.cmd run db:migrate:deploy` on another
environment, then generate Prisma with `npm.cmd run db:generate`. Never copy local
credentials into source control. Production must serve HTTPS and preserve the
public request origin through the reverse proxy.

Local uploads are stored in `public/images/uploads`. A SQL backup does **not** include
these files. Before deployment, use persistent media storage or an external image
host and include media in backups; a deployment that replaces the app directory
may remove local uploads. Unused uploads are not automatically deleted.

This release focuses on catalogue management. Orders/payments, review moderation,
staff management, size-chart editing, fitment, related products, multi-option
editing and media lifecycle management still need their own admin screens.

## Verification

`node scripts/test-admin-integration.mjs` is an opt-in check against the local
database and a running development server on port 3000. It creates a temporary
admin/category/product, exercises authentication and catalogue mutations, and
removes those exact records and its uploaded file. It requires an existing ADMIN
role. Do not run it against a database that contains valuable test-fixture records
from an interrupted prior run without inspecting those records first.

Also run `npm.cmd run lint`, `npm.cmd run build` and
`node --test scripts/passwords.test.mjs`.
