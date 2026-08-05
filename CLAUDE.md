# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a monorepo with three projects (no shared tooling, no workspace manager):

- `frontend/` — Next.js 16 app (App Router). The UI for a 3D-printing tracker (printers, filaments/brands, calibrations, prints, journal, extra items). Holds no data itself: every domain read/write goes through Server Actions in `lib/actions/*.ts` that call the backend's REST API over HTTP.
- `backend/` — Express 5 + TypeScript API (DI via `tsyringe`, JWT auth), backed by Postgres via Prisma. Owns all domain data and business logic; the frontend is just a client of it.
- `mobile/` — empty, not yet started.

Always `cd` into the relevant project directory before running commands; there is no root `package.json`.

## Testing policy

Do not manually test changes by running the app, dev servers, or ad-hoc shell/curl commands — the user tests everything locally themselves. Limit verification to:
- TypeScript validation (e.g. `tsc`/`npm run build` type-checking) for both frontend and backend.
- Writing/running Jest tests in `backend/` (this is the only project with a test suite configured).

## Frontend (`frontend/`)

Architecture: Next.js Server Actions as a thin client over the backend REST API — no local database, no separate API route layer of its own (aside from binary passthrough routes, see below).

- `lib/backend-url.ts` — builds backend URLs from `BACKEND_API_URL` (e.g. `http://localhost:4000/api/v1`); throws if unset.
- `lib/backend-fetch.ts` — `backendFetch(path, init)` wraps `fetch`, attaching the `Authorization` cookie as a `Bearer` header. All backend calls should go through this.
- `lib/actions/*.ts` — one file per domain entity (printers, filaments, brands, calibrations, prints, journal, extra-items, auth), each exporting Server Actions that call `backendFetch` and call `refresh()` (from `next/cache`) after mutations.
- `lib/schemas/*.ts` — Zod schemas per entity, used for form/action validation before payloads are sent to the backend.
- `lib/types/*.ts` — TypeScript types per entity, mirroring the backend's DTOs.
- `lib/print-calculations.ts` / `lib/cost-benefit.ts` — derived-value display logic (print cost, sale value, profit) on the frontend side.
- `app/<entity>/` — route per domain entity under the `(app)` route group (auth-gated); `(auth)` group holds `login`/`signup`. Each entity pairs with a `components/<entity>-page-content.tsx`, `<entity>-card.tsx`, `<entity>-form-dialog.tsx`/`-form-fields.tsx`, `-details-dialog.tsx` set.
- `app/journal-photos/[id]/route.ts` and `app/print-photos/[id]/route.ts` — Route Handlers that proxy binary image data (photos stored as bytes in Postgres) from the backend for `<img>` tags.
- `components/ui/` — shadcn/ui primitives.
- Auth: JWT stored in an `Authorization` cookie, set by `lib/actions/auth.ts` and read by `backend-fetch.ts` on every request.

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
No test suite is currently configured for the frontend. Requires `BACKEND_API_URL` set (see `.env.example`) pointing at the backend's `/api/v1` prefix.

## Backend (`backend/`)

Layered Express structure: `routes` → `controllers` → `services` → `repositories`, with `dtos`/`interfaces`/`entities` for typing and `tsyringe` for dependency injection. Errors flow through `exceptions/httpException.ts` and `middlewares/error.middleware.ts`; requests are validated via `middlewares/validation.middleware.ts`. Swagger docs are generated from JSDoc comments in `src/controllers/*.ts` plus `swagger.yaml`, served at `/api-docs`.

Data layer: Postgres via Prisma (`prisma/schema.prisma`, migrations in `prisma/migrations/`). Prisma client is generated into `src/generated/prisma/` (custom output path — not the default `node_modules/.prisma`). After editing `schema.prisma`, run `npm run db:generate` then `npm run db:migrate` to create a migration.

Domains: `auth`, `users`, `printers`, `filaments` (+ `filament-brands`), `calibrations`, `journal` (entries/attempts/photos), `prints` (+ `print-categories`, many-to-many `print_filaments`/`print_extra_items`), `extra-items`. All domain records are scoped to the owning `userId` (JWT-authenticated) with `onDelete: Cascade`/`SetNull` relations as appropriate — mirrors the frontend's entity list one-to-one.

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
npm run db:generate       # regenerate Prisma client
npm run db:migrate        # create + apply a dev migration
npm run db:deploy         # apply pending migrations (prod)
npm run db:studio         # Prisma Studio
```
To run a single test file, pass a path to jest directly, e.g. `npx jest --config jest.config.cjs src/test/unit/services/users.service.spec.ts` (drop `--watch` for a one-shot run).

Requires `DATABASE_URL` (Postgres) and `SECRET_KEY` (JWT) set — see `.env`. `ORIGIN`/`CORS_ORIGIN_LIST` must include the frontend's URL for CORS to allow it.

## Docker

`docker-compose.yml` at the repo root runs all three pieces together for local dev: `postgres` (data), `backend` (build context `./backend`, `Dockerfile.dev`, port 4000), `frontend` (build context `./frontend`, `Dockerfile.dev`, port 3000). The frontend container talks to the backend via the service name (`http://backend:4000/api/v1`), not `localhost`. Backend also has its own `Dockerfile.prod`, `nginx.conf`, and `ecosystem.config.js` (PM2, via `npm run deploy:dev`/`deploy:prod`) for deployment.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
