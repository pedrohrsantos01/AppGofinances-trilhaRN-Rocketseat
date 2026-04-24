import { Money } from "../domain/value-objects/Money";

export function formatCents(cents: number): string {
  return Money.fromCents(cents).toFormatted();
}

export function decimalStringToCents(value: string): number {
  return Money.fromDecimal(parseFloat(value.replace(",", "."))).toCents();
}

export function centsToDecimalString(cents: number): string {
  return String(Money.fromCents(cents).toDecimal());
}
