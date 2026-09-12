# Customer accounts

The storefront Account button opens the existing styled modal. Customers can
register with first name, last name, email and a 12–128 character password. They
must confirm the password and accept the terms. Registration signs them in.

Login uses email and password. While signed in, Account shows a profile form for
names and an optional phone number, plus logout. Email is read-only until email
verification and a secure email-change workflow are implemented.

Passwords use salted scrypt hashes. Customer sessions use a separate HTTP-only
cookie and store only the token hash in `customer_sessions`, with a seven-day
expiry. Logout revokes the database session. Disabled users and expired sessions
are rejected. Registration cannot assign roles; customer sessions do not grant
access to the admin dashboard. Profile updates derive ownership from the session,
never a user ID supplied by the browser. Mutation requests require same-origin JSON.

Authentication allows six attempts per email in a fifteen-minute window; successful
authentication clears that counter. Production should additionally apply gateway
rate limits to protect against distributed signup/login abuse. Serve over HTTPS
and preserve the public request origin through the reverse proxy.

Email verification, email password recovery, social login, and account deletion
are not implemented in this release. Social buttons are hidden. Password recovery
clearly states that email reset is unavailable; it does not pretend to send mail.
New accounts remain unverified (`emailVerifiedAt` is null). Wishlist, orders and
garage persistence are separate features; being signed in alone does not implement them.

Apply `20260912000000_customer_sessions` with `npm.cmd run db:migrate:deploy`, then
`npm.cmd run db:generate` and restart Next.js. The migration is already applied to
the local database. The schema export includes this migration for fresh imports.

Run `node scripts/test-customer-auth.mjs` with the local development server on
port 3000. It exercises registration, duplicates, hashing, profile ownership,
admin isolation, login/logout, expiry, disabled users and throttling. It creates
and removes its own temporary account. Never point this check at production.
