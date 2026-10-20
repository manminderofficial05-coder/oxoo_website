/**
 * Employee360 Demo Storage Utility
 * Manages persistent state in localStorage for the frontend-only prototype.
 */

const STORAGE_PREFIX = 'employee360_demo_';

export function getDemoData(key, defaultValue) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw === null || raw === undefined) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[demoStorage] Failed to parse "${key}":`, err);
    return defaultValue;
  }
}

export function setDemoData(key, value) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn(`[demoStorage] Failed to store "${key}":`, err);
  }
}

export function removeDemoData(key) {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (err) {
    console.warn(`[demoStorage] Failed to remove "${key}":`, err);
  }
}

export function updateDemoList(key, defaultList, updater) {
  const current = getDemoData(key, defaultList);
  const next = updater(current);
  setDemoData(key, next);
  return next;
}
