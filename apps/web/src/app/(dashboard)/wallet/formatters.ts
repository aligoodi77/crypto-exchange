export {
  formatCompactUsd,
  formatPercent,
  formatUsd,
  isPositive,
} from "@/features/markets/formatters";

function toDisplayNumber(value: string | number) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function formatCryptoAmount(value: string | number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 8,
  }).format(toDisplayNumber(value));
}

export function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
