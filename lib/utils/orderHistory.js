// Remembers order references in this browser only (no accounts).
const KEY = "fashion-house-orders";
const MAX_SAVED = 20;

export function getSavedReferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(saved) ? saved.filter((r) => typeof r === "string") : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_SAVED)));
  } catch {
    // storage blocked or full, the list just won't be remembered
  }
}

export function saveReference(reference) {
  const others = getSavedReferences().filter((r) => r !== reference);
  write([reference, ...others]);
}

export function removeReference(reference) {
  write(getSavedReferences().filter((r) => r !== reference));
}

// Keeps only references that still exist on the server
export function keepOnly(validReferences) {
  const valid = new Set(validReferences);
  write(getSavedReferences().filter((r) => valid.has(r)));
}