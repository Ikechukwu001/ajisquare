export const LOW_STOCK_THRESHOLD = 5;

// Returns "out", "low", or "ok"
export function stockStatus(stock) {
  const n = Number(stock) || 0;
  if (n <= 0) return "out";
  if (n <= LOW_STOCK_THRESHOLD) return "low";
  return "ok";
}