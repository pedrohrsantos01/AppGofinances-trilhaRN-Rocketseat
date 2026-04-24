import {
  centsToDecimalString,
  decimalStringToCents,
  formatCents,
} from "../../../../shared/application/formatMoney";

describe("formatMoney application helpers", () => {
  it("formats cents as BRL currency", () => {
    expect(formatCents(12345).replace(/\s/u, " ")).toBe("R$ 123,45");
  });

  it("converts decimal strings with comma to cents", () => {
    expect(decimalStringToCents("12,34")).toBe(1234);
  });

  it("converts cents to decimal string for forms", () => {
    expect(centsToDecimalString(1234)).toBe("12.34");
  });
});
