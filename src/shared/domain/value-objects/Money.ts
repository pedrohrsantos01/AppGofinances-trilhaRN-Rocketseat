export class Money {
  private constructor(private readonly cents: number) {}

  static fromCents(cents: number): Money {
    if (!Number.isInteger(cents)) {
      throw new Error(`Money.fromCents expects an integer, got ${cents}`);
    }
    return new Money(cents);
  }

  static fromDecimal(decimal: number): Money {
    return new Money(Math.round(decimal * 100));
  }

  static fromString(value: string): Money {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      throw new Error(`Money.fromString: invalid value "${value}"`);
    }
    return Money.fromDecimal(parsed);
  }

  static zero(): Money {
    return new Money(0);
  }

  toCents(): number {
    return this.cents;
  }

  toDecimal(): number {
    return this.cents / 100;
  }

  toFormatted(locale: string = "pt-BR", currency: string = "BRL"): string {
    return (this.cents / 100).toLocaleString(locale, {
      style: "currency",
      currency,
    });
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  subtract(other: Money): Money {
    return new Money(this.cents - other.cents);
  }

  multiply(factor: number): Money {
    return new Money(Math.round(this.cents * factor));
  }

  isZero(): boolean {
    return this.cents === 0;
  }

  isPositive(): boolean {
    return this.cents > 0;
  }

  isNegative(): boolean {
    return this.cents < 0;
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  greaterThan(other: Money): boolean {
    return this.cents > other.cents;
  }

  lessThan(other: Money): boolean {
    return this.cents < other.cents;
  }

  abs(): Money {
    return new Money(Math.abs(this.cents));
  }

  negate(): Money {
    return new Money(-this.cents);
  }
}
