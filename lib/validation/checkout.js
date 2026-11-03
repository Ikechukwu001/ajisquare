import { NIGERIAN_STATES } from "@/lib/utils/nigeria";

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

// Accepts 0803 123 4567, +234 803 123 4567, 2348031234567. Returns +234XXXXXXXXXX or null.
export function normalizePhone(raw) {
  const cleaned = String(raw || "").replace(/[\s\-().]/g, "");
  const hasPlus = cleaned.startsWith("+");
  const digits = cleaned.replace(/^\+/, "");

  if (hasPlus && !digits.startsWith("234")) return null;
  if (/^0[789][01]\d{8}$/.test(digits)) return "+234" + digits.slice(1);
  if (/^234[789][01]\d{8}$/.test(digits)) return "+" + digits;
  return null;
}

// Used in the browser (instant feedback) and on the server (the real check).
export function validateCheckout(input = {}) {
  const values = {
    fullName: clean(input.fullName),
    phone: clean(input.phone),
    address: clean(input.address),
    city: clean(input.city),
    state: clean(input.state),
    notes: clean(input.notes),
  };
  const errors = {};

  if (values.fullName.length < 3) errors.fullName = "Please enter your full name.";
  else if (values.fullName.length > 80) errors.fullName = "Name is too long.";

  const phone = normalizePhone(values.phone);
  if (!phone) errors.phone = "Enter a valid Nigerian phone number, e.g. 0803 123 4567.";

  if (values.address.length < 10) errors.address = "Please enter your full delivery address.";
  else if (values.address.length > 200) errors.address = "Address is too long.";

  if (values.city.length < 2) errors.city = "Please enter your city or town.";
  else if (values.city.length > 60) errors.city = "City or town is too long.";

  if (!NIGERIAN_STATES.includes(values.state)) errors.state = "Please select your state.";

  if (values.notes.length > 300) errors.notes = "Please keep notes under 300 characters.";

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: { ...values, phone: phone || values.phone },
  };
}