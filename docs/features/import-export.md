# Importação/Exportação CSV

## Visão Geral
Importação de transações a partir de CSV (formato brasileiro) e exportação de transações para CSV.

## Domínio

### csvParser
- `normalizeAmountBR(raw)` — converte formatos BR (R$ 1.500,30) para centavos
- `normalizeDateBR(raw)` — converte dd/MM/yyyy para yyyy-MM-dd
- `parseCSV(csv, mapping)` — parser com mapeamento de colunas, suporte a delimitador configurável, erros por linha
- `deduplicateByHash(rows)` — remove duplicatas por hash (date+name+amount+type)

### csvExporter
- `transactionsToCSV(transactions)` — gera CSV com header e valores formatados

## Aplicação
- `processCSVImport(csv, mapping, userId, accountId, categoryId)` — parseia, deduplica e gera Transaction[]
- `exportToCSV(transactions)` — delega para csvExporter

## Testes
- 20 testes unitários em `csvParser.test.ts`
  - 8 para normalizeAmountBR (formatos BR, US, negativos, zero, whitespace)
  - 4 para normalizeDateBR (dd/MM/yyyy, dd-MM-yyyy, ISO, yy curto)
  - 6 para parseCSV (válido, erros com linha, delimitador, coluna ausente, inferência de tipo, vazio)
  - 2 para deduplicateByHash
