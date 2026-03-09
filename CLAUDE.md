# Roadmap de Evolução do GoFinances com TDD, Testes Unitários, Integração e Regressão

## Resumo
Este roadmap mantém a estratégia já definida (PF, Brasil-first, arquitetura mista local+cloud, Supabase, 2 releases) e adiciona um processo obrigatório de qualidade para cada nova funcionalidade: TDD, suíte de testes em camadas, regressão contínua e padrões de performance/manutenibilidade em React Native.

## 1. Objetivo de engenharia
1. Toda funcionalidade nova será entregue com ciclo `Red -> Green -> Refactor`.
2. Todo bug crítico vira teste de regressão antes da correção.
3. Nenhuma feature entra em `main` sem passar `unit + integration + regression + typecheck + lint`.
4. A base deve evoluir com foco em performance estável e baixo custo de manutenção.

## 2. Padrão TDD obrigatório por funcionalidade
1. Escrever primeiro testes unitários dos casos de uso e regras de domínio.
2. Escrever teste de integração do fluxo principal da feature.
3. Implementar o mínimo para passar os testes.
4. Refatorar com testes verdes.
5. Adicionar teste de regressão para cenário de falha real ou edge case crítico.
6. Validar critérios de performance da feature antes do merge.

## 3. Stack de qualidade e testes (decisão fechada)
1. Unitário: `Jest` + `@testing-library/react-native` + `@testing-library/jest-native`.
2. Integração: `Jest` + `MSW` para APIs + banco local de teste (SQLite mockado/in-memory).
3. Regressão de app: `Detox` com suíte smoke em Android por PR e suíte completa nightly.
4. Regressão visual: snapshots de componentes críticos com `jest` para estados principais.
5. Estático: `TypeScript strict`, `ESLint`, `Prettier`, `Husky + lint-staged`.
6. Qualidade de arquitetura: limites de dependência por feature e regra de imports por camada.

## 4. Estrutura de código para manutenibilidade
1. Organizar por feature em `src/features/<nome>`.
2. Separar camadas em `domain`, `application`, `infra`, `presentation`.
3. Centralizar contratos em `src/services/contracts`.
4. Proibir regra de negócio dentro de componentes visuais.
5. Padronizar tipagem de DTOs, entidades e mapeadores.
6. Adotar padrão de erro tipado (`AppError`) para fluxos previsíveis.

## 5. Boas práticas React Native obrigatórias
1. Listas grandes com `FlatList` otimizada (`keyExtractor`, `getItemLayout` quando possível, `removeClippedSubviews`).
2. Evitar re-render com `React.memo`, `useMemo` e `useCallback` em pontos de alto custo.
3. Estado remoto via cache consistente e invalidação explícita.
4. Evitar processamento pesado no render; mover para selectors/use cases.
5. Tratar imagens e SVGs com estratégia de cache e tamanho controlado.
6. Monitorar tempo de render e travamentos com telemetria de performance.
7. Definir budgets: abertura inicial < 2.5s em device intermediário e interação crítica < 100ms.

## 6. Release 1 (base robusta) com plano de testes por feature
1. Contas e cartões.
Testes unitários: cálculo de saldo por conta, regras de fechamento de fatura, pagamento parcial/total.
Testes integração: criar conta, lançar compra em cartão, refletir em fatura e dashboard.
Testes regressão: reconciliação de saldo após edição/exclusão de lançamento.
2. Lançamentos avançados (editar/excluir/transferência/recorrência/parcelamento).
Testes unitários: geração de parcelas, recorrência mensal/semanal, regras de transferência.
Testes integração: criar, editar e excluir lançamento com atualização em lista e resumo.
Testes regressão: duplicidade de parcelas e inconsistência entre lista e totais.
3. Orçamento mensal por categoria.
Testes unitários: consumo de orçamento, rollover, cálculo de saldo de categoria.
Testes integração: definir limite, lançar despesa, receber alerta de limite.
Testes regressão: mudança de mês não deve contaminar orçamento anterior.
4. Calendário financeiro e lembretes.
Testes unitários: cálculo de próximos vencimentos e janelas de notificação.
Testes integração: criação de lembrete e render no calendário com timezone correto.
Testes regressão: lembretes não podem duplicar ao reabrir app.
5. Importação/Exportação CSV.
Testes unitários: parser, validação de colunas, normalização de valor/data.
Testes integração: importar arquivo válido e invalidar arquivo malformado com erro amigável.
Testes regressão: deduplicação por hash/chave composta.
6. Sync cloud MVP (Supabase).
Testes unitários: merge por `version + updated_at`, serialização e fila de sync.
Testes integração: offline create -> online sync -> consistência entre dispositivos.
Testes regressão: conflito simultâneo em dois devices.

## 7. Release 2 (automação e diferenciação) com plano de testes por feature
1. Open Finance Brasil.
Testes unitários: mapeamento de transações do provedor para modelo interno.
Testes integração: conectar instituição, sincronizar e atualizar extrato.
Testes regressão: expiração/renovação de consentimento sem perda de dados.
2. Insights automáticos.
Testes unitários: detecção de recorrência e anomalia de gasto.
Testes integração: geração de insight após novos lançamentos sincronizados.
Testes regressão: evitar falso positivo em mês com sazonalidade.
3. Metas financeiras.
Testes unitários: progresso, projeção mensal e regras de atraso.
Testes integração: criar meta, contribuir e refletir progresso no painel.
Testes regressão: alteração de meta não pode recalcular histórico de forma incorreta.
4. Previsão de fluxo de caixa.
Testes unitários: projeção 30/60/90 com recorrências e faturas.
Testes integração: previsão atualizada após novos eventos financeiros.
Testes regressão: projeção não pode ignorar transferência entre contas.
5. Compartilhamento opcional.
Testes unitários: permissões de leitura/edição por membro.
Testes integração: usuário convidado com escopo restrito.
Testes regressão: garantir isolamento de dados entre famílias.

## 8. Mudanças importantes de APIs/interfaces/tipos
1. `Transaction` passa para modelo normalizado com `amount_cents`, `currency`, `status`, `source`, `version`.
2. Inclusão de `Account`, `CreditCard`, `Invoice`, `Budget`, `Goal`, `RecurringRule`, `ImportJob`, `OpenFinanceConnection`.
3. Contratos obrigatórios de serviço: `TransactionService`, `BudgetService`, `SyncService`, `OpenFinanceService`.
4. Erros padronizados com códigos (`VALIDATION_ERROR`, `SYNC_CONFLICT`, `AUTH_REQUIRED`, `PROVIDER_ERROR`).
5. DTOs de entrada e saída versionados para evitar breaking changes silenciosos.

## 9. Pipeline CI/CD e Quality Gates (obrigatórios)
1. PR gate: `lint`, `tsc --noEmit`, `test:unit`, `test:integration`, `detox smoke`.
2. Nightly gate: suíte completa de regressão e relatório de flakiness.
3. Cobertura mínima global: 85%.
4. Cobertura mínima para domínio e sync: 95%.
5. Bloqueio de merge para testes frágeis ou intermitentes sem correção.
6. Checklist de PR exigido: evidência de TDD e impacto de performance.

## 10. Critérios de aceite por história (Definition of Done)
1. Testes unitários e integração escritos antes da implementação final.
2. Regressão adicionada para todo bug crítico ou edge case de alto risco.
3. Sem violações de lint/typing.
4. Sem degradação acima de 10% nos budgets de performance.
5. Observabilidade adicionada para falhas novas relevantes.
6. Documentação curta da feature em `docs/features/<feature>.md`.

## 11. Cenários de regressão transversais
1. Login e restauração de sessão.
2. Criação e atualização de transação com reflexo em dashboard e resumo.
3. Troca de mês em resumo sem quebra de totais.
4. Sync offline/online com reconciliação.
5. Logout com limpeza correta de sessão e cache sensível.

## 12. Assumptions e defaults adotados
1. Plataforma principal de desenvolvimento continua Android com Expo.
2. iOS de regressão roda em pipeline cloud quando necessário.
3. Produto permanece PF Brasil-first nesta etapa.
4. Open Finance entra somente na Release 2.
5. Modelo de monetização não altera este escopo técnico.
6. Toda funcionalidade nova seguirá TDD e quality gates sem exceção.
