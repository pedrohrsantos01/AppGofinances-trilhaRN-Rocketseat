# Codebase Concerns

**Analysis Date:** Sat Apr 25 2026

## Tech Debt

**Sync enqueue failures are silently ignored:**
- Issue: `src/features/transactions/infra/TransactionRepository.ts` calls `enqueueChange(...).catch(() => {})` after create/update/delete, so failed queue writes do not surface to UI, tests, logs, or retry handling.
- Files: `src/features/transactions/infra/TransactionRepository.ts`, `src/features/sync/application/syncService.ts`, `src/features/sync/infra/SyncQueueRepository.ts`.
- Impact: Local data can change without a corresponding sync mutation, causing permanent cloud divergence.
- Fix approach: Make repository methods fail transactionally when enqueue fails, or persist outbox in the same SQLite transaction and log/alert retryable sync failures.

**Hard-coded sync device id:**
- Issue: `getDeviceId()` returns `"local-device"` for every install.
- Files: `src/features/sync/infra/BffSyncGateway.ts`.
- Impact: Idempotency keys and conflict attribution cannot distinguish devices, which undermines multi-device sync diagnostics.
- Fix approach: Generate and persist a UUID device id in AsyncStorage or SQLite during startup and use it for all sync mutations.

**Remote and local schemas are similar but not identical:**
- Issue: SQLite schema in `src/shared/infra/database/schema.ts` lacks remote fields such as `server_version`, `deleted_at`, `created_by`, `updated_by`, `audit_log`, `open_finance_connections`, and `shared_access`; BFF maps remote `server_version` to local `version` during pull.
- Files: `src/shared/infra/database/schema.ts`, `supabase/migrations/202604240001_architecture_2_core.sql`, `src/features/sync/infra/BffSyncGateway.ts`.
- Impact: Mapping drift can break sync silently as entities evolve.
- Fix approach: Maintain explicit DTO mappers per entity and add migration/schema compatibility tests for each syncable table.

**Open Finance is placeholder-level:**
- Issue: BFF routes return accepted placeholder responses and the provider layer returns empty/default data.
- Files: `apps/api/src/app.ts`, `src/features/open-finance/infra/OpenFinanceProvider.ts`, `src/features/open-finance/application/syncOpenFinance.ts`.
- Impact: UI/domain tests may imply readiness while production integration is not implemented.
- Fix approach: Mark feature as adapter stub in UI/docs, define provider contract, add real consent/callback/token storage flow before exposing as production capability.

**Dependency declared transitively or missing explicitly:**
- Issue: `apps/api/src/app.ts` imports `zod`, but `zod` is not listed directly in `package.json` dependencies/devDependencies.
- Files: `apps/api/src/app.ts`, `package.json`, `package-lock.json`.
- Impact: Future dependency resolution or lockfile changes can break API startup/tests.
- Fix approach: Add `zod` explicitly to `package.json` if request validation remains part of the BFF contract.

## Known Bugs

**Possible incomplete queue coverage outside transactions:**
- Symptoms: Transaction repository explicitly enqueues changes; repositories for accounts, budgets, goals, reminders, and sharing need auditing for equivalent outbox behavior.
- Files: `src/features/transactions/infra/TransactionRepository.ts`, `src/features/accounts/infra/AccountRepository.ts`, `src/features/budget/infra/BudgetRepository.ts`, `src/features/goals/infra/GoalRepository.ts`, `src/features/calendar/infra/ReminderRepository.ts`.
- Trigger: Create/update/delete non-transaction entities while offline, then sync.
- Workaround: Manually verify repository outbox behavior before relying on cloud sync for each feature.

**Month indexing differs between local and remote schemas:**
- Symptoms: `TransactionRepository.listByUser` expects JavaScript month `0-11` and queries SQLite with `month + 1`; remote budgets migration checks `month between 1 and 12`.
- Files: `src/features/transactions/infra/TransactionRepository.ts`, `src/shared/infra/database/schema.ts`, `supabase/migrations/202604240001_architecture_2_core.sql`, `src/features/budget/`.
- Trigger: Passing persisted month values between UI, SQLite, and Supabase without clear conversion.
- Workaround: Keep UI month values explicit and add tests for every month boundary conversion.

## Security Considerations

**Environment secrecy boundary must be preserved:**
- Risk: `.env` exists and may contain secrets; mobile `EXPO_PUBLIC_*` variables are bundled and must not contain private keys.
- Files: `.env`, `.env.example`, `docs/setup-deploy.md`, `src/shared/infra/supabase/client.ts`, `apps/api/src/auth.ts`, `apps/api/src/supabase/database.ts`.
- Current mitigation: `.env.example` documents names only; `docs/setup-deploy.md` warns that `SUPABASE_SERVICE_ROLE_KEY` is server-only and `EXPO_PUBLIC_*` is public.
- Recommendations: Keep `.env` ignored, never log env values, and enforce secret scanning in CI.

**Fastify logger disabled and no production error tracking:**
- Risk: Auth/sync/sharing failures in production may be difficult to diagnose.
- Files: `apps/api/src/app.ts`, `apps/api/src/server.ts`, `src/features/auth/presentation/SignIn.tsx`, `src/features/transactions/presentation/Register.tsx`.
- Current mitigation: Structured HTTP error envelopes exist in `apps/api/src/http/envelope.ts`.
- Recommendations: Enable safe structured BFF logging and add mobile/server error tracking without logging tokens, OAuth responses, or env values.

**Sharing write permissions are incomplete for guests:**
- Risk: Supabase migration grants shared read policies for accounts/transactions, but write/edit sharing semantics need careful RLS expansion before editor features mutate owner data.
- Files: `supabase/migrations/202604240001_architecture_2_core.sql`, `apps/api/src/services/supabaseSharingService.ts`, `src/features/sharing/`.
- Current mitigation: Existing `shared_access_guest_read` and shared read policies are read-only.
- Recommendations: Add explicit editor RLS policies and server-side permission checks before enabling guest writes.

## Performance Bottlenecks

**Large local lists load without pagination:**
- Problem: Transaction dashboard reads all user transactions and renders a FlatList without pagination or list window tuning.
- Files: `src/features/transactions/infra/TransactionRepository.ts`, `src/features/transactions/presentation/useTransactionStore.ts`, `src/features/transactions/presentation/Dashboard.tsx`.
- Cause: `listByUser` returns all user rows unless month filters are passed; dashboard calls `loadTransactions(user.id)` without filters.
- Improvement path: Add pagination/month filters, indexes for local SQLite queries, and FlatList performance props for large datasets.

**Sync pull applies changes sequentially:**
- Problem: Remote changes are applied one-by-one with dynamic SQL.
- Files: `src/features/sync/infra/BffSyncGateway.ts`.
- Cause: `applyRemoteChanges` loops through changes without batching in a SQLite transaction.
- Improvement path: Wrap pull application in a transaction and batch per entity table.

## Fragile Areas

**Auth flow and redirect handling:**
- Files: `src/features/auth/presentation/AuthContext.tsx`, `app.json`, `.env.example`, `docs/setup-deploy.md`.
- Why fragile: Google Expo proxy vs app-scheme redirect handling has branching logic and relies on exact `EXPO_PUBLIC_GOOGLE_REDIRECT_URI` configuration.
- Safe modification: Add tests around redirect URI selection and manual QA for Expo Go, dev client, and standalone builds.
- Test coverage: Unit-level auth session mocks exist, but real OAuth/EAS build behavior needs manual or E2E validation.

**Jest SQLite mock is simplified:**
- Files: `src/__tests__/setup.ts`.
- Why fragile: Mock SQL parser handles only simple insert/select/delete/update paths and comments that update is not fully implemented.
- Safe modification: For complex repository behavior, add repository tests with more realistic SQLite test adapter or targeted mocks.
- Test coverage: Current Jest suite passes, but some SQL edge cases can differ from Expo SQLite runtime.

**Dynamic SQL for sync application:**
- Files: `src/features/sync/infra/BffSyncGateway.ts`.
- Why fragile: `applyRemoteChanges` builds insert/update column lists from remote payload keys.
- Safe modification: Whitelist columns per entity and map DTOs explicitly before constructing SQL.
- Test coverage: Sync gateway tests exist, but new entity fields require mapper tests.

## Scaling Limits

**SQLite-first local data volume:**
- Current capacity: No explicit app-level cap detected.
- Limit: Full table reads and sequential sync will degrade as transaction/history volume grows.
- Scaling path: Add local indexes/migrations, pagination, date-windowed queries, sync cursors per entity, and background sync scheduling.

**BFF sync loop:**
- Current capacity: Processes mutations sequentially per request in `apps/api/src/services/supabaseSyncService.ts`.
- Limit: Large offline queues produce many Supabase round trips and higher conflict latency.
- Scaling path: Batch idempotency lookups, bulk upserts per entity, and limit push batch size with resumable cursors.

## Dependencies at Risk

**Expo/React Native peer dependency complexity:**
- Risk: Docs require `npm ci --legacy-peer-deps`, indicating dependency peer conflicts or strict resolver incompatibility.
- Impact: CI or new developer installs can fail without the flag.
- Migration plan: Periodically run Expo dependency alignment, remove stale packages, and document exact Node/npm versions.

**Detox emulator assumption:**
- Risk: `.detoxrc.js` assumes Android AVD `Pixel_4_API_33`.
- Impact: E2E scripts fail on machines/CI without that exact emulator.
- Migration plan: Document emulator provisioning or configure CI-managed device names.

## Missing Critical Features

**Production observability:**
- Problem: No detected error tracking, metrics, or structured app/server logging.
- Blocks: Reliable production incident triage for auth, sync, and payment-like finance data flows.

**Background/offline sync scheduling:**
- Problem: Queue and manual sync plumbing exist, but no background task scheduler is detected.
- Blocks: Automatic eventual consistency when the user does not open the sync screen.

**Secret scanning and dependency audit workflow:**
- Problem: GitHub workflows exist, but no explicit security audit evidence was inspected in the code map.
- Blocks: Safe maintenance around `.env`, Supabase keys, and old/transitive dependencies.

## Test Coverage Gaps

**E2E not verified during mapping:**
- What's not tested: Real Detox Android run, OAuth in emulator/device, native notifications, native file picker/sharing.
- Files: `.detoxrc.js`, `e2e/smoke/*.test.ts`, `src/features/auth/`, `src/features/calendar/`, `src/features/import-export/`.
- Risk: Native integration regressions can pass Jest/typecheck/lint.
- Priority: Medium.

**Presentation and navigation excluded from coverage:**
- What's not tested: Many UI screens/routes are excluded from coverage collection in `jest.config.js`.
- Files: `jest.config.js`, `src/features/*/presentation/`, `src/navigation/`.
- Risk: UI regressions can pass coverage thresholds.
- Priority: Medium.

**Repository/runtime SQLite edge cases:**
- What's not tested: Real Expo SQLite behavior for complex updates, transactions, WAL, foreign keys, and migrations.
- Files: `src/shared/infra/database/database.ts`, `src/shared/infra/database/schema.ts`, `src/features/*/infra/*Repository.ts`, `src/__tests__/setup.ts`.
- Risk: Simplified mocks can hide runtime SQL issues.
- Priority: High for sync/persistence phases.

## Maintenance Recommendations

1. Add `zod` explicitly to `package.json` and keep BFF validation dependencies direct.
2. Replace hard-coded sync device id with persisted per-install id.
3. Make sync enqueue transactional/observable for all local mutations.
4. Add safe structured logging and error tracking without exposing secrets/tokens.
5. Add repository tests against a closer SQLite adapter for sync-critical persistence.
6. Add paging/filtering and batched sync for large transaction volumes.
7. Keep `.env` values private; use only `.env.example` and docs for variable names.
8. Run `npm run typecheck`, `npm run lint`, `npm test -- --runInBand --ci --no-coverage`, and coverage before changes that touch finance rules or sync.

---

*Concerns audit: Sat Apr 25 2026*
