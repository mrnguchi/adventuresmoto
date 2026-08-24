# Catalogue foundation seed review

These files are a provisional, reviewable snapshot of the catalogue information
already present in the Adventures Moto repository.

They are **not** an authoritative export from the existing store and must not be
treated as production catalogue data yet.

## Files

- `media-assets.json` contains metadata for dashboard-managed brand and category
  artwork. Static interface assets such as the site logo, favicon, loader and
  footer icons are deliberately excluded. Its `local-public` storage paths are
  the initial development source, not a final production upload strategy.
- `brands.json` contains the current local brand-directory entries.
- `categories.json` contains only the six high-confidence top-level shopping
  categories and the six riding-gear categories represented by homepage cards.
- `redirects.json` preserves two corrected featured-brand aliases.
- `review.json` records provenance, normalizations, warnings and the gates that
  must be cleared before import.

All provisional brands and categories remain in `DRAFT` state.

## Commands

```bash
npm run seed:prepare
npm run seed:validate
```

`seed:prepare` recreates these snapshots from the current local presentation
data. `seed:validate` checks uniqueness, relationships, hierarchy cycles, local
files, MIME types, sizes and checksums.

Neither command connects to or changes the database.

## Import gate

We will add and run the database import only after:

1. an authoritative brand/category export is reconciled;
2. the canonical category hierarchy is approved;
3. media reuse rights are confirmed;
4. the production media-storage provider is chosen;
5. every warning in `review.json` is resolved or deliberately accepted; and
6. `reviewStatus` is changed from `REVIEW_REQUIRED` to `APPROVED`.
