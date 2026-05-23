# Architecture

**Analysis Date:** Sat Apr 25 2026

## Pattern Overview

**Overall:** Offline-first Expo mobile app with feature-based layered modules plus Node/Fastify BFF and Supabase remote persistence.

**Key Characteristics:**
- Mobile reads and writes primarily against local SQLite in `src/shared/infra/database/database.ts` and feature repositories under `src/features/*/infra/`.
- Mutations enqueue sync work through `src/features/sync/application/syncService.ts` and `src/shared/infra/database/schema.ts` table `sync_queue`.
- Cloud sync/share operations go through BFF endpoints in `apps/api/src/app.ts`; mobile uses Supabase directly only for Auth through `src/shared/infra/supabase/client.ts`.
- Feature modules follow `domain`, `application`, `infra`, and `presentation` directories under `src/features/<feature>/`.

## Layers

**Presentation Layer:**
- Purpose: React Native screens, UI components, navigation state, and user interaction.
- Location: `src/features/*/presentation/`, `src/shared/presentation/components/`, `src/navigation/`.
- Contains: `*.tsx` screens, `*Styles.ts`, Zustand stores like `src/features/transactions/presentation/useTransactionStore.ts`.
- Depends on: application functions, infra repositories in some stores, shared components, theme, navigation, auth context.
- Used by: `App.tsx` and route stacks in `src/navigation/app.routes.tsx` and `src/navigation/auth.routes.tsx`.

**Application Layer:**
- Purpose: Use cases and orchestration between presentation, domain, repositories, and services.
- Location: `src/features/*/application/`, `src/shared/application/`.
- Contains: use cases such as `src/features/transactions/application/createTransaction.ts`, `src/features/sync/application/syncService.ts`, `src/features/budget/application/createBudget.ts`, and `src/shared/application/formatMoney.ts`.
- Depends on: domain entities/rules and infra repositories.
- Used by: presentation screens/stores and tests.

**Domain Layer:**
- Purpose: Business rules, entities, value objects, and typed errors.
- Location: `src/features/*/domain/`, `src/shared/domain/`.
- Contains: rules such as `src/features/budget/domain/budgetRules.ts`, `src/features/accounts/domain/invoiceRules.ts`, entities under `src/shared/domain/entities/`, `Money` in `src/shared/domain/value-objects/Money.ts`, and `AppError` in `src/shared/domain/errors/AppError.ts`.
- Depends on: no UI or infrastructure dependencies by convention.
- Used by: application use cases, repositories, and tests.

**Infrastructure Layer:**
- Purpose: SQLite persistence, HTTP, Supabase, notification, import/export and external adapters.
- Location: `src/features/*/infra/`, `src/shared/infra/`, `apps/api/src/`.
- Contains: repositories such as `src/features/transactions/infra/TransactionRepository.ts`, `src/features/accounts/infra/AccountRepository.ts`, HTTP client in `src/shared/infra/http/ApiClient.ts`, Supabase client in `src/shared/infra/supabase/client.ts`, BFF app in `apps/api/src/app.ts`.
- Depends on: database clients, Expo APIs, Supabase SDK, Fastify.
- Used by: application layer and presentation stores.

**BFF Layer:**
- Purpose: Authenticated sync, sharing, and future Open Finance API boundary.
- Location: `apps/api/src/`.
- Contains: `apps/api/src/app.ts`, `apps/api/src/server.ts`, `apps/api/src/auth.ts`, `apps/api/src/supabase/database.ts`, service implementations under `apps/api/src/services/`.
- Depends on: Fastify, zod, Supabase SDK.
- Used by: mobile `ApiClient` and deploy target `render.yaml`.

## Data Flow

**App startup and session restore:**
1. `index.js` registers `App.tsx` with Expo.
2. `App.tsx` loads Poppins fonts, applies `ThemeProvider`, mounts `AuthProvider`, and shows `Routes` after user storage is loaded.
3. `src/features/auth/presentation/AuthContext.tsx` loads `@gofinances:user` from AsyncStorage.
4. When a user is present, `src/shared/infra/startup.ts` opens SQLite, creates tables, seeds default account, and migrates legacy AsyncStorage transactions.

**Authentication flow:**
1. `src/features/auth/presentation/SignIn.tsx` calls `signInWithGoogle` or `signInWithApple` from `AuthContext`.
2. `AuthContext` obtains a Google/Apple identity token through Expo auth APIs.
3. `AuthContext` calls Supabase Auth `signInWithIdToken` through `src/shared/infra/supabase/client.ts`.
4. Mapped user data is stored in AsyncStorage and `initializeApp(user.id)` is executed.
5. `src/navigation/index.tsx` switches from `AuthRoutes` to `AppRoutes` when `user.id` exists.

**Transaction create/read/update/delete:**
1. `src/features/transactions/presentation/Register.tsx` collects form data and calls transaction use cases/repository.
2. `src/features/transactions/application/createTransaction.ts` builds a normalized `Transaction` with BRL cents, default account, ISO dates, and version.
3. `src/features/transactions/infra/TransactionRepository.ts` writes SQLite and enqueues the mutation with `enqueueChange`.
4. `src/features/transactions/presentation/useTransactionStore.ts` reloads rows from SQLite and formats cards/highlights.
5. `src/features/transactions/presentation/Dashboard.tsx` renders highlights and recent transactions.

**Cloud sync:**
1. Feature repositories enqueue local mutations via `src/features/sync/application/syncService.ts` into `sync_queue`.
2. `src/features/sync/infra/BffSyncGateway.ts` converts queue rows to mutations and posts `/v1/sync/push` through `ApiClient`.
3. `apps/api/src/app.ts` authenticates Bearer tokens with `apps/api/src/auth.ts` and validates payloads with zod.
4. `apps/api/src/services/supabaseSyncService.ts` upserts/deletes Supabase rows, writes `sync_mutations`, and resolves remote-newer conflicts.
5. Mobile pulls `/v1/sync/pull`, applies remote rows to SQLite using version comparison in `src/features/sync/domain/syncQueue.ts`.

**State Management:**
- Global auth state uses React context in `src/features/auth/presentation/AuthContext.tsx`.
- Feature UI/data state uses Zustand stores such as `src/features/transactions/presentation/useTransactionStore.ts`, `src/features/accounts/presentation/useAccountStore.ts`, and `src/features/sync/presentation/useSyncStore.ts`.
- Durable app data is local SQLite; AsyncStorage is used for user/session metadata and legacy migration markers.

## Key Abstractions

**Entities and Value Objects:**
- Purpose: Shared business model for mobile features.
- Examples: `src/shared/domain/entities/Transaction.ts`, `Account.ts`, `Budget.ts`, `Goal.ts`, `CreditCard.ts`, and `src/shared/domain/value-objects/Money.ts`.
- Pattern: Plain TypeScript interfaces/classes, normalized financial amounts in cents and BRL currency.

**Repositories:**
- Purpose: Encapsulate SQLite access and persistence side effects.
- Examples: `src/features/transactions/infra/TransactionRepository.ts`, `src/features/accounts/infra/AccountRepository.ts`, `src/features/budget/infra/BudgetRepository.ts`, `src/features/goals/infra/GoalRepository.ts`.
- Pattern: Classes with async CRUD/list methods calling `getDatabase()`.

**BFF Services:**
- Purpose: Encapsulate API business operations and allow test doubles.
- Examples: `apps/api/src/services/supabaseSyncService.ts`, `apps/api/src/services/supabaseSharingService.ts`, `apps/api/src/services/inMemorySyncService.ts`, `apps/api/src/services/inMemorySharingService.ts`.
- Pattern: Interfaces in `apps/api/src/types.ts`, injected through `buildApp(options)` in tests.

**HTTP Envelope:**
- Purpose: Consistent API response shape.
- Examples: `apps/api/src/http/envelope.ts` and `src/shared/infra/http/ApiClient.ts`.
- Pattern: `{ data, error, meta }` envelope; mobile throws `ApiError` on failed responses.

## Entry Points

**Mobile app:**
- Location: `index.js` and `App.tsx`.
- Triggers: Expo runtime.
- Responsibilities: register root component, load fonts, set theme, auth context, status bar, and navigation.

**Navigation:**
- Location: `src/navigation/index.tsx`, `src/navigation/auth.routes.tsx`, `src/navigation/app.routes.tsx`.
- Triggers: `Routes` mounted by `App.tsx`.
- Responsibilities: Auth gate, sign-in stack, tab navigator, FAB, and feature stacks.

**BFF server:**
- Location: `apps/api/src/server.ts`.
- Triggers: `npm run api:start` or Render start command.
- Responsibilities: instantiate `buildApp()` and listen on `PORT`/`HOST`.

**Database setup:**
- Location: `src/shared/infra/startup.ts` and `src/shared/infra/database/database.ts`.
- Triggers: Auth session restore/sign-in.
- Responsibilities: open local SQLite, create tables, seed account, and migrate legacy AsyncStorage transactions.

## Error Handling

**Strategy:** Typed/domain errors exist, but much of the UI and infra use thrown `Error`, `Alert`, and best-effort side effects.

**Patterns:**
- `AppError` codes are defined in `src/shared/domain/errors/AppError.ts` for predictable domain/API errors.
- `ApiClient` maps non-OK API envelopes to `ApiError` in `src/shared/infra/http/ApiClient.ts`.
- BFF returns structured failures through `fail()` in `apps/api/src/http/envelope.ts`.
- UI flows show `Alert.alert` on auth/transaction failures in `src/features/auth/presentation/SignIn.tsx` and `src/features/transactions/presentation/Register.tsx`.
- Repository sync enqueue calls swallow errors with `.catch(() => {})` in `src/features/transactions/infra/TransactionRepository.ts`.

## Cross-Cutting Concerns

**Logging:** Console logging only; Fastify logger disabled in `apps/api/src/app.ts`.
**Validation:** React Hook Form/Yup for forms; zod for BFF request payloads in `apps/api/src/app.ts`; database checks and RLS in `supabase/migrations/202604240001_architecture_2_core.sql`.
**Authentication:** Supabase Auth for identity, React Context for mobile session, Bearer token guard for BFF, RLS-preserving Supabase client on the server.
**Persistence:** SQLite local tables mirror a subset of Supabase remote tables; sync queue bridges local and remote.
**Assets:** SVG assets live in `src/shared/assets/` and are enabled by `metro.config.js`.

---

*Architecture analysis: Sat Apr 25 2026*
