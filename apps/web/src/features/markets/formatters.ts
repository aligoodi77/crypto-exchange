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

export function formatRelativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "unknown";
  }

  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return `${Math.floor(diffHours / 24)}d ago`;
}

export function isStaleMarketPrice(value: string, maxAgeMinutes = 10) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return true;
  }

  return Date.now() - date.getTime() > maxAgeMinutes * 60 * 1000;
}
