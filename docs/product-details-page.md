# Product details UI

Product cards navigate to `/products/[slug]`. The route reads published,
non-archived products using the existing schema. Unknown products return the
not-found view; query failures offer retry. No database migration is introduced.

Review the page without a database at `/products/preview`. This explicitly labelled,
no-index preview uses the project's existing jacket image and sample prices/stock.
It does not create a catalogue record.

The shared view includes a gallery with thumbnails and an image dialog, title,
brand, selected SKU and copy action, AUD pricing, available/unavailable variant
choices, quantity, stock information, and expandable description, video, reviews,
and delivery/returns sections. Layout adapts to a single column on mobile.

`ProductDetails` is the presentation contract for future catalogue work. Optional
gallery images, description paragraphs, feature sections, a size chart, a direct
video URL and related products can be supplied without changing the page layout.
The current database only provides one image, price, brand and basic variants;
unsupported content is not fabricated. Size charts only appear when supplied for
wearable products. Local store inventory and payment-provider promises are not
assumed from the reference screenshots.

Cart/checkout integration is deferred: selecting an available option enables the
button, which explains that ordering is not available yet instead of claiming an
item was added. Wishlist selection is temporary UI state for the current visit.
Reviews are a placeholder section, not a submission form. The future schema/admin
discussion should cover product media, option combinations, specifications,
related products/colours, inventory locations, size charts, reviews and policies.
