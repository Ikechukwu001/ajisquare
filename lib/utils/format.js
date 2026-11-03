const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const usdWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatNaira(amount) {
  return naira.format(Number(amount) || 0);
}

// Shows $25 for whole amounts and $25.50 when there are cents
export function formatUsd(amount) {
  const n = Number(amount) || 0;
  return (Number.isInteger(n) ? usdWhole : usdCents).format(n);
}