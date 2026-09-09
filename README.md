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

## Testing

This project uses [Mocha](https://mochajs.org/), [Chai](https://www.chaijs.com/), and [c8](https://github.com/bcoe/c8) for testing and code coverage.

### Running Tests and Checking Coverage

To execute all tests and generate a code coverage report, use the following command:

```bash
npm test
```

This command will run all test files located in the `test/` directory. After execution, an `html` coverage report will be generated in the `coverage` directory (accessible by opening `coverage/index.html` in your browser), and a summary will be printed directly to the console.

### Current Coverage Status

- `src/config.ts`: 100% statement, branch, function, and line coverage.
- `src/app.ts` and `src/db.ts` currently have no dedicated tests due to challenges with ESM module mocking. This will be addressed in future updates.

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
