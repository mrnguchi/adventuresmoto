# Adventures Moto

Adventures Moto is a Next.js e-commerce application for adventure motorcycle
equipment, parts, luggage, accessories, tyres and tools.

The expanded catalogue and commerce schema is documented in
[Database schema](docs/database-schema.md), including the screenshot-to-table
mapping, relationships, inventory rules and Hostinger import instructions.
`npm run db:export:schema` generates `prisma/exports/schema.sql` for an empty
database. Existing databases should use migrations rather than that bootstrap file.

## Requirements

- Node.js 24
- npm 11
- Docker with Docker Compose

## Local setup

Create your private local environment file:

```bash
cp .env.example .env.local
```

Replace the application password everywhere it appears, then replace the root
password with a different value. This file is ignored by Git and must never be
committed.

Install the application dependencies:

```bash
npm install
```

Start the local MariaDB database:

```bash
npm run db:up
```

Validate the Prisma configuration and generate the client:

```bash
npm run db:validate
npm run db:generate
```

Start Next.js:

```bash
npm run dev
```

The application runs at [http://localhost:3000](http://localhost:3000). The local
database listens only on `127.0.0.1:3307`.

## Database commands

```bash
npm run db:up
npm run db:down
npm run db:logs
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:migrate:deploy
npm run db:status
npm run db:studio
```

Use `db:migrate` only for local development. Production and staging deployments
must use `db:migrate:deploy`.

The Docker volume preserves local data when `db:down` is run. Do not add the
`--volumes` option unless you intentionally want to delete the local database.

## Database workflow

- `prisma/schema.prisma` defines the canonical data model.
- `prisma/migrations` contains the reviewed SQL migration history.
- `.env.local` points Prisma and Next.js to the local database.
- Hostinger will provide a separate production `DATABASE_URL`.
- Generated Prisma Client files are created during install/build and are not
  committed.

Never run development resets, schema pushes or `migrate dev` against production.

## Project documentation

- [Database discovery audit](docs/database-discovery-audit.md)
