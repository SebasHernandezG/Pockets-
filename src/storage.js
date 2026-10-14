import { STORAGE_KEY, validateBackup } from './model.js';

// Replace this adapter with an API later; calculations and UI stay independent.
export function loadRecords() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? validateBackup(JSON.parse(raw)) : { version: 1, periods: [] };
}
export function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}
