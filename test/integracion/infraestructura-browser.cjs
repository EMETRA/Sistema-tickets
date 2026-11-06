// Panel real compilado, observaciones ficticias; no consulta servidores, Docker ni Oracle.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { randomUUID } = require('node:crypto');
const { chromium } = require('playwright');
const { start } = require('../../scripts/laboratorio/iniciar.cjs');
async function run() {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'tickets-infra-'));
  const out = process.env.QA_SCREENSHOT_DIR || path.join(temp, 'capturas');
  await fs.mkdir(out, { recursive: true });
  let instance, browser;
  try {
    instance = await start({ port: 3990, file: path.join(temp, 'estado.json'), compiled: true });
    const first = instance.lab.state.data.ids.servidor, second = randomUUID();
    await instance.lab.state.change(s => {
      s.resources.servidores[0].nombre = 'eme02 · Ejemplo';
      s.resources.servidores.push({ ...s.resources.servidores[0], id: second, nombre: 'consultan · Ejemplo' });
    });
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    page.setDefaultTimeout(25000);
    const errors = [], requests = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', route => /^https?:/.test(route.request().url()) && new URL(route.request().url()).hostname !== '127.0.0.1' ? route.abort() : route.continue());
    let unavailable = false, noData = false, old = false, permission = true;
    await page.route('**/api/platform/bootstrap', async route => {
      const response = await route.fetch();
      const data = await response.json(); data.capabilities.logs = permission;
      await route.fulfill({ response, json: data });
    });
    await page.route('**/api/platform/monitor/**', route => {
      const url = new URL(route.request().url()); requests.push(url.pathname + url.search);
      if (unavailable) return route.fulfill({ status: 503, json: { message: 'Observación no disponible. Reintenta.' } });
      const logs = url.searchParams.get('logs') === '1', other = url.pathname.endsWith(second);
      return route.fulfill({ json: {
        disponible: !noData, estado: noData ? 'SIN_MEDICIONES' : old ? 'DESACTUALIZADO' : 'VIGENTE', observadoEn: noData ? null : new Date().toISOString(),
        metricas: noData ? null : { cpuPorcentaje: 18, memoriaUsadaBytes: 2147483648, memoriaTotalBytes: 8589934592, discoUsadoBytes: 36000000000, discoTotalBytes: 100000000000, uptimeSegundos: 435600 },
        contenedores: noData ? [] : [
          { nombre: other ? 'otro-api' : 'portal-worker', estado: 'running', salud: 'healthy', imagen: 'portal-worker:latest', version: 'a'.repeat(40), ...(logs ? { logs: other ? 'EXTRACTO_SERVIDOR_DOS' : '[INFO] Trabajo completado · dato ficticio', logsEstado: 'DISPONIBLE' } : {}) },
          { nombre: 'api-ejemplo', estado: 'running', salud: 'unhealthy', imagen: 'api:latest', version: null, ...(logs ? { logsEstado: 'SIN_LINEAS' } : {}) },
          { nombre: 'servicio-detenido', estado: 'exited', salud: null, imagen: 'servicio:anterior', version: null, ...(logs ? { logsEstado: 'NO_HABILITADO' } : {}) },
        ],
      } });
    });
    for (let i = 0; i < 100; i++) {
      try { if ((await fetch(instance.base + '/home')).status < 500) break; } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    await page.goto(instance.base + '/__laboratorio');
    await page.getByRole('link', { name: /Administración ficticia/ }).click();
    await page.getByRole('heading', { name: 'Control de Informática', exact: true }).waitFor();
    await page.goto(instance.base + '/espacio/infraestructura');
    await page.getByLabel('Servidor', { exact: true }).selectOption(first);
    await page.getByText('Observador conectado', { exact: true }).waitFor();
    assert.ok(requests.every(url => !url.includes('logs=1')));
    await page.getByRole('button', { name: 'Ver logs de portal-worker', exact: true }).click();
    await page.getByText('[INFO] Trabajo completado · dato ficticio', { exact: true }).waitFor();
    const selector = page.getByLabel('Contenedor', { exact: true });
    assert.equal(await selector.inputValue(), 'portal-worker');
    await page.getByRole('button', { name: 'Actualizar mediciones', exact: true }).click();
    await page.getByRole('button', { name: 'Actualizar mediciones', exact: true }).waitFor();
    assert.equal(await selector.inputValue(), 'portal-worker');
    await page.getByRole('button', { name: 'Servidores y contenedores', exact: true }).click();
    await page.getByRole('button', { name: 'Monitoreo', exact: true }).click();
    await page.getByText('[INFO] Trabajo completado · dato ficticio', { exact: true }).waitFor();
    assert.equal(await selector.inputValue(), 'portal-worker');
    await page.getByRole('button', { name: /Requieren atención/ }).click();
    assert.equal(await page.getByRole('cell', { name: 'portal-worker', exact: true }).count(), 0);
    await page.getByRole('cell', { name: 'api-ejemplo', exact: true }).waitFor();
    await page.getByRole('button', { name: /^Todos/ }).click();
    await page.getByLabel('Buscar contenedor', { exact: true }).fill('portal');
    assert.equal(await page.getByRole('cell', { name: 'api-ejemplo', exact: true }).count(), 0);
    await page.getByLabel('Buscar contenedor', { exact: true }).fill('');
    await page.screenshot({ path: path.join(out, 'infraestructura-desktop.png'), fullPage: true });
    await page.getByRole('region', { name: 'Logs del contenedor', exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(out, 'infraestructura-logs.png'), fullPage: true });
    for (const width of [1024, 390]) {
      await page.setViewportSize({ width, height: 1100 });
      await page.getByLabel('Servidor', { exact: true }).scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(out, 'infraestructura-' + width + '.png'), fullPage: true });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'sin desbordamiento a ' + width + ': ' + JSON.stringify(await page.evaluate(() => Array.from(document.querySelectorAll('body *')).filter(e => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 12).map(e => ({tag: e.tagName, className: e.className, width: e.getBoundingClientRect().width, x: e.getBoundingClientRect().x})))));
    }
    await selector.selectOption('api-ejemplo');
    await page.getByText(/no hubo líneas de log/).waitFor();
    await selector.selectOption('servicio-detenido');
    await page.getByText(/no está habilitada en el observador/).waitFor();
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.getByLabel('Servidor', { exact: true }).selectOption(second);
    await page.getByRole('cell', { name: 'otro-api', exact: true }).waitFor();
    assert.equal(await page.getByText('[INFO] Trabajo completado · dato ficticio', { exact: true }).count(), 0);
    assert.equal(await page.getByRole('checkbox', { name: 'Consultar logs autorizados' }).isChecked(), false);
    unavailable = true;
    await page.getByRole('button', { name: 'Actualizar mediciones', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Observación no disponible' }).waitFor();
    await page.getByRole('cell', { name: 'otro-api', exact: true }).waitFor();
    unavailable = false; old = true;
    await page.getByRole('button', { name: 'Actualizar mediciones', exact: true }).click();
    await page.getByText('Mediciones desactualizadas', { exact: true }).waitFor();
    noData = true;
    await page.getByRole('button', { name: 'Actualizar mediciones', exact: true }).click();
    await page.getByRole('heading', { name: 'Esperando la primera observación' }).waitFor();
    noData = false; old = false; permission = false; requests.length = 0;
    await page.reload();
    await page.getByLabel('Servidor', { exact: true }).selectOption(first);
    await page.getByRole('cell', { name: 'portal-worker', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: /Ver logs de/ }).count(), 0);
    assert.equal(await page.getByRole('checkbox', { name: 'Consultar logs autorizados' }).count(), 0);
    assert.ok(requests.every(url => !url.includes('logs=1')));
    assert.deepEqual(errors, []);
    console.log('INFRAESTRUCTURA_BROWSER_OK; selección conservada, filtros, cambio de servidor, fallo, vencimiento, ausencia y permiso; capturas=' + out);
  } finally { await browser?.close(); await instance?.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
