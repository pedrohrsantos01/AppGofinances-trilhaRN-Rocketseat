# Calendário Financeiro e Lembretes

## Visão Geral
Sistema de lembretes de vencimentos com notificações locais e visualização em calendário.

## Domínio
- `calculateUpcomingDues(reminders, today, daysAhead)` — filtra lembretes pendentes dentro de N dias, exclui concluídos, ordena por data
- `shouldNotify(dueDate, today, daysBefore)` — verifica se hoje está na janela de notificação

## Infraestrutura
- `ReminderRepository` — CRUD via expo-sqlite na tabela `reminders`
- Campos: id, title, due_date, amount_cents, is_completed, recurrence, notify_days_before, user_id

## Aplicação
- `getUpcomingDues(userId, daysAhead)` — busca lembretes pendentes e filtra próximos
- `createReminder(input)` — valida e persiste novo lembrete

## Testes
- 10 testes unitários em `upcomingDues.test.ts` (6 para calculateUpcomingDues, 4 para shouldNotify)
- Cenários: filtragem por dias, exclusão de concluídos, ordenação, boundary, datas passadas, janela de notificação
