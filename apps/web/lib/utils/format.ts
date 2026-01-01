/**
 * Format currency values for display
 */
export function formatCurrency(amount: number, currency: string = "CHF"): string {
  return new Intl.NumberFormat("en-CH", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format currency values in compact notation (e.g., $1.25B, $500M)
 */
export function formatCurrencyCompact(amount: number, currency: string = "USD"): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  
  if (absAmount >= 1_000_000_000) {
    return `${sign}${currency === "USD" ? "US$" : currency} ${(absAmount / 1_000_000_000).toFixed(2)}B`;
  } else if (absAmount >= 1_000_000) {
    return `${sign}${currency === "USD" ? "US$" : currency} ${(absAmount / 1_000_000).toFixed(2)}M`;
  } else if (absAmount >= 1_000) {
    return `${sign}${currency === "USD" ? "US$" : currency} ${(absAmount / 1_000).toFixed(2)}K`;
  } else {
    return formatCurrency(amount, currency);
  }
}

/**
 * Format dates in Swiss format (DD.MM.YYYY)
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dateObj);
}

/**
 * Format dates with time
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

/**
 * Format account numbers for display (show last 4 digits)
 */
export function formatAccountNumber(accountNumber: string | null): string {
  if (!accountNumber) return "";
  if (accountNumber.length <= 4) return accountNumber;
  return `****${accountNumber.slice(-4)}`;
}

