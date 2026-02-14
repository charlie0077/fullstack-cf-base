# my-hono-app

Full-stack app built with **Hono** + **React** running on **Cloudflare Workers**.

**Stack:** Hono, React 19, tRPC, Better Auth, Knex + PostgreSQL (via Hyperdrive), Tailwind CSS v4, Vite

---

## Prerequisites

- [Bun](https://bun.sh) (package manager & runtime)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`bun add -g wrangler`)
- PostgreSQL database (local for dev, hosted for prod — e.g. Neon, Supabase, AWS RDS)
- A Cloudflare account with Workers enabled

---

## Local Development

### 1. Install dependencies

```sh
bun install
```

### 2. Set up a local PostgreSQL database

```sh
createdb myapp_dev
```

Or with Docker:

```sh
docker run -d --name myapp-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=myapp_dev -p 5432:5432 postgres
```

### 3. Configure environment variables

```sh
cp .env.example .env
```

Edit `.env` with your local database connection string:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/myapp_dev
```

### 4. Run migrations

```sh
bun run migrate
```

### 5. Start the dev server

```sh
bun run dev
```

This starts both the client (http://localhost:5173) and server (http://localhost:8787) concurrently.

---

## Production Setup (Cloudflare Workers)

### 1. Provision a PostgreSQL database

Use any hosted PostgreSQL provider (Neon, Supabase, AWS RDS, etc.). Get your connection string:

```
postgres://user:password@host:5432/dbname
```

### 2. Create a Hyperdrive instance

Hyperdrive is Cloudflare's connection pooler for databases. Create one linked to your production database:

```sh
wrangler hyperdrive create my-db --connection-string="postgres://user:password@host:5432/dbname"
```

This outputs a Hyperdrive ID. Update `wrangler.jsonc` with it:

```jsonc
"hyperdrive": [
  {
    "binding": "HYPERDRIVE",
    "id": "<your-hyperdrive-id>"
  }
]
```

> **Note:** Hyperdrive caching should be disabled to prevent stale auth queries:
>
> ```sh
> wrangler hyperdrive update <your-hyperdrive-id> --caching-disabled true
> ```

### 3. Run production migrations

Create `.env.prod` from the example:

```sh
cp .env.prod.example .env.prod
```

Set `DATABASE_URL` to your **direct** database connection string (not Hyperdrive — migrations run from your local machine):

```
DATABASE_URL=postgres://user:password@host:5432/dbname
```

Then run:

```sh
bun run migrate:prod
```

### 4. Push secrets to Cloudflare

Add the required secrets to `.env.prod`:

```
DATABASE_URL=postgres://user:password@host:5432/dbname
BETTER_AUTH_SECRET=<random-string-32-chars-or-more>
BETTER_AUTH_URL=https://your-worker.your-subdomain.workers.dev
CLIENT_URL=https://your-worker.your-subdomain.workers.dev
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Then push all secrets at once:

```sh
bun run secrets:push
```

This reads `.env.prod` and runs `wrangler secret bulk` under the hood.

> **OAuth is optional.** Leave `GITHUB_*` and `GOOGLE_*` empty if you only need email/password auth.

### 5. Deploy

```sh
bun run deploy
```

This builds both client and server, then deploys to Cloudflare Workers.

---

## Scripts Reference

| Script | Description |
|---|---|
| `bun run dev` | Start client + server in dev mode |
| `bun run build` | Build client and server for production |
| `bun run preview` | Build and run locally with `wrangler dev` |
| `bun run deploy` | Build and deploy to Cloudflare Workers |
| `bun run test` | Run tests (Vitest, watch mode) |
| `bun run test:run` | Run tests once |
| `bun run lint` | Lint with ESLint |
| `bun run migrate` | Run migrations against local dev DB |
| `bun run migrate:prod` | Run migrations against production DB |
| `bun run migrate:rollback` | Rollback last migration (dev) |
| `bun run migrate:rollback:prod` | Rollback last migration (prod) |
| `bun run migrate:make` | Create a new migration file |
| `bun run secrets:push` | Push `.env.prod` secrets to Cloudflare |
| `bun run cf-typegen` | Regenerate `CloudflareBindings` types from `wrangler.jsonc` |

---

## Project Structure

```
├── client/              # React SPA (Vite + React Router)
│   └── src/
│       ├── components/  # UI components (shadcn/ui)
│       ├── hooks/       # React hooks (useAuth, etc.)
│       ├── lib/         # API client, auth utilities
│       └── pages/       # Route pages
├── server/              # Hono backend
│   ├── db/
│   │   ├── knexfile.ts  # Knex config (dev + prod)
│   │   └── migrations/  # Database migrations
│   ├── features/        # Feature modules (users, hello)
│   ├── lib/             # Auth setup (better-auth)
│   ├── middleware/       # Auth, logging, error handling
│   └── trpc/            # tRPC router & procedures
├── scripts/             # Deployment utilities
├── wrangler.jsonc       # Cloudflare Workers config
├── vite.config.ts       # Client build config
└── vite.config.server.ts # Server build config (Workers)
```

---

## Scheduled Tasks (Cron)

A cron trigger is configured in `wrangler.jsonc` to run every hour (`0 * * * *`). The handler is the `scheduled` export in `server/index.tsx`. Edit it to add your own scheduled jobs.

Test cron locally:

```sh
curl "http://localhost:8787/__scheduled?cron=0+*+*+*+*"
```
