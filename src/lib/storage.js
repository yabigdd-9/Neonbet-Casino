// Formatting + safe localStorage helpers (React-free).

export function formatMoney(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "$0.00";
  return `$${value.toFixed(2)}`;
}

export function readStoredArray(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writeStoredArray(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore */
  }
}

/** @template [T=null] @param {string} key @param {T} [fallback] @returns {T} */
export function readStoredValue(key, fallback = /** @type {T} */ (null)) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStoredValue(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export default { formatMoney, readStoredArray, writeStoredArray, readStoredValue, writeStoredValue };

export const isStoredUser = (value) =>
  Boolean(
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof value.id === "string" &&
    value.id.startsWith("local-") &&
    typeof value.username === "string" &&
    value.username.length <= 80,
  );
export function readUserRecords(key, userId) {
  if (!userId) return [];
  const scopedKey = `${key}:${userId}`;
  const scoped = readStoredValue(scopedKey, null);
  const valid = (row) =>
    row &&
    typeof row === "object" &&
    row.user_id === userId &&
    typeof row.id === "string" &&
    typeof row.status === "string" &&
    typeof row.created_at === "string";
  const rows = (Array.isArray(scoped) ? scoped : readStoredArray(key)).filter(valid);
  if (scoped === null) writeStoredArray(scopedKey, rows);
  return rows;
}
export function writeUserRecords(key, userId, rows) {
  writeStoredArray(
    `${key}:${userId}`,
    rows.filter((row) => row.user_id === userId),
  );
}
