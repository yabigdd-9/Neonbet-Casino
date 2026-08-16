// Formatting + safe localStorage helpers (React-free).

export function formatMoney(amount: unknown): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "$0.00";
  return `$${value.toFixed(2)}`;
}

export function readStoredArray<T = unknown>(key: string): T[] {
  try {
    return (JSON.parse(window.localStorage.getItem(key) as string) as T[]) || [];
  } catch {
    return [];
  }
}

export function writeStoredArray(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function readStoredValue<T = unknown>(key: string, fallback: T | null = null): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStoredValue(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export default { formatMoney, readStoredArray, writeStoredArray, readStoredValue, writeStoredValue };
