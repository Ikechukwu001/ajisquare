import { normalizePhone } from "@/lib/validation/checkout";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const BULK_CURRENCIES = ["NGN", "USD"];

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

// Used in the browser (instant feedback) and on the server (the real check).
export function validateBulkRequest(input = {}) {
  const errors = {};

  const fullName = clean(input.fullName);
  const businessName = clean(input.businessName);
  const email = clean(input.email).toLowerCase();
  const quantity = clean(input.quantity);
  const deliveryLocation = clean(input.deliveryLocation);
  const referenceImageUrl = clean(input.referenceImageUrl);
  const budgetText = clean(input.estimatedBudget);
  const currency = BULK_CURRENCIES.includes(input.currency) ? input.currency : "NGN";
  const productDescription =
    typeof input.productDescription === "string" ? input.productDescription.trim() : "";

  if (fullName.length < 3 || fullName.length > 80) errors.fullName = "Please enter your full name.";

  if (businessName.length < 2 || businessName.length > 100) {
    errors.businessName = "Enter your business name, or type Individual if you don't have one.";
  }

  const phone = normalizePhone(input.phone);
  if (!phone) errors.phone = "Enter a valid Nigerian phone number, e.g. 0803 123 4567.";

  if (!EMAIL_PATTERN.test(email) || email.length > 120) errors.email = "Enter a valid email address.";

  if (productDescription.length < 10) {
    errors.productDescription = "Please describe the product(s) you need (at least 10 characters).";
  } else if (productDescription.length > 2000) {
    errors.productDescription = "Description is too long (max 2000 characters).";
  }

  if (referenceImageUrl) {
    let validUrl = false;
    try {
      validUrl = new URL(referenceImageUrl).protocol === "https:" && referenceImageUrl.length <= 300;
    } catch {
      validUrl = false;
    }
    if (!validUrl) errors.referenceImageUrl = "Enter a web link starting with https://, or leave it blank.";
  }

  if (quantity.length < 1 || quantity.length > 60) {
    errors.quantity = "Enter the quantity you need, e.g. 200 pieces.";
  }

  let estimatedBudget = null;
  if (budgetText !== "") {
    const cleaned = budgetText.replace(/[,\s₦$]/g, "");
    if (!/^\d+(\.\d{1,2})?$/.test(cleaned) || Number(cleaned) <= 0 || Number(cleaned) > 1e12) {
      errors.estimatedBudget = "Enter a number like 500000, or leave it blank.";
    } else {
      estimatedBudget = Number(cleaned);
    }
  }

  if (deliveryLocation.length < 3 || deliveryLocation.length > 200) {
    errors.deliveryLocation = "Enter where the goods should be delivered (city and state).";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: {
      fullName,
      businessName,
      phone: phone || clean(input.phone),
      email,
      productDescription,
      referenceImageUrl,
      quantity,
      estimatedBudget,
      currency,
      deliveryLocation,
    },
  };
}