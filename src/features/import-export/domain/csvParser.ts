export interface ParsedRow {
  date: string;
  name: string;
  amount_cents: number;
  type: "income" | "expense";
}

export interface CSVParseError {
  line: number;
  message: string;
}

export interface CSVParseResult {
  rows: ParsedRow[];
  errors: CSVParseError[];
}

export interface ColumnMapping {
  date: string;
  name: string;
  amount: string;
  type?: string;
  delimiter?: string;
}

export function normalizeAmountBR(raw: string): number {
  let value = raw.trim();
  const isNegative = value.startsWith("-");
  if (isNegative) value = value.substring(1).trim();

  value = value.replace(/^R\$\s*/, "");

  let decimal: number;

  if (value.includes(",")) {
    // BR format: dots are thousands, comma is decimal
    const clean = value.replace(/\./g, "").replace(",", ".");
    decimal = parseFloat(clean);
  } else {
    // US format or integer
    decimal = parseFloat(value);
  }

  const cents = Math.round(decimal * 100);
  return isNegative ? -cents : cents;
}

export function normalizeDateBR(raw: string): string {
  const trimmed = raw.trim();

  // Already ISO format yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // dd/MM/yyyy or dd-MM-yyyy
  const match = trimmed.match(/^(\d{2})[/-](\d{2})[/-](\d{2,4})$/);
  if (match) {
    const day = match[1];
    const month = match[2];
    let year = match[3];
    if (year.length === 2) {
      year = `20${year}`;
    }
    return `${year}-${month}-${day}`;
  }

  return trimmed;
}

function splitCSVLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

export function parseCSV(csv: string, mapping: ColumnMapping): CSVParseResult {
  const delimiter = mapping.delimiter ?? ",";
  const lines = csv.split("\n").filter((l) => l.trim().length > 0);

  if (lines.length === 0) {
    return { rows: [], errors: [] };
  }

  const headers = splitCSVLine(lines[0], delimiter).map((h) => h.trim().toLowerCase());

  const dateIdx = headers.indexOf(mapping.date.toLowerCase());
  const nameIdx = headers.indexOf(mapping.name.toLowerCase());
  const amountIdx = headers.indexOf(mapping.amount.toLowerCase());
  const typeIdx = mapping.type ? headers.indexOf(mapping.type.toLowerCase()) : -1;

  if (dateIdx === -1) {
    throw new Error(`Coluna não encontrada: ${mapping.date}`);
  }
  if (nameIdx === -1) {
    throw new Error(`Coluna não encontrada: ${mapping.name}`);
  }
  if (amountIdx === -1) {
    throw new Error(`Coluna não encontrada: ${mapping.amount}`);
  }
  if (mapping.type && typeIdx === -1) {
    throw new Error(`Coluna não encontrada: ${mapping.type}`);
  }

  const rows: ParsedRow[] = [];
  const errors: CSVParseError[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = splitCSVLine(lines[i], delimiter);

    const rawDate = fields[dateIdx] ?? "";
    const rawName = fields[nameIdx] ?? "";
    const rawAmount = fields[amountIdx] ?? "";
    const rawType = typeIdx >= 0 ? (fields[typeIdx] ?? "") : "";

    if (!rawDate.trim()) {
      errors.push({ line: i + 1, message: "Data ausente" });
      continue;
    }

    const amountCents = normalizeAmountBR(rawAmount);
    let type: "income" | "expense";

    if (rawType.trim()) {
      type = rawType.trim().toLowerCase() === "income" ? "income" : "expense";
    } else {
      type = amountCents < 0 ? "expense" : "income";
    }

    rows.push({
      date: normalizeDateBR(rawDate),
      name: rawName.trim(),
      amount_cents: Math.abs(amountCents),
      type,
    });
  }

  return { rows, errors };
}

export function deduplicateByHash(rows: ParsedRow[]): ParsedRow[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const hash = `${row.date}|${row.name}|${row.amount_cents}|${row.type}`;
    if (seen.has(hash)) return false;
    seen.add(hash);
    return true;
  });
}
