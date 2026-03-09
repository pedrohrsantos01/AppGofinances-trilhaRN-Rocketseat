import {
  generateInstallments,
  InstallmentInput,
} from "../../../../features/transactions/domain/installments";

describe("generateInstallments", () => {
  const baseInput: InstallmentInput = {
    name: "TV Samsung",
    total_amount_cents: 300000, // R$ 3.000,00
    installment_count: 3,
    category_id: "purchases",
    account_id: "acc-1",
    credit_card_id: "card-1",
    start_date: "2025-03-15",
    user_id: "user-1",
  };

  it("should generate correct number of installments", () => {
    const result = generateInstallments(baseInput);
    expect(result).toHaveLength(3);
  });

  it("should split amount evenly across installments", () => {
    const result = generateInstallments(baseInput);
    const totalGenerated = result.reduce((sum, t) => sum + t.amount_cents, 0);
    expect(totalGenerated).toBe(300000);
  });

  it("should distribute remainder cents to first installments", () => {
    const input = { ...baseInput, total_amount_cents: 10000, installment_count: 3 };
    const result = generateInstallments(input);

    // 10000 / 3 = 3333 remainder 1 → first gets 3334, rest get 3333
    expect(result[0].amount_cents).toBe(3334);
    expect(result[1].amount_cents).toBe(3333);
    expect(result[2].amount_cents).toBe(3333);
    expect(result.reduce((s, t) => s + t.amount_cents, 0)).toBe(10000);
  });

  it("should set correct installment numbers", () => {
    const result = generateInstallments(baseInput);
    expect(result[0].installment_number).toBe(1);
    expect(result[0].installment_total).toBe(3);
    expect(result[1].installment_number).toBe(2);
    expect(result[2].installment_number).toBe(3);
  });

  it("should share the same installment_group_id", () => {
    const result = generateInstallments(baseInput);
    const groupId = result[0].installment_group_id;
    expect(groupId).toBeDefined();
    expect(result.every((t) => t.installment_group_id === groupId)).toBe(true);
  });

  it("should set correct dates one month apart", () => {
    const result = generateInstallments(baseInput);
    expect(result[0].date).toContain("2025-03");
    expect(result[1].date).toContain("2025-04");
    expect(result[2].date).toContain("2025-05");
  });

  it("should name each installment with number suffix", () => {
    const result = generateInstallments(baseInput);
    expect(result[0].name).toBe("TV Samsung (1/3)");
    expect(result[1].name).toBe("TV Samsung (2/3)");
    expect(result[2].name).toBe("TV Samsung (3/3)");
  });

  it("should set type as expense", () => {
    const result = generateInstallments(baseInput);
    result.forEach((t) => expect(t.type).toBe("expense"));
  });

  it("should throw for installment_count < 2", () => {
    expect(() => generateInstallments({ ...baseInput, installment_count: 1 })).toThrow();
  });

  it("should throw for zero amount", () => {
    expect(() => generateInstallments({ ...baseInput, total_amount_cents: 0 })).toThrow();
  });

  it("should handle year boundary (Nov → Jan)", () => {
    const input = {
      ...baseInput,
      start_date: "2025-11-15",
      installment_count: 4,
    };
    const result = generateInstallments(input);
    expect(result[0].date).toContain("2025-11");
    expect(result[1].date).toContain("2025-12");
    expect(result[2].date).toContain("2026-01");
    expect(result[3].date).toContain("2026-02");
  });
});
