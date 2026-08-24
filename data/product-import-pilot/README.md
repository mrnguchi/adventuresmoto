# Product import pilot

This is an image-free, database-free pilot used to test the structure of future
product imports.

## Important limitation

The source site's `robots.txt` permits crawling with a one-second delay and
advertises a sitemap. However, Cloudflare returned a managed `403` challenge for
both the sitemap and ordinary product pages from the development environment.

We did not attempt to bypass that protection.

The raw pilot therefore uses factual catalogue information visible through
public search-index records. It is suitable for testing our CSV relationships,
but it is not a substitute for a live, authoritative export or approved crawl.

## Files

- `raw-products.json` preserves source URLs, provenance, confidence and observed
  product facts.
- `csv/products.csv` contains shared product records.
- `csv/variants.csv` contains observed sellable SKUs and options.
- `csv/prices.csv` contains observed AUD prices.
- `csv/product-categories.csv` connects products to canonical category slugs.
- `csv/fitments.csv` contains motorcycle make, model and year ranges.
- `csv/inventory.csv` carries availability while intentionally leaving unknown
  quantities and locations blank.
- `csv/media.csv` is header-only because images are excluded from this phase.
- `csv/review.json` summarizes coverage and limitations.

Descriptions are empty, all products are `DRAFT`, and uncertain values remain
blank rather than being guessed.

## Commands

```bash
npm run pilot:generate
npm run pilot:validate
```

Neither command connects to the database.

## Requirements for a complete crawl

At least one of the following is needed before a full automated crawl:

1. the crawler's IP or user agent is allowlisted by the site owner;
2. an accessible sitemap or HTML snapshot is provided;
3. a catalogue feed/API is supplied; or
4. the owner supplies another approved machine-readable export.
