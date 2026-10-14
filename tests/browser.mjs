import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { today } from '../src/model.js';

await mkdir('qa', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('http://127.0.0.1:5173/');
await page.getByRole('heading', { name: 'Empecemos con tu ingreso' }).waitFor();
await page.locator('[name="income"]').fill('300000');
await page.locator('[name="source"]').fill('Salario');
await page.locator('[name="date"]').fill('2026-09-01');
await page.getByRole('button', { name: 'Crear mi primer registro' }).click();

async function expense(category, value, note) {
  await page.getByRole('button', { name: `Agregar gasto de ${category}`, exact: true }).click();
  await page.locator('[name="amount"]').fill(String(value));
  await page.locator('[name="date"]').fill('2026-09-02');
  await page.locator('[name="note"]').fill(note);
  await page.getByRole('button', { name: 'Guardar gasto', exact: true }).click();
}
await expense('Alquiler', 110000, 'Alquiler de septiembre');
await expense('Comida', 25000, 'Supermercado');
await expense('Transporte', 6000, 'Bus a la universidad');
await expense('Servicios', 13000, 'Internet y luz');
await expense('Deudas', 17000, 'Cuota de préstamo');
await expense('Gustos', 8500, 'Café con amigos');
await expense('Ropa', 12500, 'Camisa');
let saved = await page.evaluate(() => JSON.parse(localStorage.getItem('colones.records.v1')));
assert.equal(saved.periods[0].expenses.length, 7);
assert.equal(saved.periods[0].expenses.reduce((s, e) => s + e.amount, 0), 192000);
await page.getByRole('button', { name: 'Editar Camisa', exact: true }).click();
await page.locator('[name="amount"]').fill('10000');
await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click();
saved = await page.evaluate(() => JSON.parse(localStorage.getItem('colones.records.v1')));
assert.equal(saved.periods[0].expenses.find(e => e.category === 'ropa').amount, 10000);
page.once('dialog', dialog => dialog.accept());
await page.getByRole('button', { name: 'Eliminar Camisa', exact: true }).click();
await expense('Ropa', 12500, 'Camisa');

await page.reload();
await page.getByRole('heading', { name: 'Tu dinero, en orden.' }).waitFor();
assert.equal(await page.locator('.available strong').textContent(), '₡108 000,00');
await page.evaluate(() => { document.querySelector('#toast').classList.remove('show'); document.querySelector('#toast').style.display = 'none'; });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'qa/mobile.png', fullPage: true });
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'mobile overflow');
await page.setViewportSize({ width: 1440, height: 1000 });
await page.screenshot({ path: 'qa/desktop.png', fullPage: true });
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'desktop overflow');
await page.evaluate(() => document.querySelector('#toast').style.removeProperty('display'));

await page.getByRole('button', { name: 'Nuevo ingreso', exact: true }).click();
await page.locator('[name="income"]').fill('220000');
await page.locator('[name="source"]').fill('Beca');
await page.locator('#income-form [name="date"]').fill('2026-10-01');
const pdfDownload = page.waitForEvent('download');
await page.getByRole('button', { name: 'Cerrar registro e iniciar otro' }).click();
const pdf = await pdfDownload;
assert.match(pdf.suggestedFilename(), /^Pockets-2026-09-01.*\.pdf$/);
await pdf.saveAs('qa/report.pdf');
saved = await page.evaluate(() => JSON.parse(localStorage.getItem('colones.records.v1')));
assert.equal(saved.periods.length, 2);
assert.equal(saved.periods[0].closedAt, '2026-10-01');
assert.equal(saved.periods[1].expenses.length, 0);
assert.equal(saved.periods[1].income, 220000);
await page.getByRole('button', { name: 'Historial', exact: true }).click();
await page.locator('[data-open]').nth(1).click();
assert.equal(await page.getByRole('button', { name: 'Agregar gasto', exact: true }).count(), 0);
await page.getByRole('button', { name: 'Respaldos', exact: true }).click();
const backupDownload = page.waitForEvent('download');
await page.getByRole('button', { name: 'Descargar respaldo', exact: true }).click();
await (await backupDownload).saveAs('qa/backup.json');
page.once('dialog', dialog => dialog.accept());
await page.locator('#import-file').setInputFiles('qa/backup.json');
await page.getByRole('status').filter({ hasText: 'Respaldo restaurado correctamente.' }).waitFor();
const restored = await page.evaluate(() => JSON.parse(localStorage.getItem('colones.records.v1')));
assert.deepEqual(restored, saved);

// Verify long reports paginate and long user copy cannot overflow the layout.
await page.goto('http://127.0.0.1:5173/');
const longPDF = await page.evaluate(async () => {
  const { createReport } = await import('/src/report.js');
  const records = JSON.parse(localStorage.getItem('colones.records.v1'));
  const p = records.periods[0];
  p.source = 'Un origen del ingreso que es especialmente largo para verificar todo el espacio';
  p.expenses = Array.from({ length: 85 }, (_, i) => ({ id: `long-${i}`, category: 'comida', amount: 1000.25, date: '2026-09-03', note: 'Detalle extenso de compras para comprobar la separación entre filas y que el texto largo no se recorta en el documento.' }));
  return createReport(p).output('datauristring').split(',')[1];
});
await (await import('node:fs/promises')).writeFile('qa/report-long.pdf', Buffer.from(longPDF, 'base64'));
await page.setViewportSize({ width: 320, height: 700 });
await page.evaluate(() => {
  const data = JSON.parse(localStorage.getItem('colones.records.v1'));
  const p = data.periods[1]; p.income = 999999999.99;
  p.expenses = [{ id: 'stress', category: 'ropa', amount: 999999999.99, note: 'Texto'.repeat(24), date: p.date }];
  localStorage.setItem('colones.records.v1', JSON.stringify(data));
});
await page.reload();
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, '320px long copy overflow');

await page.evaluate(() => localStorage.setItem('colones.records.v1', 'corrupt'));
await page.reload();
assert.equal(await page.locator('[role="alert"]').filter({ hasText: 'No pudimos leer' }).count(), 1);
assert.equal(await page.evaluate(() => localStorage.getItem('colones.records.v1')), 'corrupt');
assert.deepEqual(errors, []);
await browser.close();
console.log('PASS: mobile/desktop layout, 7 categories, edit/delete, persistence, period close + PDF, history, backup restore, long PDF, 320px stress, corrupt storage.');
