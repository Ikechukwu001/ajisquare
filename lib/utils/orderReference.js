// Accepts "fh-abcde-fghjk", "FHABCDEFGHJK", or "ABCDEFGHJK" and returns "FH-ABCDE-FGHJK", or null.
export function normalizeReference(input) {
  const raw = String(input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

  let body = null;
  if (raw.length === 12 && raw.startsWith("FH")) body = raw.slice(2);
  else if (raw.length === 10) body = raw;

  if (!body) return null;
  return `FH-${body.slice(0, 5)}-${body.slice(5)}`;
}