// Next compilado; fuente de RRHH y plan ficticios. Sin conexiones institucionales.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const { start } = require('../../scripts/laboratorio/iniciar.cjs');
const { hash } = require('../../scripts/laboratorio/servidor.cjs');
async function run() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'tickets-equipos-rrhh-'));
  const out = process.env.QA_SCREENSHOT_DIR || path.join(dir, 'capturas');
  await fs.mkdir(out, { recursive: true });
  let instance, browser, page, previews = 0, writes = 0, stale = true;
  const errors = [];
  try {
    instance = await start({ port: 4015, file: path.join(dir, 'estado.json'), compiled: true });
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    page.setDefaultTimeout(20000);
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', route => /^https?:/.test(route.request().url()) && new URL(route.request().url()).hostname !== '127.0.0.1' ? route.abort() : route.continue());
    await page.route('**/api/platform/organization/people',route=>route.fulfill({json:{empresa:97,personal:[{empresa:97,empleado:100,nombre:'Colaborador ficticio',puesto:'Analista de prueba',unidad:'Dirección ficticia de Informática',sinUnidad:false,cuentasHabilitadas:1},{empresa:97,empleado:101,nombre:'Jefe de prueba',puesto:'Director',unidadCodigo:11,unidad:null,sinUnidad:true,cuentasHabilitadas:0},...Array.from({length:28},(_,i)=>({empresa:97,empleado:102+i,nombre:'Personal de prueba '+i,puesto:'Analista',unidad:'Dirección ficticia de Informática',sinUnidad:false,cuentasHabilitadas:0}))]}}));
    await page.route('**/api/platform/organization/preview', route => {
      assert.match(route.request().headers().authorization, /^Bearer laboratorio-/);
      previews++;
      return route.fulfill({ json: { huella: (stale ? 'a' : 'b').repeat(64), empresa: 97, sinUsuario: 29, sinUnidad:1, cuentaActualVinculada:false, personal:[{empresa:97,empleado:100,nombre:'Colaborador ficticio',puesto:'Analista de prueba',unidad:'Dirección ficticia de Informática',sinUnidad:false,cuentasHabilitadas:1},{empresa:97,empleado:101,nombre:'Jefe de prueba',puesto:'Director',unidadCodigo:11,unidad:null,sinUnidad:true,cuentasHabilitadas:0},...Array.from({length:28},(_,i)=>({empresa:97,empleado:102+i,nombre:'Personal de prueba '+i,puesto:'Analista',unidad:'Dirección ficticia de Informática',sinUnidad:false,cuentasHabilitadas:0}))],
        unidades: [{ clave: '97:10', nombre: 'Dirección ficticia de Informática', empleados: 29, usuarios: 1 }],
        cambios: [{ id: instance.lab.state.data.ids.it, tipo: 'equipos', accion: 'EDITAR', nombre: 'Dirección ficticia de Informática', unidad: 'Dirección ficticia de Informática', puesto: '', funcion: null },
          { id: '11111111-1111-4111-8111-111111111111', tipo: 'miembros', accion: 'INSERTAR', nombre: 'Colaborador ficticio', unidad: 'Dirección ficticia de Informática', puesto: 'Analista de prueba', funcion: 'MIEMBRO' }] } });
    });
    await page.route('**/api/platform/organization/sync', async route => {
      const req = route.request(), body = req.postDataJSON();
      const proof = instance.lab.state.data.confirmations[req.headers()['x-ticket-confirmation']];
      assert.equal(proof?.paso, 2);
      assert.equal(proof.actor, 1);
      assert.equal(proof.hash, hash({ method: 'POST', path: '/organization/sync', body }));
      if (stale) return route.fulfill({ status: 409, json: { message: 'RRHH o los equipos cambiaron. Actualiza la vista previa antes de confirmar' } });
      writes++;
      return route.fulfill({ json: { aplicados: 2, equipos: 1, sinUsuario: 1 } });
    });
    for (let n = 0; n < 100; n++) { try { if ((await fetch(instance.base + '/home')).status < 500) break; } catch {} await new Promise(r => setTimeout(r, 100)); }
    const visit = async url => { await page.goto(instance.base + url); await page.waitForLoadState('networkidle'); };
    const confirm = async () => {
      await page.getByRole('dialog', { name: 'Revisa el cambio', exact: true }).waitFor();
      assert.equal(writes, 0);
      await page.getByRole('button', { name: 'Confirmar revisión · 1 de 2' }).click();
      await page.getByRole('dialog', { name: 'Confirma y aplica', exact: true }).waitFor();
      assert.equal(writes, 0);
      await page.getByLabel('He revisado la acción y quiero aplicarla.', { exact: true }).check();
      await page.getByRole('button', { name: 'Confirmar y aplicar · 2 de 2' }).click();
    };
    await visit('/__laboratorio/entrar?usuario=1');
    await visit('/espacio/organizacion');
    const people=page.getByRole('region',{name:'Personal de RRHH',exact:true});
    await people.getByRole('button',{name:'Siguiente personal',exact:true}).click();
    await people.getByRole('cell',{name:'Personal de prueba 27',exact:true}).waitFor();
    await people.getByRole('button',{name:'Anterior personal',exact:true}).click();
    await people.getByLabel('Buscar persona, puesto o código',{exact:true}).fill('Jefe');
    await people.getByRole('cell',{name:'Jefe de prueba',exact:true}).waitFor();
    await people.getByRole('cell',{name:'Sin cuenta habilitada',exact:true}).waitFor();
    await people.getByRole('cell',{name:'Unidad 11 · Nombre pendiente',exact:true}).waitFor();
    await people.getByLabel('Buscar persona, puesto o código',{exact:true}).fill('');
    await page.screenshot({ path: path.join(out, 'equipos-vista-previa.png'), fullPage: true });
    for (const width of [1024, 390]) {
      await page.setViewportSize({ width, height: 1100 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'equipos sin desbordamiento ' + width);
      await page.screenshot({ path: path.join(out, 'equipos-' + width + '.png'), fullPage: true });
    }
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.getByRole('button',{name:'Equipos de trabajo',exact:true}).click();
    await page.getByText('Sincronizar equipos desde RRHH',{exact:true}).click();
    const section=page.getByRole('region',{name:'Generación de equipos desde RRHH',exact:true});
    await section.getByRole('button',{name:'Consultar cambios de RRHH',exact:true}).waitFor();
    assert.equal(previews,0,'consultar personas no prepara una sincronización');
    await section.getByRole('button',{name:'Consultar cambios de RRHH',exact:true}).click();
    await section.getByRole('cell',{name:'Analista de prueba',exact:true}).first().waitFor();
    await section.getByRole('button', { name: 'Confirmar sincronización de equipos', exact: true }).click();
    await confirm();
    await section.getByRole('alert').filter({ hasText: 'Actualiza la vista previa' }).waitFor();
    await section.getByRole('cell', { name: 'Analista de prueba', exact: true }).first().waitFor();
    assert.equal(writes, 0);
    stale = false;
    await section.getByRole('button', { name: 'Consultar cambios de RRHH', exact: true }).click();
    await section.getByRole('alert').waitFor({ state: 'hidden' });
    await section.getByRole('button', { name: 'Confirmar sincronización de equipos', exact: true }).click();
    await confirm();
    await section.getByRole('status').filter({ hasText: '2 cambios aplicados' }).waitFor();
    assert.equal(writes, 1);
    await visit('/__laboratorio/entrar?usuario=7');
    await visit('/espacio/organizacion');
    await page.getByRole('alert').filter({ hasText: 'No tienes permiso para consultar esta sección' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Consultar cambios de RRHH', exact: true }).count(), 0);
    assert.deepEqual(errors, []);
    console.log('EQUIPOS_RRHH_BROWSER_OK; vista previa, alcance, puesto, dos confirmaciones, conflicto conservado y aplicación única; capturas=' + out);
  } catch (e) { if (page) { await page.screenshot({ path: path.join(out, 'fallo-equipos.png'), fullPage: true }).catch(() => {}); await fs.writeFile(path.join(out, 'fallo-equipos.txt'), await page.locator('body').innerText()).catch(() => {}); } throw e; }
  finally { await browser?.close(); await instance?.close(); }
}
run().catch(e => { console.error(e); process.exitCode = 1; });
