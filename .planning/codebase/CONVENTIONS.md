# Coding Conventions

**Analysis Date:** Sat Apr 25 2026

## Naming Patterns

**Files:**
- Use PascalCase for React Native screens/components: `src/features/transactions/presentation/Dashboard.tsx`, `src/shared/presentation/components/HighLightCard/index.tsx`.
- Use `*Styles.ts` or `styles.ts` for styled-components modules: `src/features/transactions/presentation/DashboardStyles.ts`, `src/shared/presentation/components/Form/Button/styles.ts`.
- Use camelCase for pure use-case/rule files: `src/features/transactions/application/createTransaction.ts`, `src/features/budget/domain/budgetRules.ts`.
- Use `use*.ts` for Zustand stores and hooks: `src/features/transactions/presentation/useTransactionStore.ts`.

**Functions:**
- Use camelCase verbs for use cases and helpers: `createTransaction`, `calculateSummary`, `formatCents`, `enqueueChange`, `processPendingQueue`.
- Use `handle*` for UI event handlers: `handleDeleteTransaction` and `handleEditTransaction` in `src/features/transactions/presentation/Dashboard.tsx`.
- Use `get*`, `list*`, `create*`, `update*`, `delete*` repository methods in `src/features/*/infra/*Repository.ts`.

**Variables:**
- Use camelCase for local variables and state: `isLoading`, `formattedTransactions`, `highlightData`, `userStorageKey`.
- Use SCREAMING_SNAKE_CASE for constants and env-derived settings: `GOOGLE_CLIENT_ID`, `GOOGLE_REDIRECT_URI`, `ENTITY_TABLES`.
- Use snake_case for persisted/database fields: `amount_cents`, `user_id`, `created_at`, `server_version`.

**Types:**
- Use PascalCase for interfaces/classes/types: `Transaction`, `CreateTransactionInput`, `AppError`, `ApiClient`, `SyncMutation`.
- Keep domain entities under `src/shared/domain/entities/` and service contracts under `src/shared/services/contracts/`.

## Code Style

**Formatting:**
- Use Prettier from `.prettierrc.json`.
- Key settings: semicolons enabled, double quotes (`singleQuote: false`), trailing commas `es5`, `tabWidth: 2`, `printWidth: 100`, bracket spacing enabled, arrow parens always.

**Linting:**
- Use ESLint flat config in `eslint.config.mjs`.
- Base rules come from `eslint-config-expo/flat.js`; Prettier conflicts are disabled through `eslint-config-prettier`.
- Presentation files in `src/features/*/presentation/**/*.{ts,tsx}` and `src/shared/presentation/**/*.{ts,tsx}` must not import domain implementation directly except type-only imports; use application layer or hooks instead.
- Style files may disable `import/no-named-as-default` through config for `**/*Styles.{ts,tsx}` and `**/styles.{ts,tsx}`.

## Import Organization

**Order:**
1. React and React Native imports, e.g. `react`, `react-native`, `react-native-gesture-handler`.
2. Third-party libraries, e.g. `expo-*`, `@react-navigation/*`, `styled-components/native`.
3. Shared components/assets/theme and feature-local modules.
4. Relative style imports from `*Styles` or `styles`.

**Path Aliases:**
- No TypeScript path aliases are configured in `tsconfig.json`; use relative imports.
- SVG import support is configured by `metro.config.js` and typed by `src/shared/@types/svg/index.d.ts`.

## Error Handling

**Patterns:**
- Use `AppError` from `src/shared/domain/errors/AppError.ts` for domain/application errors that need stable codes.
- Use `ApiError` from `src/shared/infra/http/ApiClient.ts` for BFF/network errors.
- BFF handlers should return envelope failures with `fail(code, message)` from `apps/api/src/http/envelope.ts` instead of raw exceptions.
- UI screens may catch errors and present `Alert.alert`, as in `src/features/auth/presentation/SignIn.tsx`.
- Avoid swallowing infrastructure failures silently; `src/features/transactions/infra/TransactionRepository.ts` currently uses `.catch(() => {})` for sync enqueue and should be treated as a risk pattern, not copied.

## Logging

**Framework:** console only.

**Patterns:**
- Development auth debug logging exists in `src/features/auth/presentation/AuthContext.tsx` guarded by `__DEV__`.
- UI error logging exists in `src/features/auth/presentation/SignIn.tsx` and `src/features/transactions/presentation/Register.tsx`.
- Server fatal startup logging uses `console.error` in `apps/api/src/server.ts`.
- Do not add verbose production logs with secrets, tokens, full env values, or OAuth responses.

## Comments

**When to Comment:**
- Comments are sparse; add comments only for non-obvious platform behavior or intentionally simplified test mocks.
- Existing examples: Google PKCE note in `src/features/auth/presentation/AuthContext.tsx`, Expo root registration note in `index.js`, and mock limitations in `src/__tests__/setup.ts`.

**JSDoc/TSDoc:**
- Not broadly used. Prefer explicit TypeScript interfaces and readable function names over JSDoc unless documenting public contracts or complex invariants.

## Function Design

**Size:**
- Keep domain/application functions small and pure where possible, like `src/features/transactions/domain/calculateSummary.ts`.
- Split UI handlers and data transforms from JSX; stores currently contain formatting logic, so prefer moving heavy formatting/selectors to application functions for new work.

**Parameters:**
- Use typed input objects for use cases that accept multiple values, as in `CreateTransactionInput` in `src/features/transactions/application/createTransaction.ts`.
- Use primitive explicit params for repository filters only when the parameter set is small; use `options` object for optional filters like `listByUser(userId, options)`.

**Return Values:**
- Repositories return domain entities or arrays and use `null` for not found: `getById(id): Promise<Transaction | null>`.
- Use cases return domain entities/results rather than UI formatted data.
- API client returns unwrapped `data` and throws on envelope errors.

## Module Design

**Exports:**
- Prefer named exports for functions, stores, and classes: `export function`, `export class`, `export const`.
- Theme uses default export in `src/shared/presentation/theme/theme.ts`; keep existing convention there.
- Contract barrel exists at `src/shared/services/contracts/index.ts`.

**Barrel Files:**
- Limited usage. Entity/value/error indexes exist in `src/shared/domain/entities/index.ts`, `src/shared/domain/value-objects/index.ts`, and `src/shared/domain/errors/index.ts`.
- Do not introduce broad feature barrels unless they simplify stable public contracts without hiding layer boundaries.

## Layering Rules

- Put business rules in `domain`; do not implement business calculations inside visual components.
- Put orchestration/use cases in `application`; presentation should call use cases/stores.
- Put SQLite, HTTP, Supabase, notifications, and platform APIs in `infra`.
- Presentation should import application/hooks and shared presentation components, not domain implementation directly.
- New feature code should follow the `src/features/<feature>/{domain,application,infra,presentation}` layout documented in `CLAUDE.md`.

---

*Convention analysis: Sat Apr 25 2026*
