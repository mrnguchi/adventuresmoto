# Category storefront

`/store` displays all published products. `/collections/[...slug]` handles the
existing homepage, menu and footer category links using one shared template.
Category URL aliases and database slugs are mapped in `src/lib/store-categories.ts`.
Unknown paths return 404. Parent collections include published descendants.

## Database setup

1. Configure `.env` using `.env.example` with your local credentials.
2. Start the database with `npm run db:up`.
3. Apply migrations with `npm run db:migrate:deploy` and run `npm run db:generate`.
4. Import reviewed category and product records. Categories must use the slugs in
   `storeCategories`, have `PUBLISHED` status, and have the appropriate parent IDs.
   Products must have `PUBLISHED` status and links through `ProductCategory`.

Prices are AUD decimal amounts. `compareAtPrice` is optional. Product images use
`imageUrl` (a public image URL or local `/images/...` path). Variant records carry
unique SKUs, optional sizes, and explicit stock availability. Only in-stock sizes
appear on cards and in size filters. Products without available variants are out
of stock. Sale collections include products priced below their compare-at price.

No draft pilot records are published or imported automatically. No database
credentials are committed. When DATABASE_URL is absent the store shows a catalogue
unavailable state; connection/query errors use a retry boundary.

Filtering, sorting and pagination currently run in the browser on the category's
published products. For a large catalogue, move these operations to paginated
database queries. Cards link to `/products/[slug]`; see `product-details-page.md`.
Help uses the existing phone contact. The existing garage component is reused;
fitment filtering is not added.

Filters are category-aware: wearable collections expose Size; non-wearable and
mixed all-product/sale collections omit it. `hasWearableSizes` defines the wearable
category policy. All collections expose Brand, In Stock / Out of Stock, and a
two-handle AUD price range based on actual catalogue prices. Selecting both stock
options includes both statuses. Price limits are inclusive, use cents internally,
and reset along with all other filters. Empty collections have no invented prices.
