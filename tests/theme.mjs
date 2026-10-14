import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
await mkdir('qa', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ colorScheme: 'light', viewport: { width: 390, height: 844 } });
const page = await context.newPage();
page.setDefaultTimeout(15000);
page.setDefaultNavigationTimeout(15000);
const baseURL = process.env.POCKETS_TEST_URL || 'http://127.0.0.1:5173/';
await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
const toggle = page.getByRole('button', { name: 'Modo oscuro', exact: true });
await toggle.waitFor();
assert.equal(await toggle.getAttribute('aria-pressed'), 'false');
await toggle.focus();
await page.keyboard.press('Space');
assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
assert.equal(await page.evaluate(() => document.activeElement.getAttribute('data-theme-toggle')), '');
assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
await page.reload();
assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
const failures = [];
async function audit(state) {
  console.log(`Checking accessibility: ${state}`);
  await page.evaluate(async () => { await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {}))); });
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  if (result.violations.length) failures.push({ state, violations: result.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ html: n.html, summary: n.failureSummary })) })) });
}
await audit('dark first income');
await page.evaluate(() => {
  localStorage.setItem('colones.records.v1', JSON.stringify({ version: 1, periods: [{ id: 'theme-demo', source: 'Salario', income: 300000, date: '2026-09-01', closedAt: null, expenses: [
    { id: 'a', category: 'alquiler', amount: 110000, date: '2026-09-02', note: 'Alquiler de septiembre' },
    { id: 'b', category: 'comida', amount: 25000, date: '2026-09-02', note: 'Supermercado' },
    { id: 'c', category: 'transporte', amount: 6000, date: '2026-09-02', note: 'Bus a la universidad' },
    { id: 'd', category: 'servicios', amount: 13000, date: '2026-09-02', note: 'Internet y luz' },
    { id: 'e', category: 'deudas', amount: 17000, date: '2026-09-02', note: 'Cuota de préstamo' },
    { id: 'f', category: 'gustos', amount: 8500, date: '2026-09-02', note: 'Café con amigos' },
    { id: 'g', category: 'ropa', amount: 12500, date: '2026-09-02', note: 'Camisa' },
  ] }] }));
});
await page.reload();
await page.evaluate(() => document.fonts.ready);
await audit('dark overview');
await page.screenshot({ path: 'qa/dark-mobile.png', fullPage: true });
await page.setViewportSize({ width: 1440, height: 1000 });
await page.screenshot({ path: 'qa/dark-desktop.png', fullPage: true });
await page.getByRole('button', { name: 'Agregar gasto', exact: true }).click();
await audit('dark expense form');
await page.getByRole('button', { name: 'Cancelar gasto', exact: true }).click();
await page.getByRole('button', { name: 'Historial', exact: true }).click();
await audit('dark history');
await page.getByRole('button', { name: 'Respaldos', exact: true }).click();
await audit('dark backups');
await toggle.focus();
await page.keyboard.press('Enter');
assert.equal(await toggle.getAttribute('aria-pressed'), 'false');
await audit('light backups');
await page.getByRole('button', { name: 'Mi registro', exact: true }).click();
await audit('light overview');
await page.setViewportSize({ width: 320, height: 700 });
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'theme header at 320px');
await page.getByRole('button', { name: 'Agregar gasto', exact: true }).click();
await audit('light expense form');
const system = await browser.newContext({ colorScheme: 'dark' });
const systemPage = await system.newPage();
await systemPage.goto(baseURL, { waitUntil: 'domcontentloaded' });
assert.equal(await systemPage.locator('html').getAttribute('data-theme'), 'dark');
await browser.close();
assert.deepEqual(failures, [], JSON.stringify(failures, null, 2));
console.log('PASS: Space/Enter toggle, ARIA pressed state, retained keyboard focus, saved preference, system preference, mobile header, axe WCAG audits in light/dark views.');
