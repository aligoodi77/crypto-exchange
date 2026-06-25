function toDisplayNumber(value: string | number) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function formatUsd(value: string | number) {
  const amount = toDisplayNumber(value);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount >= 10 ? 2 : 6,
  }).format(amount);
}

export function formatCompactUsd(value: string | number) {
  const amount = toDisplayNumber(value);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: string | number) {
  const amount = toDisplayNumber(value);
  const sign = amount > 0 ? "+" : "";

  return `${sign}${amount.toFixed(2)}%`;
}

export function isPositive(value: string | number) {
  return toDisplayNumber(value) >= 0;
}
