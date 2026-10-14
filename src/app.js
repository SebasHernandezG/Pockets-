import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-700.css';
import './style.css';
import { CATEGORIES, money, today, monthLabel, dateLabel, totals, createPeriod, addExpense, validateBackup, STORAGE_KEY } from './model.js';
import { loadRecords, saveRecords } from './storage.js';

const icons = {
  pocket: '<path d="M5 3h14v12c0 5-7 7-7 7s-7-2-7-7V3Z"/><path d="M5 9h14"/>',
  overview: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  history: '<path d="M3 11a9 9 0 1 1 2.5 7M3 4v7h7M12 7v5l3 2"/>',
  backup: '<path d="M12 3v12m-4-4 4 4 4-4M5 16v5h14v-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  edit: '<path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14Z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.pocket}</svg>`;
const esc = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const app = document.querySelector('#app');
let records, brokenStorage = false;
try { records = loadRecords(); } catch { records = { version: 1, periods: [] }; brokenStorage = true; }
let view = 'overview', selectedId = null, expenseEditor = null, incomeEditor = false, toastTimer;
const active = () => records.periods.find(p => !p.closedAt);
const selected = () => records.periods.find(p => p.id === selectedId) || active();
function toast(message) {
  const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 6000);
}
function commit(next) {
  if (brokenStorage) throw new Error('Primero descarga y revisa los datos locales desde Respaldos.');
  try { saveRecords(next); } catch { throw new Error('No se pudo guardar. Revisa el espacio o los permisos del navegador; descarga un respaldo.'); }
  records = next;
}
const nav = () => `<nav class="navigation" aria-label="Principal">${[['overview', 'Mi registro', 'overview'], ['history', 'Historial', 'history'], ['backup', 'Respaldos', 'backup']].map(([id, label, glyph]) => `<button data-view="${id}" class="nav-item ${view === id ? 'active' : ''}" ${view === id ? 'aria-current="page"' : ''}>${icon(glyph)}<span>${label}</span></button>`).join('')}</nav>`;
function render() {
  app.innerHTML = `<header class="app-header"><div class="header-inner"><a href="#" class="brand" aria-label="Pockets, inicio">${icon('pocket')}<span>pockets<span class="brand-dot">.</span></span></a>${nav()}<span class="currency-tag">CRC <span>· Colones</span></span></div></header>
  <main id="main">${brokenStorage ? '<div class="notice danger" role="alert">No pudimos leer tus datos guardados. Los conservamos sin sobrescribirlos. Ve a Respaldos para descargarlos o restaurar una copia válida.</div>' : ''}${view === 'overview' ? overview() : view === 'history' ? history() : backup()}</main>
  <footer class="app-footer"><span>Tus cuentas claras. Un gasto a la vez.</span><span>Guardado en este navegador</span></footer>`;
  bind();
}
function incomeForm() {
  const p = active();
  return `<section class="form-section" aria-labelledby="income-title"><div class="section-heading"><h2 id="income-title">${p ? 'Tu siguiente ingreso' : 'Empecemos con tu ingreso'}</h2>${p ? '<button class="icon-button" data-cancel-income aria-label="Cancelar nuevo ingreso">' + icon('close') + '</button>' : ''}</div>
    <p class="muted">${p ? 'Cerraremos tu registro actual y descargaremos su PDF. El nuevo ingreso comienza con sus propios gastos, sin arrastrar el saldo anterior.' : 'Agrega el pago, beca u otro ingreso con el que cuentas. Después registra tus gastos.'}</p>
    <form id="income-form"><div class="form-grid"><label>Monto recibido <span class="input-wrap"><span>₡</span><input name="income" type="number" inputmode="decimal" step="0.01" min="0.01" max="999999999.99" required placeholder="0" autofocus></span></label><label>¿De dónde viene?<input name="source" maxlength="80" placeholder="Por ejemplo, salario o beca" required></label><label>Fecha del ingreso<input name="date" type="date" min="${p ? [p.date, ...p.expenses.map(e => e.date)].sort().at(-1) : '1900-01-01'}" max="${today()}" value="${today()}" required></label></div><p id="income-error" class="form-error" role="alert"></p><button class="button primary" type="submit">${icon('plus')}${p ? 'Cerrar registro e iniciar otro' : 'Crear mi primer registro'}</button></form></section>`;
}
function overview() {
  const p = selected();
  const closed = Boolean(p?.closedAt);
  return `<div class="page-heading"><div><h1>${closed ? 'Tu registro cerrado' : 'Tu dinero, en orden.'}</h1><p class="muted">${p ? `${esc(monthLabel(p.date))} <span class="text-divider">/</span> ${esc(p.source)}` : 'Un lugar sencillo para saber cuánto tienes y en qué lo gastas.'}</p></div>${active() && !incomeEditor ? `<button class="button primary" data-new-income>${icon('plus')}Nuevo ingreso</button>` : ''}</div>
    ${(!p || incomeEditor) ? incomeForm() : ''}
    ${p ? periodOverview(p, closed) : emptyOverview()}`;
}
function emptyOverview() {
  return `<section class="first-steps"><div class="empty-pocket">${icon('pocket')}</div><h2>Menos dudas. Más claridad.</h2><p>Tu ingreso será el punto de partida. Aquí verás tu saldo y cada gasto en su categoría.</p><div class="category-preview">${CATEGORIES.map(c => `<span><i style="background:${c.color}"></i>${c.name}</span>`).join('')}</div></section>`;
}
function periodOverview(p, closed) {
  const t = totals(p); const fraction = Math.min(100, t.spent / p.income * 100);
  return `<section class="balance-strip" aria-label="Resumen del registro"><div class="balance-cell"><span>Ingreso recibido</span><strong>${money(p.income)}</strong><small>Desde el ${dateLabel(p.date)}</small></div><div class="balance-cell"><span>Total gastado</span><strong>${money(t.spent)}</strong><small>${p.expenses.length} ${p.expenses.length === 1 ? 'gasto registrado' : 'gastos registrados'}</small></div><div class="balance-cell available ${t.remaining < 0 ? 'negative' : ''}"><span>${t.remaining < 0 ? 'Saldo en negativo' : 'Te queda disponible'}</span><strong>${money(t.remaining)}</strong><small>${t.remaining < 0 ? 'Los gastos superaron tu ingreso' : 'Para lo que viene'}</small></div><div class="budget-meter" role="img" aria-label="${Math.round(fraction)} por ciento del ingreso gastado"><span style="transform:scaleX(${fraction / 100})"></span></div></section>
    ${closed ? `<div class="notice">${icon('check')}Registro cerrado el ${dateLabel(p.closedAt)}. Puedes consultar y descargar su informe.<button class="button subtle" data-pdf="${esc(p.id)}">${icon('backup')}Descargar PDF</button></div>` : t.remaining < 0 ? '<div class="notice danger">Has gastado más de lo recibido. El saldo negativo queda reflejado en tu informe.</div>' : ''}
    <div class="workspace"><section class="ledger" aria-labelledby="categories-title"><div class="section-heading"><h2 id="categories-title">¿En qué se va tu dinero?</h2>${!closed ? `<button class="button subtle" data-add>${icon('plus')}Agregar gasto</button>` : ''}</div>
      <div class="category-table"><div class="category-table-head"><span>Categoría</span><span>Gastado</span><span></span></div>${t.categories.map(c => `<div class="category-row"><span class="category-name"><i style="background:${c.color}"></i>${c.name}</span><strong>${money(c.amount)}</strong>${!closed ? `<button class="icon-button" data-category="${c.id}" aria-label="Agregar gasto de ${c.name}">${icon('plus')}</button>` : '<span></span>'}</div>`).join('')}<div class="category-total"><span>Total de gastos</span><strong>${money(t.spent)}</strong></div></div>
      ${expenseEditor && !closed ? expenseForm(p) : ''}</section>
    <aside class="distribution" aria-labelledby="chart-title"><h2 id="chart-title">Así se distribuyen</h2><p class="muted">Tus gastos por categoría</p>${pie(t)}<div class="chart-legend">${t.categories.filter(c => c.amount > 0).map(c => `<div><span><i style="background:${c.color}"></i>${c.name}</span><strong>${new Intl.NumberFormat('es-CR', { maximumFractionDigits: 1 }).format(c.amount / t.spent * 100)}%</strong></div>`).join('') || '<p class="muted">El gráfico aparecerá al agregar tu primer gasto.</p>'}</div><button class="button outline full" data-pdf="${esc(p.id)}">${icon('backup')}Descargar PDF</button></aside></div>
    ${expenseList(p, closed)}`;
}
function pie(t) {
  if (!t.spent) return '<div class="empty-chart" role="img" aria-label="Todavía no hay gastos"><span>Sin gastos<br><small>Todo por organizar</small></span></div>';
  let start = -Math.PI / 2;
  const slices = t.categories.filter(c => c.amount > 0).map(c => {
    const angle = c.amount / t.spent * Math.PI * 2;
    const end = start + angle;
    const x1 = 100 + 91 * Math.cos(start), y1 = 100 + 91 * Math.sin(start);
    const x2 = 100 + 91 * Math.cos(end), y2 = 100 + 91 * Math.sin(end);
    const d = angle >= Math.PI * 2 - .00001 ? `<circle cx="100" cy="100" r="91" fill="${c.color}"/>` : `<path d="M100 100 L${x1} ${y1} A91 91 0 ${angle > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z" fill="${c.color}"><title>${c.name}: ${money(c.amount)}</title></path>`;
    start = end; return d;
  }).join('');
  return `<svg class="pie-chart" viewBox="0 0 200 200" role="img" aria-label="Gráfico circular de gastos por categoría">${slices}</svg>`;
}
function expenseForm(p) {
  const e = typeof expenseEditor === 'object' ? expenseEditor : {};
  return `<section class="expense-editor" id="expense-editor" aria-labelledby="expense-title"><div class="section-heading"><h3 id="expense-title">${e.id ? 'Editar gasto' : 'Un gasto más, todo claro.'}</h3><button class="icon-button" data-cancel-expense aria-label="Cancelar gasto">${icon('close')}</button></div><form id="expense-form"><div class="form-grid"><label>Categoría<select name="category">${CATEGORIES.map(c => `<option value="${c.id}" ${e.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select></label><label>Monto<span class="input-wrap"><span>₡</span><input name="amount" type="number" inputmode="decimal" min="0.01" max="999999999.99" step="0.01" required value="${e.amount || ''}" placeholder="0"></span></label><label>Fecha<input name="date" type="date" min="${p.date}" max="${today()}" required value="${e.date || today()}"></label><label class="wide">Detalle <span class="optional">(opcional)</span><input name="note" maxlength="120" value="${esc(e.note || '')}" placeholder="Por ejemplo, bus a la universidad"></label></div><p id="expense-error" class="form-error" role="alert"></p><button class="button primary" type="submit">${icon('check')}${e.id ? 'Guardar cambios' : 'Guardar gasto'}</button></form></section>`;
}
function expenseList(p, closed) {
  return `<section class="movements"><div class="section-heading"><h2>Tus movimientos</h2><span class="muted">${p.expenses.length} ${p.expenses.length === 1 ? 'gasto' : 'gastos'}</span></div>${p.expenses.length ? `<div class="movement-list">${[...p.expenses].reverse().map(e => {
    const c = CATEGORIES.find(c => c.id === e.category);
    return `<div class="movement"><div class="movement-description"><i style="background:${c.color}"></i><div><strong>${esc(e.note || c.name)}</strong><span>${c.name} <span class="text-divider">·</span> ${dateLabel(e.date)}</span></div></div><strong class="movement-amount">${money(e.amount)}</strong>${!closed ? `<div class="movement-actions"><button class="icon-button" data-edit="${esc(e.id)}" aria-label="Editar ${esc(e.note || c.name)}">${icon('edit')}</button><button class="icon-button" data-delete="${esc(e.id)}" aria-label="Eliminar ${esc(e.note || c.name)}">${icon('trash')}</button></div>` : ''}</div>`;
  }).join('')}</div>` : '<div class="empty-movements"><p>Aún no hay gastos registrados.</p><span class="muted">Agrega uno y empieza a ver el panorama completo.</span></div>'}</section>`;
}
function history() {
  return `<div class="page-heading"><div><h1>Cada ingreso tiene su historia.</h1><p class="muted">Consulta tus registros y vuelve a descargar sus informes cuando quieras.</p></div></div><section class="history-list">${records.periods.length ? [...records.periods].reverse().map(p => {
    const t = totals(p);
    return `<article class="history-record"><div class="history-title"><h2>${esc(monthLabel(p.date))}</h2><span class="status ${p.closedAt ? '' : 'open'}">${p.closedAt ? 'Cerrado' : 'En curso'}</span></div><p class="muted">${esc(p.source)} · ${dateLabel(p.date)}${p.closedAt ? ` al ${dateLabel(p.closedAt)}` : ''}</p><dl class="history-numbers"><div><dt>Ingreso</dt><dd>${money(p.income)}</dd></div><div><dt>Gastos</dt><dd>${money(t.spent)}</dd></div><div><dt>Saldo</dt><dd class="${t.remaining < 0 ? 'negative-text' : ''}">${money(t.remaining)}</dd></div></dl><div class="history-actions"><button class="button outline" data-open="${esc(p.id)}">Ver registro ${icon('arrow')}</button><button class="button subtle" data-pdf="${esc(p.id)}">${icon('backup')}PDF</button></div></article>`;
  }).join('') : '<div class="empty-movements"><h2>Tu historial comienza con un ingreso.</h2><p class="muted">Al cerrar un registro, lo encontrarás aquí con todos sus gastos.</p><button class="button primary" data-view="overview">Crear mi registro</button></div>'}</section>`;
}
function backup() {
  return `<div class="page-heading"><div><h1>Tus cuentas van contigo.</h1><p class="muted">Guarda una copia y restaura tus registros en otro navegador.</p></div></div><section class="backup-panel"><h2>Una copia de todo</h2><p>El respaldo incluye tus ingresos, gastos e historial. Descárgalo de vez en cuando para conservar tus registros.</p><button class="button primary" data-export>${icon('backup')}Descargar respaldo</button><hr><h2>Restaurar una copia</h2><p>Selecciona un respaldo de Pockets en formato JSON. Reemplazará los registros actuales después de tu confirmación.</p><label class="file-picker">Archivo de respaldo<input id="import-file" type="file" accept=".json,application/json"></label><p class="form-error" id="backup-error" role="alert"></p><hr><div class="storage-note">${icon('pocket')}<p>Los datos se guardan únicamente en este navegador. No se sincronizan entre dispositivos. Si borras los datos del navegador, necesitarás un respaldo para recuperarlos.</p></div>${brokenStorage ? '<button class="button outline" data-raw>Descargar datos locales sin procesar</button>' : ''}</section>`;
}
function go(next) { view = next; selectedId = null; expenseEditor = null; incomeEditor = false; render(); window.scrollTo({ top: 0 }); }
function openExpense(data) {
  expenseEditor = data; render(); document.querySelector('#expense-editor').scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.querySelector('[name="amount"]').focus({ preventScroll: true });
}
async function report(p) {
  const { downloadReport } = await import('./report.js'); downloadReport(p);
}
function downloadJSON(data, name) {
  const url = URL.createObjectURL(new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
}
function bind() {
  document.querySelector('.brand').onclick = e => { e.preventDefault(); go('overview'); };
  document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => go(b.dataset.view));
  document.querySelector('[data-new-income]')?.addEventListener('click', () => { selectedId = null; incomeEditor = true; expenseEditor = null; render(); document.querySelector('[name="income"]').focus(); });
  document.querySelector('[data-cancel-income]')?.addEventListener('click', () => { incomeEditor = false; render(); });
  document.querySelectorAll('[data-category]').forEach(b => b.onclick = () => openExpense({ category: b.dataset.category }));
  document.querySelector('[data-add]')?.addEventListener('click', () => openExpense({ category: 'transporte' }));
  document.querySelector('[data-cancel-expense]')?.addEventListener('click', () => { expenseEditor = null; render(); });
  document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { selectedId = b.dataset.open; view = 'overview'; render(); window.scrollTo({ top: 0 }); });
  document.querySelectorAll('[data-pdf]').forEach(b => b.onclick = async () => {
    b.disabled = true;
    try { await report(records.periods.find(p => p.id === b.dataset.pdf)); toast('Informe PDF descargado.'); } catch { toast('No se pudo generar el PDF. Intenta de nuevo.'); }
    finally { b.disabled = false; }
  });
  document.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openExpense(selected().expenses.find(e => e.id === b.dataset.edit)));
  document.querySelectorAll('[data-delete]').forEach(b => b.onclick = () => {
    if (!confirm('¿Eliminar este gasto? El saldo se actualizará.')) return;
    try { const next = structuredClone(records); const p = next.periods.find(p => p.id === selected().id); if (p.closedAt) return; p.expenses = p.expenses.filter(e => e.id !== b.dataset.delete); commit(next); expenseEditor = null; render(); toast('Gasto eliminado.'); } catch (e) { toast(e.message); }
  });
  document.querySelector('#expense-form')?.addEventListener('submit', e => {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget)); if (data.date > today()) throw new Error('La fecha no puede estar en el futuro.');
      const next = structuredClone(records); const p = next.periods.find(p => p.id === selected().id);
      const expense = addExpense(p, data, expenseEditor?.id || crypto.randomUUID());
      const index = p.expenses.findIndex(e => e.id === expense.id); if (index < 0) p.expenses.push(expense); else p.expenses[index] = expense;
      commit(next); expenseEditor = null; render(); toast('Gasto guardado. Tu saldo está actualizado.');
    } catch (err) { document.querySelector('#expense-error').textContent = err.message; }
  });
  document.querySelector('#income-form')?.addEventListener('submit', async e => {
    e.preventDefault(); const form = e.currentTarget; const button = form.querySelector('[type="submit"]'); button.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(form)); if (data.date > today()) throw new Error('La fecha no puede estar en el futuro.');
      const next = structuredClone(records); const previous = next.periods.find(p => !p.closedAt);
      const p = createPeriod(data.income, data.source, data.date);
      if (previous) {
        const latest = [previous.date, ...previous.expenses.map(e => e.date)].sort().at(-1);
        if (p.date < latest) throw new Error('El nuevo ingreso debe ser posterior o igual al último gasto del registro actual.');
        previous.closedAt = p.date;
      }
      // Generate the report before saving so PDF failures never close the record.
      let pdf; if (previous) { const { createReport } = await import('./report.js'); pdf = createReport(previous); }
      next.periods.push(p); commit(next);
      incomeEditor = false; selectedId = p.id; expenseEditor = null; render();
      if (pdf) pdf.save(`Pockets-${previous.date}-${previous.id.slice(0, 8)}.pdf`);
      toast(previous ? 'Nuevo registro creado. El informe anterior se descargó y quedó en el historial.' : 'Tu primer registro está listo. Agrega un gasto.');
    } catch (err) { const error = document.querySelector('#income-error'); if (error) error.textContent = err.message; else toast(err.message); }
    finally { button.disabled = false; }
  });
  document.querySelector('[data-export]')?.addEventListener('click', () => {
    if (brokenStorage) { toast('Descarga los datos sin procesar para conservarlos.'); return; }
    downloadJSON(records, `Pockets-respaldo-${today()}.json`); toast('Respaldo descargado. Guárdalo en un lugar seguro.');
  });
  document.querySelector('[data-raw]')?.addEventListener('click', () => downloadJSON(localStorage.getItem(STORAGE_KEY) || '{}', `Pockets-datos-locales-${today()}.json`));
  document.querySelector('#import-file')?.addEventListener('change', async e => {
    try {
      const file = e.target.files[0]; if (!file) return;
      if (file.size > 10000000) throw new Error('El archivo excede el límite de 10 MB.');
      const next = validateBackup(JSON.parse(await file.text()));
      if (!confirm(`¿Restaurar ${next.periods.length} registros? Reemplazará tus datos actuales. Descarga primero un respaldo si necesitas conservarlos.`)) { e.target.value = ''; return; }
      const wasBroken = brokenStorage; brokenStorage = false;
      try { commit(next); } catch (err) { brokenStorage = wasBroken; throw err; }
      render(); toast('Respaldo restaurado correctamente.');
    } catch (err) { document.querySelector('#backup-error').textContent = err instanceof SyntaxError ? 'No se pudo leer el archivo JSON. Selecciona un respaldo válido.' : err.message; e.target.value = ''; }
  });
}
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY && e.key !== null) return;
  try { records = loadRecords(); brokenStorage = false; expenseEditor = null; incomeEditor = false; selectedId = null; render(); toast('Registros actualizados desde otra pestaña.'); }
  catch { brokenStorage = true; render(); }
});
render();
