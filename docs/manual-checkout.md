# Cart and manual checkout

Customers can add a selected product/size, edit quantities, remove items and
open `/cart`. Cart contents are stored in MariaDB, identified by a hashed secret
in an HTTP-only cookie lasting 30 days. Guest checkout is supported. Signing in
prefills contact details; a browser cart is not a cross-device account cart.

Checkout at `/checkout` collects contact details, a delivery address and notes.
The summary shows the item subtotal in AUD, delivery to be confirmed and no amount
due now. Customers explicitly accept that this is an unpaid order request.

Submission rechecks published/active products, actual online inventory and prices.
Price changes require a fresh review; insufficient stock requires a cart update.
Money is calculated in integer cents and saved as decimal snapshots. The server
does not accept client totals. No stock is deducted or reserved for an unconfirmed
request. Cart limits are 30 distinct items and 99 units per item. Products without
actual inventory balances cannot be ordered, even if a legacy inStock flag is set.

A transaction saves the order, items and two email jobs, then clears the cart.
The cart revision is the idempotency key: repeating the same checkout returns the
same order. Requests from another cart cannot retrieve it. Order references are
displayed after submission. Guests should keep that reference; customer order
history and permanent receipt pages are not part of this release.

## Email setup

Set these private variables in `.env.local` and in the deployment environment:

```dotenv
SMTP_ENABLED=true
SMTP_HOST=your-mail-provider-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=orders@your-domain.com
ORDER_EMAIL_TO=your-order-inbox@your-domain.com
```

Restart Next.js after changing them. Use port 465 for implicit TLS, or 587 for
STARTTLS. Certificate validation stays enabled. The from address must be allowed
by the provider. Credentials are never sent to the browser. Transport settings
follow the [Nodemailer SMTP documentation](https://nodemailer.com/smtp).

Both messages include the reference, all item names/SKUs/options, quantities,
prices, subtotal, contact details, delivery address and notes. They explicitly
state that no payment was taken. The store notification uses the customer email
as reply-to. When disabled/unconfigured, messages remain pending. Checkout still
succeeds and the request stays in admin; the customer is not told an email was sent.

SMTP is attempted after the database commit. Failures are recorded and can be
retried under **Admin → Orders → order → Retry pending emails**. Successfully
sent jobs are skipped. This release uses immediate delivery plus manual retries,
not a scheduled background worker. A worker can be added later. SMTP cannot give
exactly-once delivery: if delivery succeeds but the acknowledgement is lost, a
retry may send a second copy. The order itself remains unique.

## Admin workflow

Orders require `orders.manage` permission. Admin can view customer details and
immutable item snapshots, check mail status and record these stages:

- Pending confirmation
- Awaiting payment
- Paid — confirmed manually
- Completed
- Cancelled

Paid means an administrator verified an external payment; this is not a payment
gateway transaction. Status edits are audited and reject stale updates. They do
not send payment instructions, calculate final delivery charges, or adjust stock.
Confirm the final payable amount and arrange payment with the customer directly.
Adjust inventory when fulfilling the order. Existing order `grandTotal` currently
holds the item estimate; `policySnapshot.shippingPending` marks delivery unresolved.

## Operations and checks

Apply migration `20260912010000_manual_checkout`, generate Prisma and restart the
server. It is already applied locally. The schema export also includes it.

`node scripts/test-checkout.mjs` checks a local server on port 3000 using temporary
products, inventory, carts and orders. SMTP must be disabled. It tests isolation,
quantities/removal, stock limits, stale prices, snapshots, duplicate retries, queued
email records and clearing the cart, then deletes only its own fixtures.

Order attempts are throttled per email. Before public launch, add gateway-level
rate limits for cart creation and checkout abuse, configure SMTP, test actual
delivery, and verify the store's shipping/tax copy. Keep database backups: emails
are notifications rather than the authoritative order record.
