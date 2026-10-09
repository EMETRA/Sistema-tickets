// Next de producción y navegador contra backend controlado; no Oracle/JWT reales.
const assert = require('node:assert/strict');
const http = require('node:http');
const {spawn} = require('node:child_process');
const {once} = require('node:events');
const {chromium} = require('playwright');

async function run() {
  const user = {id_usuario: '12', nombre: 'Usuario QA controlado', email: 'qa@example.invalid', rol: 'JUZGADO', permisos: [], departamento: 'Prueba'};
  const calls = {myActivity: 0, myStats: 0};
  let fails = true;
  const backend = http.createServer(async (req, res) => {
    let body = ''; for await (const chunk of req) body += chunk;
    const {query = ''} = JSON.parse(body || '{}');
    const json = value => {res.writeHead(200, {'Content-Type': 'application/json'}); res.end(JSON.stringify(value));};
    if (query.includes('query GetUser')) return json({data: {usuario: user}});
    const operation = query.includes('query GetMyActivity') ? 'myActivity' : query.includes('query GetMyStats') ? 'myStats' : null;
    if (!operation) return json({data: {}});
    calls[operation]++;
    assert.equal(req.headers.authorization, 'Bearer qa-token-controlado');
    if (fails) return json({data: null, errors: [{message: 'ORA-00942: consulta interna de prueba', extensions: {code: 'INTERNAL_SERVER_ERROR'}}]});
    return operation === 'myActivity'
      ? json({data: {myActivity: [{tipo: 'Creación de ticket', codigo_ticket: 'QA-CONTROL', descripcion: 'Actividad controlada recuperada', fecha: '2026-10-08T18:00:00.000Z'}]}})
      : json({data: {myStats: {tickets: {ingresados: 2, resueltos: 1, cerrados: 0}, vacaciones: {dias_disponibles: 0, dias_usados: 0}, zonas_a_cargo: [], grafico_mensual: [{mes: '2026-10', tickets: 2}]}}});
  });
  backend.listen(3842, '127.0.0.1'); await once(backend, 'listening');
  const next = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3841', '-H', '127.0.0.1'], {env: {...process.env, GRAPHQL_ENDPOINT: 'http://127.0.0.1:3842/graphql', API_PORTAL_URL: 'http://127.0.0.1:3842', NEXT_TELEMETRY_DISABLED: '1'}, stdio: ['ignore', 'pipe', 'pipe']});
  let output = ''; next.stdout.on('data', b => output += b); next.stderr.on('data', b => output += b);
  let browser;
  try {
    for (let i = 0; !output.includes('Ready in') && i < 200; i++) {
      if (next.exitCode !== null) throw new Error(output);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert(output.includes('Ready in'));
    browser = await chromium.launch({executablePath: process.env.QA_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage']});
    const context = await browser.newContext({viewport: {width: 1440, height: 1100}});
    const page = await context.newPage();
    await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    await page.goto('http://127.0.0.1:3841/login');
    await context.addCookies([{name: 'auth_token', value: 'qa-token-controlado', url: 'http://127.0.0.1:3841'}, {name: 'auth_role', value: 'USUARIO', url: 'http://127.0.0.1:3841'}]);
    await page.evaluate(user => localStorage.setItem('auth-storage', JSON.stringify({state: {token: 'qa-token-controlado', user, userId: user.id_usuario}, version: 0})), user);
    await page.goto('http://127.0.0.1:3841/home');
    await page.getByRole('button', {name: 'Reintentar actividad'}).waitFor();
    await page.getByRole('button', {name: 'Reintentar reporte'}).waitFor();
    await page.getByText('JUZGADO', {exact: true}).waitFor();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('auth-storage')).state.user.rol), 'JUZGADO');
    assert.equal((await context.cookies()).find(cookie => cookie.name === 'auth_role').value, 'USUARIO');
    assert.equal(await page.getByText('Reporte durante el año', {exact: true}).count(), 0);
    assert(!(await page.locator('body').innerText()).includes('ORA-'));
    assert.deepEqual(calls, {myActivity: 1, myStats: 1});
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('auth-storage')).state.token), 'qa-token-controlado');
    fails = false;
    await page.getByRole('button', {name: 'Reintentar actividad'}).click();
    await page.getByText('Actividad controlada recuperada', {exact: true}).waitFor();
    await page.getByRole('button', {name: 'Reintentar reporte'}).click();
    await page.getByText('Reporte durante el año', {exact: true}).waitFor();
    assert.equal(await page.getByRole('alert').filter({hasText: 'No se pudo cargar'}).count(), 0);
    assert.equal(await page.getByRole('button', {name: /^Reintentar (actividad|reporte)$/}).count(), 0);
    assert.deepEqual(calls, {myActivity: 2, myStats: 2});
    assert(output.includes('PANEL_INICIO_FALLIDO'));
    console.log('OK | Inicio: ORA controlado sin detalles públicos/reporte falso; una consulta inicial por bloque; reintentos recuperan datos y conservan sesión.');
  } finally {
    if (browser) await browser.close();
    next.kill('SIGTERM'); backend.close();
  }
}
run().catch(error => {console.error(error); process.exitCode = 1;});
