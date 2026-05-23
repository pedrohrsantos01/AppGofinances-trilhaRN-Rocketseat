# Testing Patterns

**Analysis Date:** Sat Apr 25 2026

## Test Framework

**Runner:**
- Jest `^29.7.0` with `jest-expo ~55.0.5`.
- Config: `jest.config.js`.
- E2E runner: Detox `^20.33.1` with `.detoxrc.js` and `e2e/jest.config.js`.

**Assertion Library:**
- Jest `expect` for unit/integration/API tests.
- `@testing-library/react-native` for component rendering tests.
- Detox `expect`, `element`, and `by` for E2E smoke tests.

**Run Commands:**
```bash
npm test -- --runInBand --ci --no-coverage       # Run all Jest tests once; passed during mapping
npm run test:unit                                # Run unit tests by path pattern
npm run test:integration                         # Run integration tests by path pattern
npm run test:api                                 # Run apps/api tests by path pattern
npm run test:coverage                            # Run coverage locally
npm run test:coverage:ci -- --runInBand          # Run CI coverage
npm run test:e2e:build                           # Build Detox Android debug app
npm run test:e2e                                 # Run Detox Android debug tests
```

## Test File Organization

**Location:**
- Mobile/shared tests live under `src/__tests__/`.
- BFF tests live beside API source under `apps/api/src/__tests__/`.
- Detox tests live under `e2e/smoke/`.
- Component snapshots live under `src/__tests__/unit/components/__snapshots__/`.

**Naming:**
- Use `.test.ts` for logic/API tests and `.test.tsx` for component tests.
- Group feature tests under `src/__tests__/unit/features/<feature>/`.
- Regression tests use `src/__tests__/unit/regression/`.

**Structure:**
```text
src/__tests__/
├── setup.ts
├── helpers/renderWithTheme.tsx
├── integration/transactionCycle.test.ts
└── unit/
    ├── components/*.test.tsx
    ├── domain/*.test.ts
    ├── features/<feature>/*.test.ts
    ├── regression/*.test.ts
    └── shared/**/*.test.ts

apps/api/src/__tests__/*.test.ts
e2e/smoke/*.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
describe("feature or unit name", () => {
  it("should describe expected behavior", () => {
    const result = subject(input);
    expect(result).toEqual(expected);
  });
});
```

**Patterns:**
- Use arrange/act/assert inside `it` blocks for domain tests such as `src/__tests__/unit/features/budget/budgetRules.test.ts`.
- Use injected service dependencies for BFF tests via `buildApp(options)` in `apps/api/src/app.ts`.
- Use helper render wrapper for themed components through `src/__tests__/helpers/renderWithTheme.tsx`.
- Use snapshot tests for stable visual components such as `src/__tests__/unit/components/HighLightCard.test.tsx` and `TransactionCard.test.tsx`.

## Mocking

**Framework:** Jest mocks in `src/__tests__/setup.ts`.

**Patterns:**
```typescript
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue("mock-notification-id"),
}));
```

**What to Mock:**
- Native/Expo modules in Jest: AsyncStorage, gesture handler, auth session, Apple auth, web browser, fonts, splash screen, SVGs, Victory charts, notifications, Supabase, and SQLite.
- Network/Supabase dependencies in API service tests via fake database clients and injected services.
- Theme provider through `renderWithTheme` for component tests.

**What NOT to Mock:**
- Pure domain rules under `src/features/*/domain/` and `src/shared/domain/`; test them directly.
- Application use cases should use real domain rules unless they require platform/database boundaries.
- BFF route tests should exercise Fastify handlers and HTTP envelopes rather than only service methods.

## Fixtures and Factories

**Test Data:**
```typescript
const transaction = {
  id: "tx-1",
  amount_cents: 10000,
  currency: "BRL",
  type: "income",
  status: "confirmed",
  source: "manual",
  user_id: "user-1",
};
```

**Location:**
- Test data is mostly inline in each test file.
- Shared render setup lives in `src/__tests__/helpers/renderWithTheme.tsx`.
- Global native/platform mocks live in `src/__tests__/setup.ts`.

## Coverage

**Requirements:**
- Global coverage thresholds in `jest.config.js`: branches 80%, functions 85%, lines 85%, statements 85%.
- `src/shared/domain/` thresholds: 95% for branches, functions, lines, statements.
- `src/features/sync/domain/` thresholds: branches 70%, functions 95%, lines 95%, statements 95%.
- Coverage collection excludes presentation, styles, navigation, contracts, entities, some infra, test files, and several generated/adapter-style modules per `collectCoverageFrom` in `jest.config.js`.

**View Coverage:**
```bash
npm run test:coverage
npm run test:coverage:ci -- --runInBand
```

## Test Types

**Unit Tests:**
- Scope: domain rules, use cases, stores, formatters, migrations, API client, repositories with mocks, BFF services.
- Location: `src/__tests__/unit/` and `apps/api/src/__tests__/`.
- Examples: `src/__tests__/unit/features/transactions/installments.test.ts`, `src/__tests__/unit/features/sync/syncQueue.test.ts`, `apps/api/src/__tests__/supabaseServices.test.ts`.

**Integration Tests:**
- Scope: complete app-level logic flows with mocked native storage/database.
- Location: `src/__tests__/integration/transactionCycle.test.ts`.

**Regression Tests:**
- Scope: known cross-feature scenarios.
- Location: `src/__tests__/unit/regression/transactionDashboard.test.ts`, `monthSwitch.test.ts`, `syncConflict.test.ts`.

**E2E Tests:**
- Framework: Detox.
- Location: `e2e/smoke/auth.test.ts`, `e2e/smoke/resume.test.ts`, `e2e/smoke/transaction.test.ts`.
- Config: `.detoxrc.js` uses Android emulator `Pixel_4_API_33` and app binary paths under `android/app/build/outputs/apk/`.

## Common Patterns

**Async Testing:**
```typescript
it("should process async behavior", async () => {
  const result = await useCase(input);
  expect(result).toEqual(expected);
});
```

**Error Testing:**
```typescript
await expect(client.request("/bad-path")).rejects.toMatchObject({
  code: "NETWORK_ERROR",
});
```

**Component Testing:**
```typescript
const { getByText } = renderWithTheme(<Component {...props} />);
expect(getByText("Label")).toBeTruthy();
```

**E2E Smoke Testing:**
```typescript
await expect(element(by.text("Entrar com Google"))).toBeVisible();
```

## Verified Current State

- `npm run typecheck` passed during mapping.
- `npm run lint` passed during mapping.
- `npm test -- --runInBand --ci --no-coverage` passed during mapping: 55 suites, 407 tests, 5 snapshots.
- Detox was not executed during mapping because it requires an Android emulator/build environment.

---

*Testing analysis: Sat Apr 25 2026*
