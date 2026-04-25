# Setup, Testes e Deploy

Este guia descreve o passo a passo para configurar, testar e subir o GoFinances em producao usando Expo, BFF Fastify, Supabase, Render e EAS.

## 1. Pre-requisitos

Instale e configure:

- Node.js 20 ou superior.
- npm.
- Git.
- Java 17, Android Studio e Android SDK para builds/Detox Android.
- Expo/EAS CLI: `npm install -g eas-cli`.
- Supabase CLI: siga a instalacao oficial da Supabase.
- Conta Supabase.
- Conta Render.
- Conta Expo/EAS.
- Conta Google Cloud para OAuth Google.
- Conta Apple Developer para OAuth Apple e submit iOS.

No Windows, confirme que o Android SDK e o Java estao no `PATH` antes de rodar Detox.

## 2. Instalar dependencias

```bash
npm ci --legacy-peer-deps
```

Use `npm ci` para ambientes reprodutiveis. O `--legacy-peer-deps` e necessario por causa da arvore atual de dependencias Expo/React Native.

## 3. Variaveis de ambiente

Crie um arquivo `.env` na raiz:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

Preencha:

```env
# Google Credentials
EXPO_PUBLIC_GOOGLE_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_REDIRECT_URI=https://auth.expo.io/@SEU_USUARIO_EXPO/gofinances

# Supabase Auth usado pelo mobile
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# BFF/API usado pelo mobile
EXPO_PUBLIC_API_BASE_URL=http://localhost:3333

# Apenas servidor API
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Notas importantes:

- `EXPO_PUBLIC_*` vira parte do bundle mobile. Nao coloque secrets nesses valores.
- `SUPABASE_SERVICE_ROLE_KEY` deve existir apenas em ambientes de servidor.
- Se usar Android emulator e API local, use `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3333`.
- Se usar aparelho fisico, use `http://IP_DA_SUA_MAQUINA:3333`.
- Reinicie o Metro/Expo sempre que alterar variaveis `EXPO_PUBLIC_*`.

## 4. Configurar Supabase

### 4.1 Criar projeto

1. Crie um projeto no Supabase.
2. Copie `Project URL` para:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `SUPABASE_URL`
3. Copie `anon public key` para:
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_ANON_KEY`
4. Copie `service_role key` apenas para:
   - `SUPABASE_SERVICE_ROLE_KEY`

### 4.2 Aplicar migrations

As migrations ficam em:

```text
supabase/migrations/
```

Fluxo recomendado com Supabase CLI:

```bash
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase db push
```

Para ver o que sera aplicado antes:

```bash
supabase db push --dry-run
```

Alternativa manual:

1. Abra o SQL Editor no dashboard Supabase.
2. Cole o conteudo de `supabase/migrations/202604240001_architecture_2_core.sql`.
3. Execute.

### 4.3 Conferir schema

Depois da migration, confirme que existem tabelas como:

- `accounts`
- `transactions`
- `budgets`
- `goals`
- `shared_access`
- `open_finance_connections`
- `sync_mutations`
- `audit_log`

Confirme tambem que RLS esta habilitado nas tabelas principais.

### 4.4 Configurar Auth

No Supabase Dashboard:

1. Acesse `Authentication > Providers`.
2. Habilite Google.
3. Habilite Apple quando for testar iOS/producao.
4. Configure os Client IDs e secrets dos providers.

No Google Cloud:

1. Crie OAuth Client para o fluxo usado pelo app.
2. Configure o redirect URI usado em `EXPO_PUBLIC_GOOGLE_REDIRECT_URI`.
3. Em desenvolvimento com Expo proxy, o padrao e:

```text
https://auth.expo.io/@SEU_USUARIO_EXPO/gofinances
```

Em builds standalone/dev-client, valide tambem o scheme:

```text
gofinances://auth
```

## 5. Rodar localmente

### 5.1 API local

```bash
npm run api:dev
```

Health check:

```bash
curl http://localhost:3333/health
```

Resposta esperada:

```json
{
  "data": {
    "status": "ok"
  },
  "error": null,
  "meta": {
    "service": "gofinances-api"
  }
}
```

### 5.2 App mobile

Expo Go:

```bash
npm run start
```

Dev client:

```bash
npm run start:dev-client
```

Android nativo local:

```bash
npm run android
```

iOS local:

```bash
npm run ios
```

## 6. Testes locais

Rode sempre antes de abrir PR:

```bash
npm run lint
npm run typecheck
npm test -- --runInBand --ci --no-coverage
npm run test:api -- --runInBand --ci --no-coverage
npm run test:coverage:ci -- --runInBand
```

Cobertura configurada:

- Global: 85% para statements, lines e functions, 80% para branches.
- `src/shared/domain`: 95%.
- `src/features/sync/domain`: 95% em functions/lines/statements.

## 7. Detox Android

Pre-requisitos:

- Android Studio instalado.
- Emulator/AVD com nome `Pixel_4_API_33`, ou ajuste `.detoxrc.js`.
- Java 17.
- Android SDK configurado.

Build:

```bash
npm run test:e2e:build
```

Smoke:

```bash
npm run test:e2e:smoke
```

Suite completa:

```bash
npm run test:e2e
```

Observacao: os testes atuais de transacao/resumo dependem de sessao autenticada ou mock de auth. O PR gate roda smoke de Auth; a suite completa fica no nightly.

## 8. Deploy da API no Render

O projeto tem `render.yaml` na raiz.

### 8.1 Via Blueprint

1. No Render, escolha `New > Blueprint`.
2. Conecte o repositorio.
3. Render detectara `render.yaml`.
4. Configure as env vars:

```env
NODE_ENV=production
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

5. Confirme que o health check usa:

```text
/health
```

### 8.2 Manual

Crie um Web Service:

- Runtime: Node.
- Build command:

```bash
npm ci --legacy-peer-deps
```

- Start command:

```bash
npm run api:start
```

- Health check path:

```text
/health
```

Depois do deploy, teste:

```bash
curl https://SUA_API_RENDER.onrender.com/health
```

Atualize o app para apontar:

```env
EXPO_PUBLIC_API_BASE_URL=https://SUA_API_RENDER.onrender.com
```

## 9. EAS Build, Submit e Update

### 9.1 Login e inicializacao

```bash
eas login
eas init
```

Se ainda nao existir projeto EAS, o `eas init` vai vincular o app e pode adicionar `extra.eas.projectId` ao app config.

### 9.2 Variaveis no EAS

Crie variaveis por ambiente. Exemplo para production:

```bash
eas env:create --name EXPO_PUBLIC_API_BASE_URL --value https://SUA_API_RENDER.onrender.com --environment production --visibility plaintext
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value https://SEU_PROJECT.supabase.co --environment production --visibility plaintext
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value SUA_ANON_KEY --environment production --visibility plaintext
eas env:create --name EXPO_PUBLIC_GOOGLE_CLIENT_ID --value SEU_GOOGLE_CLIENT_ID --environment production --visibility plaintext
eas env:create --name EXPO_PUBLIC_GOOGLE_REDIRECT_URI --value SUA_REDIRECT_URI --environment production --visibility plaintext
```

Repita para `development` e `preview` com valores proprios.

O `eas.json` ja aponta cada profile para seu environment:

- `development` usa environment `development`
- `preview` usa environment `preview`
- `production` usa environment `production`

### 9.3 Android

Build interno:

```bash
eas build --platform android --profile preview
```

Build de producao:

```bash
eas build --platform android --profile production
```

Submit para track interno:

```bash
eas submit --platform android --profile production
```

### 9.4 iOS

Build preview:

```bash
eas build --platform ios --profile preview
```

Build producao:

```bash
eas build --platform ios --profile production
```

Submit:

```bash
eas submit --platform ios --profile production
```

### 9.5 EAS Update

Use update apenas para mudancas JS/assets compativeis com o mesmo `runtimeVersion`.

```bash
eas update --environment production --branch production --message "Release production"
```

## 10. CI/CD

O PR gate em `.github/workflows/pr-gate.yml` roda:

- install
- typecheck
- lint
- unit tests
- integration tests
- API tests
- coverage bloqueante
- Detox auth smoke Android

O nightly em `.github/workflows/nightly.yml` roda:

- suite completa com cobertura
- API regression tests
- upload de coverage
- Detox Android completo

## 11. Checklist antes de producao

- Supabase migrations aplicadas no projeto correto.
- RLS habilitado e policies revisadas.
- Google/Apple providers configurados no Supabase.
- API Render respondendo `/health`.
- `EXPO_PUBLIC_API_BASE_URL` apontando para Render em preview/producao.
- `SUPABASE_SERVICE_ROLE_KEY` ausente do mobile e presente apenas no servidor.
- `npm run lint` sem erros.
- `npm run typecheck` verde.
- `npm test -- --runInBand --ci --no-coverage` verde.
- `npm run test:coverage:ci -- --runInBand` verde.
- Detox smoke executado em Android.
- EAS Build production gerado com signing real.
- Submit testado em track interno antes de publicacao aberta.

## 12. Fontes oficiais uteis

- Expo EAS environment variables: https://docs.expo.dev/eas/environment-variables/
- Supabase migrations e CLI: https://supabase.com/docs/guides/deployment/database-migrations
- Render health checks: https://render.com/docs/health-checks
- Render blueprint spec: https://render.com/docs/blueprint-spec

