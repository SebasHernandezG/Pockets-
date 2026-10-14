import test from 'node:test';
import assert from 'node:assert/strict';
import { amount, totals, createPeriod, addExpense, updateIncome, validateBackup, validDate } from '../src/model.js';

test('editing income preserves the record and expenses, recalculates balance, and rejects closed records', () => {
  const period = createPeriod(157000, 'Salario', '2026-10-01', 'income-edit');
  period.expenses.push(addExpense(period, { category: 'comida', amount: 12000, date: '2026-10-02' }, 'expense-edit'));
  const updated = updateIncome(period, '187000');
  assert.equal(updated.income, 187000);
  assert.equal(updated.id, period.id);
  assert.equal(updated.date, period.date);
  assert.deepEqual(updated.expenses, period.expenses);
  assert.equal(totals(updated).remaining, 175000);
  assert.equal(period.income, 157000);
  assert.throws(() => updateIncome(period, 0));
  assert.throws(() => updateIncome({ ...period, closedAt: '2026-10-03' }, 187000));
});

test('money uses cents: decimal sums and overspending stay accurate', () => {
  const period = createPeriod(100, 'Beca', '2026-10-01', 'period');
  period.expenses.push(addExpense(period, { category: 'comida', amount: 70.10, date: '2026-10-02' }, 'one'));
  period.expenses.push(addExpense(period, { category: 'comida', amount: 40.20, date: '2026-10-03' }, 'two'));
  assert.equal(totals(period).spent, 110.30);
  assert.equal(totals(period).remaining, -10.30);
  assert.equal(totals(period).categories.find(c => c.id === 'comida').amount, 110.30);
});
test('invalid amounts, dates, categories and closed edits are rejected', () => {
  for (const n of [0, -1, Infinity, NaN, 'bad', 1.001, 1e12]) assert.throws(() => amount(n));
  assert.equal(validDate('2026-02-30'), false);
  const period = createPeriod(500, 'Pago', '2026-10-02', 'p');
  assert.throws(() => addExpense(period, { category: 'comida', amount: 10, date: '2026-10-01' }));
  assert.throws(() => addExpense(period, { category: 'otra', amount: 10, date: '2026-10-02' }));
  period.closedAt = '2026-10-03';
  assert.throws(() => addExpense(period, { category: 'comida', amount: 10, date: '2026-10-02' }));
});
test('backup round trip preserves records and rejects malformed or duplicate records', () => {
  const p = createPeriod(200000, 'Salario', '2026-10-01', 'p');
  p.expenses.push(addExpense(p, { category: 'alquiler', amount: 80000, date: '2026-10-01', note: 'Octubre' }, 'e'));
  const backup = { version: 1, periods: [p] };
  assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(backup))), backup);
  assert.throws(() => validateBackup({ version: 1, periods: [p, p] }));
  assert.throws(() => validateBackup({ version: 2, periods: [] }));
  assert.throws(() => validateBackup({ version: 1, periods: [{ ...p, closedAt: '2026-09-30' }] }));
});
