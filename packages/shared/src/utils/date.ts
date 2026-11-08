export function formatDate(
  date: string | Date,
  format: "short" | "long" | "iso" = "short"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  switch (format) {
    case "short":
      return dateObj.toLocaleDateString("de-CH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    case "long":
      return dateObj.toLocaleDateString("de-CH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    case "iso":
      return dateObj.toISOString();
    default:
      return dateObj.toLocaleDateString();
  }
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleString("de-CH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

