# Codebase Structure

**Analysis Date:** Sat Apr 25 2026

## Directory Layout

```text
AppGofinances-trilhaRN-Rocketseat/
├── App.tsx                         # Expo app component, providers, bootstrapping
├── index.js                        # Expo root registration
├── src/                            # Mobile application source
│   ├── features/                   # Feature-based mobile modules
│   ├── navigation/                 # Auth/app routes
│   ├── shared/                     # Shared domain, infra, UI, assets, utilities
│   └── __tests__/                  # Mobile/unit/integration Jest tests
├── apps/api/                       # Fastify BFF source and tests
├── supabase/migrations/            # Supabase SQL schema, indexes, RLS policies
├── e2e/                            # Detox smoke tests and config
├── docs/                           # Setup/deploy and feature documentation
├── android/                        # Native Android project generated/maintained for builds
├── ios/                            # Native iOS project generated/maintained for builds
├── .github/workflows/              # CI workflows
├── .husky/                         # Git hooks
├── package.json                    # Dependencies and scripts
├── jest.config.js                  # Jest config
├── eslint.config.mjs               # ESLint flat config
├── metro.config.js                 # Metro SVG transformer config
├── app.json                        # Expo app config
├── eas.json                        # EAS build/submit profiles
└── render.yaml                     # Render BFF deploy config
```

## Directory Purposes

**`src/features/`:**
- Purpose: Mobile business features organized by domain area.
- Contains: `accounts`, `auth`, `budget`, `calendar`, `cashflow`, `goals`, `import-export`, `insights`, `more`, `open-finance`, `resume`, `sharing`, `sync`, `transactions`.
- Key files: `src/features/transactions/presentation/Dashboard.tsx`, `src/features/transactions/application/createTransaction.ts`, `src/features/sync/infra/BffSyncGateway.ts`, `src/features/auth/presentation/AuthContext.tsx`.

**`src/shared/`:**
- Purpose: Shared entities, services, infrastructure, UI, assets, theme, and utility data.
- Contains: `application`, `assets`, `domain`, `infra`, `presentation`, `services`, `utils`, and `@types`.
- Key files: `src/shared/infra/database/database.ts`, `src/shared/infra/database/schema.ts`, `src/shared/infra/http/ApiClient.ts`, `src/shared/infra/supabase/client.ts`, `src/shared/presentation/theme/theme.ts`, `src/shared/utils/categories.ts`.

**`src/navigation/`:**
- Purpose: Route composition and auth gating.
- Contains: `auth.routes.tsx`, `app.routes.tsx`, `index.tsx`.
- Key files: `src/navigation/index.tsx` chooses auth vs app route tree; `src/navigation/app.routes.tsx` defines tab and stack screens.

**`apps/api/src/`:**
- Purpose: Fastify BFF for sync, sharing, Open Finance placeholders, and Supabase access.
- Contains: app/server entry points, auth, HTTP envelope, Supabase database client, services, tests.
- Key files: `apps/api/src/app.ts`, `apps/api/src/server.ts`, `apps/api/src/auth.ts`, `apps/api/src/supabase/database.ts`.

**`supabase/migrations/`:**
- Purpose: Remote Postgres schema and security definitions.
- Contains: `supabase/migrations/202604240001_architecture_2_core.sql`.
- Key files: migration creates tables, indexes, RLS policies, and shared read policies.

**`src/__tests__/`:**
- Purpose: Unit, integration, regression, component, snapshot, and helper tests for mobile/shared code.
- Contains: `unit/`, `integration/`, `helpers/`, `setup.ts`.
- Key files: `src/__tests__/setup.ts`, `src/__tests__/integration/transactionCycle.test.ts`, `src/__tests__/unit/regression/syncConflict.test.ts`.

**`e2e/`:**
- Purpose: Detox E2E smoke coverage.
- Contains: `e2e/jest.config.js`, `e2e/setup.ts`, and `e2e/smoke/*.test.ts`.
- Key files: `e2e/smoke/auth.test.ts`, `e2e/smoke/transaction.test.ts`, `e2e/smoke/resume.test.ts`.

**`docs/`:**
- Purpose: Operational and feature documentation.
- Contains: `docs/setup-deploy.md` and `docs/features/*.md`.
- Key files: `docs/features/sync.md`, `docs/features/accounts.md`, `docs/features/open-finance.md`, `docs/features/sharing.md`.

## Key File Locations

**Entry Points:**
- `index.js`: registers `App.tsx` with Expo.
- `App.tsx`: app providers, fonts, status bar, and route bootstrap.
- `apps/api/src/server.ts`: BFF server listen entry.
- `apps/api/src/app.ts`: BFF route definitions and dependency injection.

**Configuration:**
- `package.json`: dependencies, scripts, lint-staged.
- `tsconfig.json`: extends Expo TS config and enables `strict`.
- `eslint.config.mjs`: Expo/prettier rules and presentation-layer import boundary.
- `.prettierrc.json`: formatting settings.
- `jest.config.js`: Jest preset, mocks, coverage collection, thresholds.
- `.detoxrc.js`: Detox Android app/device/artifact config.
- `e2e/jest.config.js`: Detox Jest environment.
- `metro.config.js`: SVG transformer support.
- `app.json`: Expo app identity and plugins.
- `eas.json`: EAS profiles.
- `render.yaml`: Render BFF deployment.
- `.env.example`: documented environment variable names.

**Core Logic:**
- `src/shared/infra/database/schema.ts`: local SQLite table definitions.
- `src/shared/infra/startup.ts`: local initialization and legacy migration.
- `src/features/transactions/infra/TransactionRepository.ts`: transaction persistence and sync enqueue.
- `src/features/sync/application/syncService.ts`: queue processing.
- `src/features/sync/infra/BffSyncGateway.ts`: push/pull/apply remote sync.
- `apps/api/src/services/supabaseSyncService.ts`: server-side sync merge/idempotency.
- `apps/api/src/services/supabaseSharingService.ts`: server-side sharing.

**Testing:**
- `src/__tests__/setup.ts`: Jest global mocks.
- `src/__tests__/unit/`: unit and regression tests.
- `src/__tests__/integration/transactionCycle.test.ts`: integration transaction flow.
- `apps/api/src/__tests__/`: BFF tests.
- `e2e/smoke/`: Detox smoke tests.

## Naming Conventions

**Files:**
- Screens/components use PascalCase: `Dashboard.tsx`, `Register.tsx`, `AccountList.tsx`, `ScreenHeader/index.tsx`.
- Styled component modules use `Styles.ts` or `styles.ts`: `DashboardStyles.ts`, `Button/styles.ts`.
- Hooks/stores use camelCase with `use`: `useTransactionStore.ts`, `useSyncStore.ts`.
- Domain/application functions use camelCase: `calculateSummary.ts`, `createTransaction.ts`, `getCategoryBreakdown.ts`.
- Repositories/services use PascalCase class names: `TransactionRepository.ts`, `SupabaseSyncService` in `supabaseSyncService.ts`.
- Tests use `.test.ts` or `.test.tsx` and snapshots under `__snapshots__/`.

**Directories:**
- Feature directories use kebab-case for multiword features: `import-export`, `open-finance`.
- Layer directories use lowercase: `domain`, `application`, `infra`, `presentation`.
- Shared component subfolders use PascalCase: `src/shared/presentation/components/HighLightCard/`.

## Where to Add New Code

**New mobile feature:**
- Primary code: create or extend `src/features/<feature>/domain/`, `application/`, `infra/`, and `presentation/`.
- Shared contracts: add cross-feature service contracts under `src/shared/services/contracts/`.
- Tests: add unit tests under `src/__tests__/unit/features/<feature>/` and integration tests under `src/__tests__/integration/`.
- Docs: add or update `docs/features/<feature>.md`.

**New screen/route:**
- Implementation: `src/features/<feature>/presentation/<Screen>.tsx` and `<Screen>Styles.ts`.
- Navigation: register stack/tab route in `src/navigation/app.routes.tsx` or auth route in `src/navigation/auth.routes.tsx`.
- Shared UI: put reusable components under `src/shared/presentation/components/<Component>/`.

**New local persistence model:**
- Schema: add SQLite DDL to `src/shared/infra/database/schema.ts` and include it in `ALL_TABLES`.
- Repository: create `src/features/<feature>/infra/<Entity>Repository.ts`.
- Remote schema: add Supabase migration under `supabase/migrations/`.
- Sync: extend entity mappings in `src/features/sync/infra/BffSyncGateway.ts` and `apps/api/src/services/supabaseSyncService.ts`.

**New BFF endpoint:**
- Route/validation: add to `apps/api/src/app.ts`.
- Service logic: add or extend `apps/api/src/services/` with interface types in `apps/api/src/types.ts`.
- Tests: add BFF tests under `apps/api/src/__tests__/`.

**Utilities:**
- Pure shared logic: `src/shared/application/` or `src/shared/utils/`.
- Domain values/errors: `src/shared/domain/`.
- Platform clients/adapters: `src/shared/infra/`.

## Special Directories

**`android/` and `ios/`:**
- Purpose: Native projects for Expo prebuild/native builds.
- Generated: Partially.
- Committed: Yes.

**`coverage/`:**
- Purpose: Jest coverage artifacts.
- Generated: Yes.
- Committed: Present in tree; avoid using as source of truth for code.

**`node_modules/`:**
- Purpose: Installed dependencies.
- Generated: Yes.
- Committed: No.

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents.
- Generated: Yes.
- Committed: Project-dependent.

---

*Structure analysis: Sat Apr 25 2026*
