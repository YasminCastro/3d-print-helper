# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a monorepo with three independent projects (no shared tooling, no workspace manager):

- `frontend/` — Next.js 16 app (App Router). This is the actual working application: a self-contained 3D-printing tracker (printers, filaments/brands, calibrations, prints, journal) with its own embedded SQLite database. **It does not call the backend.**
- `backend/` — Express 5 + TypeScript API boilerplate (DI via `tsyringe`, JWT auth, users CRUD). Currently a standalone scaffold (auth/users only) and not wired to the frontend — no fetch/HTTP calls between the two projects exist today. Treat it as its own project when working in it.
- `mobile/` — empty, not yet started.

Always `cd` into the relevant project directory before running commands; there is no root `package.json`.

## Frontend (`frontend/`)

Architecture: Next.js Server Actions + `better-sqlite3`, no separate API layer.

- `lib/db.ts` — single SQLite connection (`data/print-helper.db`). Schema is defined and migrated imperatively at startup via `CREATE TABLE IF NOT EXISTS` + ad-hoc `ALTER TABLE ... ADD COLUMN` checks in this same file (no migration framework). When changing the data model, add both the `CREATE TABLE` column and a corresponding backfill/`ALTER TABLE` block here.
- `lib/actions/*.ts` — one file per domain entity (printers, filaments, brands, calibrations, prints, journal, settings), each exporting Server Actions that read/write the DB directly and are called from client components.
- `lib/schemas/*.ts` — Zod schemas per entity, used for form/action validation.
- `lib/types/*.ts` — TypeScript types per entity, mirrors the schemas.
- `lib/print-calculations.ts` / `lib/cost-benefit.ts` — derived-value logic (print cost, sale value, profit) recalculated via `recalculatePrintCalculations`, invoked both on write and during DB backfill in `db.ts`.
- `app/<entity>/` — route per domain entity; each pairs with a `components/<entity>-page-content.tsx`, `<entity>-card.tsx`, `<entity>-form-dialog.tsx`/`-form-fields.tsx`, `-details-dialog.tsx` set.
- `components/ui/` — shadcn/ui primitives.
- Prints relate to filaments many-to-many via `print_filaments` (with `grams`/`position`), and to printers/categories many-to-one.

Conventions (from `frontend/AGENTS.md` / `frontend/CLAUDE.md`):
- Always use **shadcn/ui** for UI components and **lucide-react** for icons.
- This project pins a newer Next.js than the training-data version — check `node_modules/next/dist/docs/` for API/convention changes before writing Next.js-specific code, and watch for deprecation notices.

Commands (run from `frontend/`):
```
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint
```
No test suite is currently configured for the frontend.

## Backend (`backend/`)

Layered Express structure: `routes` → `controllers` → `services` → `repositories`, with `dtos`/`interfaces`/`entities` for typing and `tsyringe` for dependency injection. Errors flow through `exceptions/httpException.ts` and `middlewares/error.middleware.ts`; requests are validated via `middlewares/validation.middleware.ts`. Swagger docs are generated from JSDoc comments in `src/controllers/*.ts` plus `swagger.yaml`, served at `/api-docs`.

Only `auth` and `users` domains exist so far.

Commands (run from `backend/`):
```
npm run dev            # nodemon, ts via tsconfig-paths
npm run dev:watch      # tsx watch, alternative dev runner
npm run build           # tsc + tsc-alias
npm run lint             # biome lint
npm run check            # biome check
npm run format           # biome format --write
npm test                  # jest --watch (all tests)
npm run test:unit         # jest --watch, unit tests only (src/test/unit)
npm run test:e2e          # jest --watch, e2e tests only (src/test/e2e)
```
To run a single test file, pass a path to jest directly, e.g. `npx jest --config jest.config.cjs src/test/unit/services/users.service.spec.ts` (drop `--watch` for a one-shot run).

Deployment: `Dockerfile.dev`/`Dockerfile.prod`, `docker-compose.yml`, `nginx.conf`, and `ecosystem.config.js` (PM2, via `npm run deploy:dev`/`deploy:prod`) are present for this project.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
