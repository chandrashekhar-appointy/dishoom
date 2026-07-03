# Dishoom CRUD POC

Dishoom is a tiny Express + Postgres app for testing secret delivery into
ephemeral environments. The database connection is read from `DATABASE_URL` at
runtime and is intentionally not committed to the repository.

## Local Run

```bash
npm install
cp .env.example .env
npm run migrate
npm run dev
```

## API

- `GET /health`
- `GET /dishes`
- `POST /dishes` with `{ "name": "Ruby Chicken", "notes": "Test row" }`
- `GET /dishes/:id`
- `PUT /dishes/:id` with `{ "name": "...", "notes": "..." }`
- `DELETE /dishes/:id`

## Vercel Env POC

For the E2B sandbox POC, store the DB URL in a linked Vercel project as
`DATABASE_URL`, then let the sandbox clone this repo and run:

```bash
vercel link --yes --project <vercel-project-name>
vercel env pull .env.local --environment development
cp .env.local .env
npm install
npm run migrate
npm run crud:test
```

This proves the sandbox can obtain runtime config from Vercel project identity
without committing DB credentials to GitHub. Treat `.env.local` and any Vercel
auth/OIDC material as sensitive.
