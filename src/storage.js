import { STORAGE_KEY, validateBackup, MAX_BACKUP_BYTES } from './model.js';

// Replace this adapter with an API later; calculations and UI stay independent.
export function loadRecordState() {
  const snapshot = localStorage.getItem(STORAGE_KEY);
  if (snapshot && new TextEncoder().encode(snapshot).byteLength > MAX_BACKUP_BYTES) throw new Error('Los datos locales exceden el límite admitido.');
  return { snapshot, records: snapshot === null ? { version: 1, periods: [] } : validateBackup(JSON.parse(snapshot)) };
}
export function saveRecords(records, expectedSnapshot) {
  const normalized = validateBackup(records);
  const snapshot = JSON.stringify(normalized);
  if (new TextEncoder().encode(snapshot).byteLength > MAX_BACKUP_BYTES) throw new Error('Los registros superan 2 MB. Conserva un respaldo antes de iniciar un archivo nuevo.');
  if (localStorage.getItem(STORAGE_KEY) !== expectedSnapshot) throw new Error('Los registros cambiaron en otra pestaña. Recarga la página antes de guardar para evitar sobrescribirlos.');
  try { localStorage.setItem(STORAGE_KEY, snapshot); }
  catch { throw new Error('No se pudo guardar. Revisa el espacio o los permisos del navegador; descarga un respaldo.'); }
  return { snapshot, records: normalized };
}
