# Technology Stack

**Analysis Date:** Sat Apr 25 2026

## Languages

**Primary:**
- TypeScript `~5.9.2` - mobile app under `src/`, BFF under `apps/api/src/`, and tests under `src/__tests__/` and `apps/api/src/__tests__/`.
- TSX/React - React Native screens and components under `src/features/*/presentation/` and `src/shared/presentation/components/`.

**Secondary:**
- JavaScript - runtime/config entry points in `index.js`, `babel.config.js`, `metro.config.js`, `jest.config.js`, `.detoxrc.js`, and `eslint.config.mjs`.
- SQL - Supabase/Postgres schema and RLS in `supabase/migrations/202604240001_architecture_2_core.sql`.

## Runtime

**Environment:**
- Node.js 20+ - documented prerequisite in `docs/setup-deploy.md`.
- Expo SDK `~55.0.4` - mobile runtime in `package.json` and app config in `app.json`.
- React Native `0.83.2` with React `19.2.0` - native UI runtime in `package.json`.
- Fastify `^5.8.5` - Node BFF runtime in `apps/api/src/server.ts` and `apps/api/src/app.ts`.

**Package Manager:**
- npm - `package-lock.json` present.
- Install command: `npm ci --legacy-peer-deps` from `README.md` and `docs/setup-deploy.md`.

## Frameworks

**Core:**
- Expo `~55.0.4` - app start/build commands in `package.json`; plugins in `app.json` include `expo-font`, `expo-web-browser`, `expo-sharing`, and `expo-notifications`.
- React Navigation `@react-navigation/native`, bottom-tabs, and stack - route split in `src/navigation/index.tsx`, `src/navigation/app.routes.tsx`, and `src/navigation/auth.routes.tsx`.
- styled-components `^6.1.19` - theme-driven styling in `src/shared/presentation/theme/theme.ts` and `*Styles.ts` files.
- Zustand `^5.0.3` - presentation state stores such as `src/features/transactions/presentation/useTransactionStore.ts`, `src/features/accounts/presentation/useAccountStore.ts`, and `src/features/sync/presentation/useSyncStore.ts`.
- Fastify `^5.8.5` - BFF API in `apps/api/src/app.ts`.

**Testing:**
- Jest `^29.7.0` with `jest-expo ~55.0.5` - configured in `jest.config.js`.
- `@testing-library/react-native ^12.9.0` - component tests under `src/__tests__/unit/components/`.
- Detox `^20.33.1` - E2E smoke tests under `e2e/smoke/` with `.detoxrc.js` and `e2e/jest.config.js`.
- MSW `^2.7.3` - available for integration/API mocking in `package.json`.

**Build/Dev:**
- `tsx ^4.21.0` - runs the BFF in `api:dev` and `api:start` scripts.
- ESLint `^9.22.0` with `eslint-config-expo` and `eslint-config-prettier` - configured in `eslint.config.mjs`.
- Prettier `^3.5.3` - configured in `.prettierrc.json`.
- EAS CLI `>= 16.0.1` - configured in `eas.json`.

## Key Dependencies

**Critical:**
- `@supabase/supabase-js ^2.99.0` - mobile Auth client in `src/shared/infra/supabase/client.ts`, API token validation in `apps/api/src/auth.ts`, and user-scoped Postgres client in `apps/api/src/supabase/database.ts`.
- `expo-sqlite ~15.1.3` - offline-first local database in `src/shared/infra/database/database.ts` and schema in `src/shared/infra/database/schema.ts`.
- `@react-native-async-storage/async-storage 2.2.0` - persisted auth/user and legacy migration source in `src/features/auth/presentation/AuthContext.tsx` and `src/shared/infra/startup.ts`.
- `expo-auth-session`, `expo-web-browser`, `expo-apple-authentication` - Google/Apple sign-in flow in `src/features/auth/presentation/AuthContext.tsx`.
- `expo-notifications` - reminder scheduling in `src/features/calendar/infra/notificationService.ts`.
- `expo-document-picker`, `expo-file-system`, `expo-sharing` - import/export feature support in `src/features/import-export/` and `app.json` plugins.

**Infrastructure:**
- `@fastify/cors` and `@fastify/sensible` - BFF plugins in `apps/api/src/app.ts`.
- `zod` - request validation imported by `apps/api/src/app.ts`; the dependency is not declared directly in `package.json`, so keep it explicit if relying on it.
- `date-fns ^2.30.0` - date formatting/parsing in `src/shared/infra/startup.ts` and transaction creation.
- `victory-native ^36.9.2` and `react-native-svg` - charts/assets used by resume and SVG components.

## Configuration

**Environment:**
- `.env` exists in the project root; do not read or commit its values.
- Safe variable names are documented in `.env.example` and `docs/setup-deploy.md`: `EXPO_PUBLIC_GOOGLE_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_REDIRECT_URI`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_BASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- Mobile code must only use `EXPO_PUBLIC_*` variables; server-only variables are read in `apps/api/src/auth.ts` and `apps/api/src/supabase/database.ts`.

**Build:**
- `app.json` defines Expo app identity, scheme `gofinances`, Android package `com.pedrohrsantos01.gofinances`, updates policy, and plugins.
- `metro.config.js` enables `react-native-svg-transformer/expo` for SVG imports from `src/shared/assets/`.
- `eas.json` defines development, preview, production, and submit profiles.
- `render.yaml` defines Render web service `gofinances-api` with `npm ci --legacy-peer-deps` and `npm run api:start`.

## Commands

**Development:**
- `npm run start` - Expo Go.
- `npm run start:dev-client` - Expo dev client.
- `npm run android` / `npm run ios` / `npm run web` - platform targets.
- `npm run api:dev` - Fastify BFF with `tsx watch apps/api/src/server.ts`.
- `npm run api:start` - Fastify BFF one-shot runtime.

**Quality:**
- `npm run typecheck` - TypeScript strict validation; passed during mapping.
- `npm run lint` - ESLint validation; passed during mapping.
- `npm test -- --runInBand --ci --no-coverage` - Jest suite; 55 suites and 407 tests passed during mapping.
- `npm run test:coverage:ci -- --runInBand` - CI coverage run.
- `npm run validate` - typecheck + lint + test.
- `npm run test:e2e:build` and `npm run test:e2e` - Detox Android.

## Platform Requirements

**Development:**
- Node.js 20+, npm, Git, Java 17, Android Studio/SDK, Expo/EAS CLI, Supabase CLI, Supabase account, Render account, Expo account, Google Cloud OAuth, and Apple Developer for iOS are listed in `docs/setup-deploy.md`.

**Production:**
- Mobile delivery uses EAS profiles in `eas.json`.
- BFF deployment target is Render via `render.yaml`.
- Remote persistence and Auth use Supabase configured by `supabase/migrations/202604240001_architecture_2_core.sql`.

---

*Stack analysis: Sat Apr 25 2026*
