import { Money } from "../../../shared/domain/value-objects/Money";

describe("Money", () => {
  describe("fromDecimal", () => {
    it("should convert 150.99 to 15099 cents", () => {
      expect(Money.fromDecimal(150.99).toCents()).toBe(15099);
    });

    it("should convert 0.1 to 10 cents", () => {
      expect(Money.fromDecimal(0.1).toCents()).toBe(10);
    });

    it("should convert 0.2 to 20 cents", () => {
      expect(Money.fromDecimal(0.2).toCents()).toBe(20);
    });

    it("should convert 19.99 to 1999 cents", () => {
      expect(Money.fromDecimal(19.99).toCents()).toBe(1999);
    });

    it("should handle zero", () => {
      expect(Money.fromDecimal(0).toCents()).toBe(0);
    });

    it("should handle negative values", () => {
      expect(Money.fromDecimal(-50.5).toCents()).toBe(-5050);
    });

    it("should handle floating point edge case 0.1 + 0.2", () => {
      const a = Money.fromDecimal(0.1);
      const b = Money.fromDecimal(0.2);
      expect(a.add(b).toCents()).toBe(30);
    });
  });

  describe("fromCents", () => {
    it("should store exact cents", () => {
      expect(Money.fromCents(15099).toCents()).toBe(15099);
    });

    it("should throw on non-integer", () => {
      expect(() => Money.fromCents(100.5)).toThrow("expects an integer");
    });
  });

  describe("fromString", () => {
    it("should parse valid string", () => {
      expect(Money.fromString("150.99").toCents()).toBe(15099);
    });

    it("should throw on invalid string", () => {
      expect(() => Money.fromString("abc")).toThrow('invalid value "abc"');
    });
  });

  describe("toDecimal", () => {
    it("should convert cents to decimal", () => {
      expect(Money.fromCents(15099).toDecimal()).toBe(150.99);
    });
  });

  describe("toFormatted", () => {
    it("should format as BRL currency", () => {
      const formatted = Money.fromCents(15099).toFormatted("pt-BR", "BRL");
      expect(formatted).toContain("150,99");
    });
  });

  describe("arithmetic", () => {
    it("should add two Money values", () => {
      const a = Money.fromCents(1000);
      const b = Money.fromCents(2500);
      expect(a.add(b).toCents()).toBe(3500);
    });

    it("should subtract two Money values", () => {
      const a = Money.fromCents(5000);
      const b = Money.fromCents(2000);
      expect(a.subtract(b).toCents()).toBe(3000);
    });

    it("should multiply by factor", () => {
      const m = Money.fromCents(1000);
      expect(m.multiply(3).toCents()).toBe(3000);
    });

    it("should multiply and round correctly", () => {
      const m = Money.fromCents(1000);
      expect(m.multiply(0.333).toCents()).toBe(333);
    });
  });

  describe("comparisons", () => {
    it("should detect zero", () => {
      expect(Money.zero().isZero()).toBe(true);
      expect(Money.fromCents(1).isZero()).toBe(false);
    });

    it("should detect positive", () => {
      expect(Money.fromCents(100).isPositive()).toBe(true);
      expect(Money.fromCents(-100).isPositive()).toBe(false);
    });

    it("should detect negative", () => {
      expect(Money.fromCents(-100).isNegative()).toBe(true);
      expect(Money.fromCents(100).isNegative()).toBe(false);
    });

    it("should compare equality", () => {
      const a = Money.fromCents(100);
      const b = Money.fromCents(100);
      expect(a.equals(b)).toBe(true);
    });

    it("should compare greater than", () => {
      expect(Money.fromCents(200).greaterThan(Money.fromCents(100))).toBe(true);
    });

    it("should compare less than", () => {
      expect(Money.fromCents(100).lessThan(Money.fromCents(200))).toBe(true);
    });
  });

  describe("abs and negate", () => {
    it("should return absolute value", () => {
      expect(Money.fromCents(-500).abs().toCents()).toBe(500);
    });

    it("should negate", () => {
      expect(Money.fromCents(500).negate().toCents()).toBe(-500);
    });
  });
});
