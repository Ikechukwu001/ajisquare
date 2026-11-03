// Remembers which order the cart was checked out for, so the cart can be
// emptied once THAT order's payment is confirmed (and not before).
const KEY = "fashion-house-checkout";

export function rememberCheckout(reference) {
  try {
    localStorage.setItem(KEY, reference);
  } catch {
    // storage blocked, the cart simply won't auto-clear
  }
}

export function getRememberedCheckout() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function forgetCheckout() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}