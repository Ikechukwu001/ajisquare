// Converts 0803..., +234803..., or 234803... into digits-only international format.
export function normalizeWhatsAppNumber(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (/^0\d{10}$/.test(digits)) return "234" + digits.slice(1);
  return digits;
}

// Builds a click-to-chat link. Opening it only prepares a chat, nothing is sent until the person presses send.
export function whatsappLink(number, text = "") {
  const normalized = normalizeWhatsAppNumber(number);
  if (!normalized) return "";
  return `https://wa.me/${normalized}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}