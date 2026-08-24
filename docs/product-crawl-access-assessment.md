# Product crawl access assessment

Assessment date: 28 July 2026

## Crawl rules

The public `robots.txt` applies a one-second crawl delay to general crawlers and
disallows account, cart, supplier, search, AJAX and filtered/paginated query
routes. It advertises:

`http://www.adventuremoto.com.au/sitemap_index.xml.gz`

The pilot must avoid the disallowed routes and wait at least one second between
requests if direct access becomes available.

## Access result

The development environment could read `robots.txt`, but Cloudflare returned an
HTTP `403` managed challenge for:

- the advertised sitemap; and
- an ordinary public product page.

The response explicitly required JavaScript and cookies. We stopped there and
did not attempt to imitate a browser, solve the challenge or bypass the
protection.

## Safe interim approach

A 15-product pilot was assembled from public search-index records. It records
only factual catalogue fields needed to test our data model and excludes copied
descriptions and images.

This pilot can validate:

- product/variant separation;
- option combinations;
- prices and compare-at prices;
- availability versus actual stock quantity;
- category assignments;
- motorcycle fitment ranges;
- special-order and gift-certificate cases; and
- incomplete-data handling.

It cannot validate live completeness, every variant SKU, current prices,
location inventory, product media or complete descriptions.

## Full-crawl gate

A complete crawl requires approved machine-readable access, such as an
allowlisted crawler, accessible sitemap/HTML snapshot, catalogue feed or export.
Until then, public search-index data must remain a non-authoritative pilot only.
