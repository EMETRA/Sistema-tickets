// Next/BFF reales y permisos/consultas ficticios de loopback. No usa Oracle.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { parse, getOperationAST } = require('graphql');
const { chromium } = require('playwright');
const { start } = require('../../scripts/laboratorio/iniciar.cjs');
async function run() {
  const root = path.resolve(__dirname, '../..');
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'tickets-acceso-previo-'));
  const out = process.env.QA_SCREENSHOT_DIR || path.join(dir, 'capturas');
  await fs.mkdir(out, { recursive: true });
  const calls = [], errors = [];
  function graphql({ query, variables = {} }) {
    const name = getOperationAST(parse(query)).selectionSet.selections[0].name.value;
    const data = {
      funcionesPorUsuarioEmpresas: [{ empresa: '97', nombre: 'Empresa ficticia' }],
      funcionesPorUsuarioUsuarios: [{ asignaUsuario: '7', usuario: 'Persona ficticia' }],
      funcionesPorUsuarioAplicaciones: [{ aplicacion: '13', nombre: 'Aplicación ficticia' }],
      funcionesPorUsuarioPermisos: { ...variables.input, totalPermitidas: 1, funciones: [{ funcion: 1, nombre: 'Consultar', permitido: true }] },
      reporteRhEstatusOpciones: [{ codigo: 'ACTIVO', etiqueta: 'Activo' }],
      reporteRhCamposDisponibles: [{ codigo: 'EMPLEADO', etiqueta: 'Empleado' }],
    };
    if (!Object.hasOwn(data, name)) return undefined;
    calls.push(name); return { data: { [name]: data[name] } };
  }
  const access = (id, allowed, edit = false) => ({ moduloId: id, allowed, actions: { LEER: allowed, INSERTAR: false, EDITAR: edit, ELIMINAR: false } });
  let instance, browser, page;
  try {
    instance = await start({ port: 4035, file: path.join(dir, 'estado.json'), compiled: true, graphql });
    const { APPS_CATALOG_DUMMY } = require('./load-ts.cjs')(root)('src/api/graphql/home/appsCatalog.dummy.ts');
    await instance.lab.state.change(s => { s.applicationCatalog = APPS_CATALOG_DUMMY; s.moduleAccess = { 7: { mod04: access('mod04', false), mod05: access('mod05', true), mod06: access('mod06', true) } }; });
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    page = await browser.newPage({ viewport: { width: 1440, height: 1100 } }); page.setDefaultTimeout(20000);
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', route => /^https?:/.test(route.request().url()) && new URL(route.request().url()).hostname !== '127.0.0.1' ? route.abort() : route.continue());
    for (let i = 0; i < 100; i++) { try { if ((await fetch(instance.base + '/home')).status < 500) break; } catch {} await new Promise(r => setTimeout(r, 100)); }
    const visit = async url => { await page.goto(instance.base + url); await page.waitForLoadState('networkidle'); };
    await visit('/__laboratorio/entrar?usuario=7');
    await visit('/home/rrhh/formularios/mod04');
    await page.getByRole('heading', { name: 'Sin acceso a este formulario', exact: true }).waitFor();
    assert.equal(await page.locator('#company').count(), 0); assert.equal(calls.length, 0);
    await page.screenshot({ path: path.join(out, 'nomina-sin-permiso.png'), fullPage: true });
    let release;
    const pending = new Promise(resolve => { release = resolve; });
    let first = true;
    await page.route('**/api/platform/module-access/mod05', async route => {
      if (first) { first = false; await pending; return route.fulfill({ status: 503, json: { codigo: 'NO_DISPONIBLE' } }); }
      return route.fulfill({ json: access('mod05', true) });
    });
    await page.goto(instance.base + '/home/rrhh/formularios/mod05');
    await page.getByRole('status').filter({ hasText: 'Comprobando acceso al formulario' }).waitFor();
    assert.equal(await page.locator('#status').count(), 0); assert.equal(calls.length, 0);
    release();
    await page.getByRole('heading', { name: 'Acceso pendiente de comprobar', exact: true }).waitFor();
    assert.equal(await page.locator('#status').count(), 0); assert.equal(calls.length, 0);
    await page.getByRole('button', { name: 'Reintentar acceso', exact: true }).click();
    await page.getByLabel('Empleado', { exact: true }).waitFor({ state: 'attached' }); assert.ok(calls.includes('reporteRhCamposDisponibles'));
    await page.unroute('**/api/platform/module-access/mod05');
    await instance.lab.state.change(s => { s.moduleAccess[7].mod05 = access('mod05', false); });
    const before = calls.length;
    await visit('/home/rrhh/formularios/mod05');
    await page.getByRole('heading', { name: 'Sin acceso a este formulario', exact: true }).waitFor();
    assert.equal(await page.locator('#status').count(), 0); assert.equal(calls.length, before);
    await visit('/espacio/accesos?tab=corporate');
    await page.locator('#company').selectOption('97'); await page.locator('#generalUser').selectOption('7'); await page.locator('#application').selectOption('13');
    await page.getByRole('button', { name: 'Consultar permisos', exact: true }).click();
    await page.getByLabel('Consultar', { exact: true }).waitFor();
    assert.equal(await page.getByLabel('Consultar', { exact: true }).isDisabled(), true);
    assert.equal(await page.getByRole('button', { name: 'Guardar permisos', exact: true }).count(), 0);
    assert.equal(await page.locator('#userOrigin').count(), 0);
    await page.screenshot({ path: path.join(out, 'funciones-solo-lectura.png'), fullPage: true });
    for (const width of [1024, 390]) { await page.setViewportSize({ width, height: 1100 }); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'sin desbordamiento ' + width); }
    assert.deepEqual(errors, []);
    console.log('ACCESO_FORMULARIOS_BROWSER_OK; denegación previa, espera, fallo cerrado, reintento, revocación y edición restringida; capturas=' + out);
  } catch (e) { if (page) { await page.screenshot({ path: path.join(out, 'fallo.png'), fullPage: true }).catch(() => {}); await fs.writeFile(path.join(out, 'fallo.txt'), await page.locator('body').innerText()).catch(() => {}); } throw e; }
  finally { await browser?.close(); await instance?.close(); }
}
run().catch(e => { console.error(e); process.exitCode = 1; });
