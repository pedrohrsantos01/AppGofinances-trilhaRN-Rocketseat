# Sync Cloud MVP (Supabase)

## Visão Geral
Sistema de sincronização offline-first com fila local, merge por version+updated_at e resolução de conflitos.

## Domínio

### syncQueue
- `addToQueue(entityType, entityId, operation, payload)` — cria item na fila com status "pending"
- `mergeByVersion(local, remote)` — resolve merge: version maior vence, updated_at como tiebreaker, server vence em empate exato
- `detectConflict(local, remote, base)` — detecta conflito quando ambos modificaram em relação à base

## Infraestrutura
- `SyncQueueRepository` — CRUD na tabela `sync_queue` via expo-sqlite
- Tabela: id, entity_type, entity_id, operation, payload (JSON), status, retry_count, created_at

## Aplicação
- `enqueueChange(entityType, entityId, operation, payload)` — adiciona operação à fila
- `getPendingCount()` — conta itens pendentes
- `processPendingQueue(syncFn)` — processa fila com função de sync injetada, gerencia status e retries

## Testes
- 11 testes unitários em `syncQueue.test.ts`
  - 4 para addToQueue (insert, update, delete, uniqueness)
  - 4 para mergeByVersion (remote wins, local wins, tiebreaker, exact tie)
  - 3 para detectConflict (both modified, one modified, neither)
