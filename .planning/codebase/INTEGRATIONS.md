# External Integrations

**Analysis Date:** Sat Apr 25 2026

## APIs & External Services

**Authentication:**
- Google OAuth - mobile login in `src/features/auth/presentation/AuthContext.tsx`.
  - SDK/Client: `expo-auth-session`, `expo-web-browser`, Supabase `signInWithIdToken`.
  - Auth config: `EXPO_PUBLIC_GOOGLE_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_REDIRECT_URI` from `.env.example`.
- Apple Sign In - iOS-only login in `src/features/auth/presentation/AuthContext.tsx` and `src/features/auth/presentation/SignIn.tsx`.
  - SDK/Client: `expo-apple-authentication`, Supabase `signInWithIdToken`.
  - Auth config: Supabase Auth provider settings documented in `docs/setup-deploy.md`.

**Backend-for-Frontend:**
- GoFinances BFF - mobile sync and sharing API consumed through `src/shared/infra/http/ApiClient.ts`, `src/shared/infra/http/createApiClient.ts`, `src/features/sync/infra/BffSyncGateway.ts`, and sharing repositories.
  - SDK/Client: custom `ApiClient` wrapping `fetch`.
  - Auth: Bearer Supabase access token from `getSupabaseClient().auth.getSession()`.
  - Base URL: `EXPO_PUBLIC_API_BASE_URL` from `.env.example`.
- Fastify API - endpoints in `apps/api/src/app.ts`: `/health`, `/v1/me`, `/v1/sync/push`, `/v1/sync/pull`, `/v1/sharing/invites`, `/v1/sharing/:id/revoke`, `/v1/open-finance/consents`, `/v1/open-finance/sync`.

**Open Finance:**
- Placeholder/adaptable provider layer in `src/features/open-finance/infra/OpenFinanceProvider.ts` and BFF placeholder routes in `apps/api/src/app.ts`.
  - Current behavior: BFF routes return accepted placeholder data; provider returns empty/default responses.
  - Auth: Future provider credentials not present in documented env names.

## Data Storage

**Databases:**
- Local SQLite - source of truth for mobile reads.
  - Location: `expo-sqlite` database `gofinances.db` opened by `src/shared/infra/database/database.ts`.
  - Schema: `src/shared/infra/database/schema.ts` creates `accounts`, `credit_cards`, `transactions`, `invoices`, `budgets`, `reminders`, `goals`, and `sync_queue`.
- Supabase Postgres - remote sync/share storage.
  - Migration: `supabase/migrations/202604240001_architecture_2_core.sql` creates business tables, `shared_access`, `open_finance_connections`, `sync_mutations`, `audit_log`, indexes, and RLS policies.
  - Client: `@supabase/supabase-js` in `apps/api/src/supabase/database.ts` with user Authorization header to preserve RLS.
  - Connection vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY` documented in `.env.example`.

**File Storage:**
- Local filesystem/document sharing only for CSV import/export through `expo-document-picker`, `expo-file-system`, and `expo-sharing` under `src/features/import-export/`.
- Supabase Storage is not detected.

**Caching:**
- AsyncStorage stores auth user and legacy transaction data in `src/features/auth/presentation/AuthContext.tsx` and `src/shared/infra/startup.ts`.
- No external cache service is detected.

## Authentication & Identity

**Auth Provider:**
- Supabase Auth.
  - Mobile client: `src/shared/infra/supabase/client.ts` creates a client from `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`, persists sessions in AsyncStorage, and disables URL session detection.
  - Google/Apple login: `src/features/auth/presentation/AuthContext.tsx` exchanges OAuth identity tokens with Supabase.
  - BFF auth: `apps/api/src/auth.ts` validates Bearer tokens with `supabase.auth.getUser(token)`.
  - Route gating: `src/navigation/index.tsx` switches between `AuthRoutes` and `AppRoutes` based on `user.id`.

## Monitoring & Observability

**Error Tracking:**
- No Sentry, Bugsnag, Datadog, or equivalent production error tracking detected.

**Logs:**
- BFF startup logs fatal errors to `console.error` in `apps/api/src/server.ts`.
- Mobile login and register flows use `console.log` in `src/features/auth/presentation/AuthContext.tsx`, `src/features/auth/presentation/SignIn.tsx`, and `src/features/transactions/presentation/Register.tsx`.
- Fastify logger is disabled with `Fastify({ logger: false })` in `apps/api/src/app.ts`.

## CI/CD & Deployment

**Hosting:**
- Render for BFF via `render.yaml`.
- EAS for mobile builds and submissions via `eas.json`.
- Supabase for Auth and Postgres via `supabase/migrations/` and setup docs.

**CI Pipeline:**
- GitHub Actions workflows are present at `.github/workflows/pr-gate.yml` and `.github/workflows/nightly.yml`.
- Husky pre-commit hook exists at `.husky/pre-commit`; lint-staged settings are in `package.json`.

## Environment Configuration

**Required env vars:**
- Mobile public variables: `EXPO_PUBLIC_GOOGLE_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_REDIRECT_URI`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_BASE_URL`.
- Server variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, optional `PORT`, optional `HOST`.

**Secrets location:**
- `.env` exists in the root and must not be read or committed.
- `render.yaml` marks Supabase server env vars with `sync: false`.
- `docs/setup-deploy.md` warns that `EXPO_PUBLIC_*` values are bundled and that `SUPABASE_SERVICE_ROLE_KEY` must stay server-only.

## Webhooks & Callbacks

**Incoming:**
- No provider webhook endpoints detected.
- OAuth redirect uses app scheme `gofinances` in `app.json` and redirect URI handling in `src/features/auth/presentation/AuthContext.tsx`.

**Outgoing:**
- Mobile sends sync and sharing requests to the BFF through `src/shared/infra/http/ApiClient.ts`.
- BFF sends Supabase Auth and Postgres requests through `apps/api/src/auth.ts` and `apps/api/src/supabase/database.ts`.

---

*Integration audit: Sat Apr 25 2026*
