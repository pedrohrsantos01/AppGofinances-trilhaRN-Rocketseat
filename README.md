# GoFinances

Projeto da trilha de React Native da Rocketseat: app mobile de controle financeiro pessoal, em que o usuário entra com a conta Google (ou Apple, no iOS), registra entradas e saídas e acompanha o saldo e os gastos por categoria.

Iniciado em 2021 e retomado em 2026 com a migração para o Expo SDK 55. Em evolução.

## Funcionalidades

- Login social com Google (OAuth) e com Apple (implementado apenas para iOS; veja Limitações conhecidas), com sessão salva no aparelho.
- Cadastro de transação com nome, valor, tipo (entrada ou saída) e categoria, com validação dos campos.
- Listagem das transações com cards de total de entradas, total de saídas, saldo e data da última movimentação.
- Resumo mensal das saídas por categoria, em gráfico de pizza, com navegação entre meses.
- Transações armazenadas localmente em uma chave baseada no identificador do usuário, com uma falha conhecida na identificação das contas Google (veja Limitações conhecidas). Logout pelo botão no cabeçalho.

## Stack

- **TypeScript** e **React Native 0.83** com **Expo SDK 55**: base do app, com `expo run:android` e `expo run:ios`.
- **React Navigation** (stack e bottom tabs): rotas de autenticação e rotas do app.
- **styled-components** com tema global: estilos e cores centralizados.
- **React Hook Form** e **Yup**: formulário de cadastro com schema de validação.
- **expo-auth-session** e **expo-apple-authentication**: login Google e Apple.
- **AsyncStorage**: persistência local do usuário e das transações.
- **victory-native**: gráfico de pizza do resumo.
- **date-fns**: formatação e troca de mês, em pt-BR.

## O que este projeto demonstra

- Fluxo OAuth com Google em implicit flow, com suporte ao proxy de redirecionamento do Expo, tratamento de cancelamento e de erros.
- Context API (`AuthProvider` e `useAuth`) controlando qual grupo de rotas é exibido: login ou app.
- Persistência local com AsyncStorage, em chave baseada no identificador do usuário (`@gofinances:transactions_user<id>`). A separação das transações entre contas Google depende da correção do identificador recebido no login.
- Formulário controlado com schema Yup e componentes de formulário reutilizáveis.

## Como rodar

Pré-requisitos: Node.js 20.19.4 ou superior e npm (o projeto usa `package-lock.json`). Para compilar no Android, configure Android Studio, Android SDK e JDK, com um emulador ou aparelho conectado. Para compilar no iOS, use macOS com Xcode e CocoaPods; a configuração iOS deste repositório ainda precisa de atualização (veja Limitações conhecidas).

Variáveis de ambiente (copie `.env.example` para `.env` e preencha):

- `EXPO_PUBLIC_GOOGLE_CLIENT_ID`: obrigatório para iniciar o login Google. Configure no Google Cloud o cliente OAuth e o redirecionamento correspondente ao ambiente utilizado.
- `EXPO_PUBLIC_GOOGLE_REDIRECT_URI`: substitui a URI gerada pelo app. Para usar a geração automática, remova essa variável do `.env` em vez de deixá-la vazia. O endereço de `.env.example` é um modelo e não deve ser usado sem substituição.

A configuração completa do login ainda precisa ser validada.

```bash
npm install
```

Depois, escolha um dos comandos conforme o objetivo (são alternativas, não uma sequência):

```bash
npm start                # expo start --go: inicia o projeto no Expo Go
npm run start:dev-client # apenas inicia o servidor em modo dev client
npm run android          # expo run:android: compila e instala a build nativa
npm run ios              # expo run:ios (veja Limitações conhecidas)
npm run web
```

O `npm start` abre o projeto no Expo Go, mas não deve ser usado como caminho de validação do login Google, que usa esquema próprio de redirecionamento. Para testar esse login, use uma build nativa com redirecionamento configurado. O script `start:dev-client` não cria nem instala uma build, e o repositório ainda não inclui `expo-dev-client`.

## Limitações conhecidas

- **Identificador no login Google:** o app consulta o endpoint OpenID Connect do Google, mas lê `userInfo.id`, campo que esse endpoint não retorna (o identificador vem em `sub`). O id fica como a string `undefined`, e contas Google distintas podem compartilhar a mesma chave de armazenamento (`@gofinances:transactions_userundefined`).
- **Login Apple:** implementado para iOS, mas `app.json` não define `ios.usesAppleSignIn` nem inclui o plugin `expo-apple-authentication`, e não há entitlements no projeto. Para usá-lo em uma build própria, ainda é necessário configurar a capability Sign in with Apple.
- **Projeto iOS desatualizado:** o `ios/Podfile` referencia `@react-native-community/cli-platform-ios`, que não está nas dependências, e a plataforma continua em 12.0 apesar do React Native 0.83. O `npm run ios` não está pronto para uso após o clone até que a configuração nativa seja atualizada para o Expo SDK 55.

## Estrutura de pastas

```
App.tsx              # fontes, tema e providers
src/
  Screens/           # SignIn, Dashboard, Register, CategorySelect, Resume
  components/        # cards, botões e campos de formulário
  hooks/auth.tsx     # contexto de autenticação
  routes/            # rotas de login e rotas do app (tabs)
  global/styles/     # tema do styled-components
  utils/categories.ts
  assets/            # logos em SVG
```

## Autor

Pedro Santos, desenvolvedor e fundador da PHSDEV.
GitHub: [pedrohrsantos01](https://github.com/pedrohrsantos01)
