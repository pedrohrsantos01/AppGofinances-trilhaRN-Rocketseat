import {
  parseCSV,
  normalizeAmountBR,
  normalizeDateBR,
  deduplicateByHash,
  ParsedRow,
} from "../../../../features/import-export/domain/csvParser";

describe("normalizeAmountBR", () => {
  it("should parse BR format R$ 1.500,30", () => {
    expect(normalizeAmountBR("R$ 1.500,30")).toBe(150030);
  });

  it("should parse plain BR format 1.500,30", () => {
    expect(normalizeAmountBR("1.500,30")).toBe(150030);
  });

  it("should parse simple decimal 150,99", () => {
    expect(normalizeAmountBR("150,99")).toBe(15099);
  });

  it("should parse integer value 100", () => {
    expect(normalizeAmountBR("100")).toBe(10000);
  });

  it("should parse US format 1500.30 as fallback", () => {
    expect(normalizeAmountBR("1500.30")).toBe(150030);
  });

  it("should handle negative values -R$ 200,00", () => {
    expect(normalizeAmountBR("-R$ 200,00")).toBe(-20000);
  });

  it("should handle zero", () => {
    expect(normalizeAmountBR("0")).toBe(0);
  });

  it("should handle whitespace", () => {
    expect(normalizeAmountBR("  R$ 50,00  ")).toBe(5000);
  });
});

describe("normalizeDateBR", () => {
  it("should parse dd/MM/yyyy", () => {
    expect(normalizeDateBR("15/03/2025")).toBe("2025-03-15");
  });

  it("should parse dd-MM-yyyy", () => {
    expect(normalizeDateBR("15-03-2025")).toBe("2025-03-15");
  });

  it("should pass through yyyy-MM-dd", () => {
    expect(normalizeDateBR("2025-03-15")).toBe("2025-03-15");
  });

  it("should handle dd/MM/yy", () => {
    expect(normalizeDateBR("15/03/25")).toBe("2025-03-15");
  });
});

describe("parseCSV", () => {
  it("should parse valid CSV with headers", () => {
    const csv = `data,descricao,valor,tipo
15/03/2025,Supermercado,"R$ 250,00",expense
20/03/2025,Salário,"R$ 5.000,00",income`;

    const result = parseCSV(csv, {
      date: "data",
      name: "descricao",
      amount: "valor",
      type: "tipo",
    });

    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].name).toBe("Supermercado");
    expect(result.rows[0].amount_cents).toBe(25000);
    expect(result.rows[0].date).toBe("2025-03-15");
    expect(result.rows[0].type).toBe("expense");
    expect(result.rows[1].amount_cents).toBe(500000);
    expect(result.errors).toHaveLength(0);
  });

  it("should report error with line number for invalid rows", () => {
    const csv = `data,descricao,valor,tipo
15/03/2025,Supermercado,"R$ 250,00",expense
,Sem data,"R$ 100,00",expense
20/03/2025,Ok,"R$ 50,00",income`;

    const result = parseCSV(csv, {
      date: "data",
      name: "descricao",
      amount: "valor",
      type: "tipo",
    });

    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].line).toBe(3);
  });

  it("should handle semicolon delimiter", () => {
    const csv = `data;descricao;valor;tipo
15/03/2025;Supermercado;250,00;expense`;

    const result = parseCSV(csv, {
      date: "data",
      name: "descricao",
      amount: "valor",
      type: "tipo",
      delimiter: ";",
    });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].amount_cents).toBe(25000);
  });

  it("should throw if required column is missing", () => {
    const csv = `data,descricao,valor
15/03/2025,Supermercado,"R$ 250,00"`;

    expect(() =>
      parseCSV(csv, {
        date: "data",
        name: "descricao",
        amount: "valor",
        type: "tipo_inexistente",
      })
    ).toThrow("tipo_inexistente");
  });

  it("should infer type from negative amount when type column absent", () => {
    const csv = `data,descricao,valor
15/03/2025,Supermercado,"-R$ 250,00"
20/03/2025,Salário,"R$ 5.000,00"`;

    const result = parseCSV(csv, {
      date: "data",
      name: "descricao",
      amount: "valor",
    });

    expect(result.rows[0].type).toBe("expense");
    expect(result.rows[0].amount_cents).toBe(25000);
    expect(result.rows[1].type).toBe("income");
  });

  it("should handle empty CSV", () => {
    const csv = `data,descricao,valor,tipo`;

    const result = parseCSV(csv, {
      date: "data",
      name: "descricao",
      amount: "valor",
      type: "tipo",
    });

    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });
});

describe("deduplicateByHash", () => {
  const rows: ParsedRow[] = [
    { date: "2025-03-15", name: "Supermercado", amount_cents: 25000, type: "expense" },
    { date: "2025-03-15", name: "Supermercado", amount_cents: 25000, type: "expense" },
    { date: "2025-03-20", name: "Salário", amount_cents: 500000, type: "income" },
  ];

  it("should remove exact duplicates", () => {
    const unique = deduplicateByHash(rows);
    expect(unique).toHaveLength(2);
  });

  it("should keep all unique rows", () => {
    const unique = deduplicateByHash([rows[0], rows[2]]);
    expect(unique).toHaveLength(2);
  });
});
