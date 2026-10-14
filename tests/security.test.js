import test from 'node:test';
import assert from 'node:assert/strict';
import { amount, createPeriod, validateBackup, STORAGE_KEY, MAX_EXPENSES } from '../src/model.js';
import { loadRecordState, saveRecords } from '../src/storage.js';
import { readFileSync } from 'node:fs';

test('both hosts and the static Netlify package carry the same browser restrictions', () => {
  const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const staticHeaders = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');
  const netlify = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8');
  for (const { key, value } of vercel.headers[0].headers) {
    assert.ok(staticHeaders.includes(`${key}: ${value}`), key);
    assert.ok(netlify.includes(`${key} = "${value}"`), key);
  }
});

test('backups reject coerced money, empty or markup IDs, excessive entries and extra fields', () => {
  for (const n of [true, {}, [], '1e3', '0x10', '1.001']) assert.throws(() => amount(n));
  const period = createPeriod(50000, 'Salario', '2026-09-01', 'p');
  for (const id of ['', '" onmouseover="alert(1)', '<script>']) assert.throws(() => validateBackup({version:1, periods:[{...period,id}]}));
  for (const income of ['50000', true]) assert.throws(() => validateBackup({version:1, periods:[{...period,income}]}));
  const e = {id:'e', category:'comida', amount:100, date:'2026-09-01', note:''};
  assert.throws(() => validateBackup({version:1, periods:[{...period, expenses:[{...e,amount:'100'}]}]}));
  assert.throws(() => validateBackup({version:1, periods:[{...period, expenses:Array(MAX_EXPENSES+1).fill(e)}]}));
  const raw = JSON.parse(JSON.stringify({version:1, periods:[period], ignored:'value'}));
  const clean = validateBackup(raw);
  assert.equal(Object.hasOwn(clean, 'ignored'), false);
});

test('storage rejects stale writes, corruption, over-limit data, and preserves existing records on failure', () => {
  const values = new Map();
  globalThis.localStorage = {getItem:key => values.get(key) ?? null, setItem:(key,value) => values.set(key,value)};
  const initial = {version:1,periods:[createPeriod(100, 'Beca', '2026-09-01', 'p')]};
  const written = saveRecords(initial, null);
  assert.deepEqual(loadRecordState().records, initial);
  values.set(STORAGE_KEY, JSON.stringify({version:1,periods:[]}));
  assert.throws(() => saveRecords(initial, written.snapshot), /otra pestaña/);
  assert.deepEqual(JSON.parse(values.get(STORAGE_KEY)), {version:1,periods:[]});
  values.set(STORAGE_KEY, '');
  assert.throws(() => loadRecordState());
  values.set(STORAGE_KEY, 'x'.repeat(2000001));
  assert.throws(() => loadRecordState(), /límite/);
  values.clear();
  globalThis.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => saveRecords(initial, null), /No se pudo guardar/);
  assert.equal(values.size, 0);
  delete globalThis.localStorage;
});
