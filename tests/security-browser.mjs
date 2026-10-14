import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';

// Serve the compiled app with the exact headers declared for Vercel.
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const headers = Object.fromEntries(config.headers[0].headers.map(h => [h.key,h.value]));
const root = resolve('dist');
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.woff':'font/woff'};
const server = createServer(async (request,response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + sep)) { response.writeHead(403); response.end(); return; }
    const body = await readFile(file); response.writeHead(200, {...headers,'Content-Type':mime[extname(file)] || 'application/octet-stream'}); response.end(body);
  } catch { response.writeHead(404); response.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({channel:'chrome',headless:true});
try {
  const context = await browser.newContext({acceptDownloads:true});
  const page = await context.newPage();
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  const response = await page.goto(url);
  assert.match(response.headers()['content-security-policy'], /script-src 'self'/);
  await page.evaluate(() => localStorage.setItem('colones.records.v1', JSON.stringify({version:1,periods:[{
    id:'p', income:1000, source:'<img src=x onerror="window.__xss=1">', date:'2026-09-01',closedAt:null,
    expenses:[{id:'e',category:'comida',amount:10,date:'2026-09-01',note:'"><img src=x onerror="window.__xss=1">'}]
  }]})));
  await page.reload();
  assert.equal(await page.evaluate(()=>window.__xss), undefined);
  assert.equal(await page.locator('main img').count(), 0);
  assert.match(await page.locator('main').textContent(), /onerror/);
  await page.getByRole('button',{name:'Modo oscuro',exact:true}).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await page.setViewportSize({ width:390, height:844 });
  await page.getByRole('button',{name:'Editar ingreso',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Editar ingreso',exact:true}).getAttribute('aria-expanded'),'true');
  await page.locator('[name="incomeTotal"]').fill('187000');
  await page.evaluate(async()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));
  const a11y = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(a11y.violations.map(v=>v.id),[]);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),true);
  await page.screenshot({path:'qa/income-edit-mobile.png',fullPage:true});
  await page.getByRole('button',{name:'Guardar ingreso',exact:true}).click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('colones.records.v1')).periods[0].income === 187000, null, {polling:50});
  await page.reload();
  const edited=await page.evaluate(()=>JSON.parse(localStorage.getItem('colones.records.v1')));
  assert.equal(edited.periods.length,1);assert.equal(edited.periods[0].expenses.length,1);assert.equal(edited.periods[0].date,'2026-09-01');
  assert.match(await page.locator('.available strong').textContent(),/186.*990,00/);
  const download = page.waitForEvent('download');
  await page.getByRole('button',{name:'Descargar PDF',exact:true}).click();
  await mkdir('qa',{recursive:true}); await (await download).saveAs('qa/security.pdf');
  const pdfBytes=await readFile('qa/security.pdf');
  assert.equal(pdfBytes.subarray(0,5).toString(),'%PDF-');
  assert.ok(pdfBytes.includes(Buffer.from('CRC 187 000,00')),'PDF uses updated income');
  // CSP prevents an injected inline handler from executing.
  await page.evaluate(()=>{const b=document.createElement('button');b.id='probe';b.setAttribute('onclick','window.__cspBypass=true');document.body.append(b);b.click();b.remove();});
  assert.equal(await page.evaluate(()=>window.__cspBypass),undefined);
  const another = await context.newPage(); await another.goto(url);
  await page.bringToFront();
  // Hold the write lock while another tab replaces the data. The pending write
  // must fail instead of restoring its old copy after the storage event arrives.
  await page.evaluate(()=>{window.heldLock=navigator.locks.request('pockets-records',()=>new Promise(resolve=>window.releaseLock=resolve));});
  await page.waitForFunction(()=>typeof window.releaseLock==='function', null, { polling: 50 });
  await page.getByRole('button',{name:'Agregar gasto de Ropa',exact:true}).click();
  await page.locator('[name="amount"]').fill('20');
  await page.getByRole('button',{name:'Guardar gasto',exact:true}).click();
  await another.evaluate(()=>{const data=JSON.parse(localStorage.getItem('colones.records.v1'));data.periods[0].source='Actualizado en otra pestaña';localStorage.setItem('colones.records.v1',JSON.stringify(data));});
  await page.getByText('Actualizado en otra pestaña',{exact:false}).first().waitFor();
  await page.evaluate(()=>window.releaseLock());
  await page.getByRole('status').filter({hasText:'Recarga la página'}).waitFor();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('colones.records.v1')));
  assert.equal(saved.periods[0].source,'Actualizado en otra pestaña'); assert.equal(saved.periods[0].expenses.length,1);
  await page.evaluate(()=>{const data=JSON.parse(localStorage.getItem('colones.records.v1'));data.periods[0].closedAt='2026-10-01';localStorage.setItem('colones.records.v1',JSON.stringify(data));});
  await page.reload();await page.getByRole('button',{name:'Historial',exact:true}).click();await page.locator('[data-open]').click();
  assert.equal(await page.getByRole('button',{name:'Editar ingreso',exact:true}).count(),0);
  assert.deepEqual(errors,[]);
  console.log('PASS: production CSP/headers, escaped hostile backup text, blocked inline handler, dark theme/PDF under CSP, pending stale tab write rejected.');
} finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
