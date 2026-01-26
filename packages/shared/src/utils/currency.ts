import type { Currency } from "../types";

export function formatCurrency(
  amount: number,
  currency: Currency = "CHF",
  locale: string = "de-CH"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d.,-]/g, "");
  const normalized = cleaned.replace(",", ".");
  return parseFloat(normalized) || 0;
}

