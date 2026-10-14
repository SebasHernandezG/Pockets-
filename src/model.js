export const CATEGORIES = [
  { id: 'transporte', name: 'Transporte', color: '#527eae' },
  { id: 'gustos', name: 'Gustos', color: '#b56d94' },
  { id: 'comida', name: 'Comida', color: '#d79945' },
  { id: 'alquiler', name: 'Alquiler', color: '#38796a' },
  { id: 'deudas', name: 'Deudas', color: '#c96653' },
  { id: 'servicios', name: 'Servicios', color: '#8c7bb1' },
  { id: 'ropa', name: 'Ropa', color: '#849254' },
];
export const STORAGE_KEY = 'colones.records.v1';
export const MAX_AMOUNT = 999999999.99;
export const MAX_PERIODS = 500;
export const MAX_EXPENSES = 10000;
export const MAX_BACKUP_BYTES = 2000000;
const validId = id => typeof id === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(id);
export const money = value => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 2 }).format(value);
export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Costa_Rica', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const monthLabel = date => new Intl.DateTimeFormat('es-CR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
export const dateLabel = date => new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
export const cents = value => Math.round(Number(value) * 100);
export function amount(value) {
  if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !/^\d+(?:\.\d{1,2})?$/.test(value.trim()))) throw new Error('Escribe un monto numérico válido.');
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || n > MAX_AMOUNT || Math.abs(n * 100 - Math.round(n * 100)) > .0001) throw new Error('Escribe un monto mayor a cero, con máximo dos decimales.');
  return cents(n) / 100;
}
export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number(value.slice(0, 4)) < 1900 || Number(value.slice(0, 4)) > 2100) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function totals(period) {
  const spentCents = period.expenses.reduce((total, expense) => total + cents(expense.amount), 0);
  return { spent: spentCents / 100, remaining: (cents(period.income) - spentCents) / 100,
    categories: CATEGORIES.map(category => ({ ...category, amount: period.expenses.filter(e => e.category === category.id).reduce((s, e) => s + cents(e.amount), 0) / 100 })) };
}
export function createPeriod(income, source, date, id = crypto.randomUUID()) {
  if (!validDate(date)) throw new Error('Selecciona una fecha válida.');
  return { id, income: amount(income), source: String(source).trim().slice(0, 80) || 'Ingreso', date, closedAt: null, expenses: [] };
}
export function addExpense(period, data, id = crypto.randomUUID()) {
  if (period.closedAt) throw new Error('Este registro ya está cerrado.');
  if (!CATEGORIES.some(c => c.id === data.category)) throw new Error('Selecciona una categoría.');
  if (!validDate(data.date) || data.date < period.date) throw new Error('La fecha del gasto debe ser igual o posterior al inicio del registro.');
  return { id, category: data.category, amount: amount(data.amount), date: data.date, note: String(data.note || '').trim().slice(0, 120) };
}
export function validateBackup(raw) {
  if (!raw || raw.version !== 1 || !Array.isArray(raw.periods) || raw.periods.length > MAX_PERIODS) throw new Error('El archivo no es un respaldo válido de Pockets.');
  const ids = new Set();
  let open = 0;
  let expenseCount = 0;
  const periods = raw.periods.map(p => {
    if (!p || !validId(p.id) || ids.has(p.id) || typeof p.income !== 'number' || typeof p.source !== 'string' || !p.source.trim() || p.source.length > 80 || !validDate(p.date) || (p.closedAt !== null && (!validDate(p.closedAt) || p.closedAt < p.date)) || !Array.isArray(p.expenses) || p.expenses.length > MAX_EXPENSES) throw new Error('El respaldo contiene registros inválidos.');
    expenseCount += p.expenses.length;
    if (expenseCount > MAX_EXPENSES) throw new Error('El respaldo supera el límite de 10 000 gastos.');
    ids.add(p.id);
    if (!p.closedAt) open++;
    const period = createPeriod(p.income, p.source, p.date, p.id);
    period.expenses = p.expenses.map(e => {
      if (!e || !validId(e.id) || ids.has(e.id) || typeof e.amount !== 'number' || typeof e.note !== 'string' || e.note.length > 120 || (p.closedAt && e.date > p.closedAt)) throw new Error('El respaldo contiene gastos inválidos.');
      ids.add(e.id);
      return addExpense(period, e, e.id);
    });
    period.closedAt = p.closedAt;
    return period;
  });
  if (open > 1) throw new Error('El respaldo tiene más de un registro abierto.');
  return { version: 1, periods };
}
