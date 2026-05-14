# Contributing to FarmConnect SA

## Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL + Redis)
- Fly CLI (for deployment)
- A Clickatell sandbox account (for WhatsApp testing)

## Local Setup

```bash
# 1. Clone and install
git clone https://github.com/farmconnect-sa/platform.git
cd platform
npm install

# 2. Start dependencies
docker compose up -d   # PostgreSQL + Redis

# 3. Configure environment
cp .env.example .env
# Fill in .env — see docs/ENV_VARS.md for descriptions

# 4. Initialise database
npm run db:migrate
npm run db:seed

# 5. Start development servers
npm run dev            # Starts API (port 3000) + Web (port 5173) concurrently
npm run dev:worker     # Start BullMQ worker (separate terminal)
```

## Project Structure

```
Claude_Farm/
├── apps/
│   ├── api/           Express.js / TypeScript backend
│   └── web/           React / Vite / TailwindCSS frontend
├── packages/
│   └── shared/        Shared TypeScript types
├── docs/              Reference documentation
└── scripts/           DB seeding, migrations, utilities
```

## Workflow

1. Branch from `main`: `git checkout -b feat/your-feature`
2. Make changes, write tests
3. Run checks: `npm run check` (type check + lint + test)
4. Open a PR — must pass CI before merge
5. Merge to `main` auto-deploys to staging

## Code Standards

- **TypeScript strict mode** — no `any` types
- **Zod** for all runtime input validation at API boundaries
- **No comments** unless the WHY is non-obvious; code should be self-documenting
- **Services handle business logic** — controllers are thin (validate → delegate → respond)
- **All DB writes go through Prisma transactions** where atomicity matters

## Testing

```bash
npm run test           # Unit tests (vitest)
npm run test:e2e       # E2E tests (playwright) — requires running dev server
npm run test:coverage  # Coverage report
```

Test files live next to the code they test: `payment.service.ts` → `payment.service.test.ts`.

For payment and notification services, use the mock clients in `src/lib/__mocks__/`.

## Database Changes

```bash
# Create a new migration
npm run db:migrate:create --name=add_something

# Apply pending migrations
npm run db:migrate

# Reset local DB (destructive — local only)
npm run db:reset
```

Never edit existing migration files. Always create a new migration.

## Environment Variables

See `.env.example` for the full list with descriptions. Never commit `.env`.

Secrets for staging/production are managed in Fly.io:
```bash
fly secrets set VARIABLE_NAME=value --app farmconnect-api
```

## Deployment

Staging deploys automatically on merge to `main`.

Production deploys are manual and require explicit confirmation:
```bash
fly deploy --app farmconnect-api --config apps/api/fly.toml
fly deploy --app farmconnect-worker --config apps/worker/fly.toml
```

Always run `npm run db:migrate` against staging before production, and verify the staging deployment is healthy first.

## Reporting Issues

- Bugs: GitHub Issues with reproduction steps
- Security vulnerabilities: email security@farmconnect.co.za (do not open public issues)
- Payment or data issues: tag `@ops-team` in the relevant Slack channel
