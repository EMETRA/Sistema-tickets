// Backend controlado: verifica la UI y el BFF de producción, sin Oracle/JWT reales.
const assert = require('node:assert/strict');
const http = require('node:http');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');
async function run() {
  const codigo = 'QA-JUZ-8003';
  const permisos = ['VIVI_JUZGADO_CONSULTAR', 'VIVI_JUZGADO_RECIBIR', 'VIVI_JUZGADO_RESOLVER'];
  const user = { id_usuario: '12', nombre: 'Usuario QA controlado', email: 'qa@example.invalid', rol: 'USUARIO', permisos, departamento: 'Prueba' };
  const llamadas = [];
  let sedesFalla = true, sedesVacias = false, perfilFalla = true, recepcionFalla = true, recibida = false, resuelta = false, pdf = false;
  const documento = { id: '80', tipoDocumento: 'RESOLUCION', numeroVersion: '1', versionPlantilla: 'DEN09-BORRADOR-1', mime: 'application/pdf', tamanoBytes: '40', generadoEn: '2026-10-08T20:00:00Z' };
  const detalle = () => ({ codigoCaso: codigo, estadoCaso: resuelta ? 'REMISION_EMITIDA' : recibida ? 'EN_JUZGADO' : 'NOTIFICADA', caso: { id: '8003', codigoCaso: codigo, usoPlaca: 'P', placa: '113BBB', regla: '39', observaciones: 'Observación QA', estado: 'NOTIFICADA', registradaEn: '2026-10-08T17:00:00Z', evidenciasDenuncia: [], defensa: null }, expediente: recibida ? { id: '77', version: '2', codigoJuzgado: 'JUZ_QA', nombreJuzgado: 'Sede QA controlada', direccionJuzgado: 'Dirección QA controlada', horarioJuzgado: 'Horario QA controlado', estado: resuelta ? 'RESUELTO' : 'RECIBIDO', idActorReceptor: '12', recibidaEn: '2026-10-08T18:00:00Z', numeroInterno: 'EXP-QA-77', observacion: null, gestiones: [], resolucion: resuelta ? { id: '79', decision: 'NO_ACOGIDA', fundamento: 'Fundamento QA controlado', autoridadSnapshot: user.nombre, versionPlantilla: 'DEN09-BORRADOR-1', resueltaEn: '2026-10-08T19:00:00Z', idActorJuez: '12' } : null, remision: resuelta ? { ciudad: '1', serie: 'V', numero: '8003' } : null, documentos: pdf ? [documento] : [] } : null });
  const backend = http.createServer(async (req, res) => {
    let body = ''; for await (const chunk of req) body += chunk;
    const datos = body ? JSON.parse(body) : {};
    const json = (data, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); };
    llamadas.push({ ruta: req.url, query: datos.query || '', variables: datos.variables, auth: req.headers.authorization });
    const q = datos.query || '';
    if (req.url.includes('/documento/generar')) { pdf = true; return json(documento); }
    if (req.url.includes('/documentos/')) { res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="resolucion.pdf"' }); return res.end('%PDF-1.4\nQA\n%%EOF'); }
    if (q.includes('mutation Login')) return json({ data: { login: { token: 'qa-token-controlado', refresh_token: 'qa-refresh-controlado', expires_in: 3600 } } });
    if (q.includes('query GetUser')) return perfilFalla ? json({ errors: [{ message: 'ORA-00942 consulta privada', extensions: { code: 'INTERNAL_SERVER_ERROR' } }] }) : json({ data: { usuario: user } });
    if (q.includes('viviJuzgadoDetalle')) return json({ data: { viviJuzgadoDetalle: detalle() } });
    if (q.includes('viviJuzgadoSedes')) return sedesFalla ? json({ errors: [{ message: 'Temporal', extensions: { originalError: { statusCode: 503 } } }] }) : json({ data: { viviJuzgadoSedes: sedesVacias ? [] : [{ codigo: 'JUZ_QA', nombre: 'Sede QA controlada', direccion: 'Dirección QA controlada', horario: 'Horario QA controlado' }] } });
    if (q.includes('viviJuzgadoRegistrarRecepcion')) {
      if (recepcionFalla) return json({ errors: [{ message: 'Temporal', extensions: { originalError: { statusCode: 503 } } }] });
      recibida = true; return json({ data: { viviJuzgadoRegistrarRecepcion: { idExpediente: '77', codigoCaso: codigo, estado: 'RECIBIDO', estadoCaso: 'EN_JUZGADO', reutilizada: false } } });
    }
    if (q.includes('viviJuzgadoResolverNoAcogida')) { resuelta = true; return json({ data: { viviJuzgadoResolverNoAcogida: { idResolucion: '79', codigoCaso: codigo, estadoCaso: 'REMISION_EMITIDA', estadoExpediente: 'RESUELTO', decision: 'NO_ACOGIDA', reutilizada: false, estadoDocumento: 'ERROR_REINTENTABLE', documento: null, remision: { ciudad: '1', serie: 'V', numero: '8003' } } } }); }
    return json({ data: {} });
  });
  backend.listen(3742, '127.0.0.1'); await once(backend, 'listening');
  const next = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3741', '-H', '127.0.0.1'], { env: { ...process.env, GRAPHQL_ENDPOINT: 'http://127.0.0.1:3742/graphql', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let salida = ''; next.stdout.on('data', b => salida += b); next.stderr.on('data', b => salida += b);
  let browser, page;
  try {
    for (let i = 0; !salida.includes('Ready in') && i < 200; i++) { if (next.exitCode !== null) throw new Error(salida); await new Promise(r => setTimeout(r, 100)); }
    assert.ok(salida.includes('Ready in'));
    browser = await chromium.launch({ executablePath: process.env.QA_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, acceptDownloads: true });
    page = await context.newPage();
    await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    await page.goto('http://127.0.0.1:3741/login');
    await page.locator('#email').fill('qa@example.invalid'); await page.locator('#clave').fill('clave-controlada');
    await page.getByRole('button', { name: 'Iniciar Sesión', exact: true }).dblclick();
    await page.getByText('Se obtuvo la respuesta de acceso', { exact: false }).waitFor();
    assert.equal(llamadas.filter(l => l.query.includes('mutation Login')).length, 1);
    assert.equal((await context.cookies()).filter(c => c.name === 'auth_token').length, 0);
    assert.ok(!(await page.locator('body').innerText()).includes('ORA-'));
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('auth-storage')).state.token), null);
    perfilFalla = false;
    // La sesión siguiente es una fixture declarada, no una cuenta administrativa.
    await context.addCookies([{ name: 'auth_token', value: 'qa-token-controlado', url: 'http://127.0.0.1:3741' }, { name: 'auth_role', value: 'USUARIO', url: 'http://127.0.0.1:3741' }]);
    await page.evaluate(({ user }) => localStorage.setItem('auth-storage', JSON.stringify({ state: { token: 'qa-token-controlado', user, userId: user.id_usuario }, version: 0 })), { user });
    const url = `http://127.0.0.1:3741/home/juridico/juz01/juz01/detail?caseNumber=${codigo}`;
    await page.goto(url);
    await page.getByRole('button', { name: 'Reintentar juzgados' }).waitFor();
    assert.ok((await page.locator('body').innerText()).includes(codigo));
    assert.equal(await page.getByRole('button', { name: 'Confirmar recepción de papelería' }).isDisabled(), true);
    sedesFalla = false; sedesVacias = true;
    await page.getByRole('button', { name: 'Reintentar juzgados' }).click();
    await page.getByText('No hay juzgados activos configurados.', { exact: false }).waitFor();
    assert.equal(await page.locator('#juzgado option').count(), 1);
    assert.equal(await page.getByRole('button', { name: 'Confirmar recepción de papelería' }).isDisabled(), true);
    sedesVacias = false;
    await page.getByRole('button', { name: 'Actualizar juzgados' }).click();
    await page.locator('#juzgado option[value=JUZ_QA]').waitFor({ state: 'attached' });
    assert.equal(llamadas.filter(l => l.query.startsWith('mutation') && !l.query.includes('Login')).length, 0);
    const out = process.env.QA_SCREENSHOT_DIR || path.resolve(__dirname, '../../../../capturas'); await fs.mkdir(out, { recursive: true });
    await page.screenshot({ path: path.join(out, 'panel-juzgado.png'), fullPage: true });
    await page.locator('#juzgado').selectOption('JUZ_QA');
    await page.getByText('Dirección QA controlada', { exact: false }).waitFor();
    await page.getByText('Horario QA controlado', { exact: false }).waitFor();
    await page.locator('#numeroInterno').fill('EXP-QA-77');
    assert.ok((await page.locator('#numeroInternoAyuda').innerText()).includes('expediente físico'));
    await page.getByRole('button', { name: 'Confirmar recepción de papelería' }).click();
    await page.getByRole('button', { name: 'Confirmar', exact: true }).dblclick();
    await page.getByRole('alert').filter({ hasText: 'reintentar' }).waitFor();
    assert.equal(llamadas.filter(l => l.query.includes('viviJuzgadoRegistrarRecepcion')).length, 1);
    assert.equal(await page.locator('#juzgado').isDisabled(), true);
    recepcionFalla = false;
    await page.getByRole('button', { name: 'Confirmar recepción de papelería' }).click();
    await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
    await page.getByRole('button', { name: 'Resolver defensa', exact: true }).waitFor();
    await page.getByText('EXP-QA-77', { exact: false }).waitFor();
    const recepciones = llamadas.filter(l => l.query.includes('viviJuzgadoRegistrarRecepcion'));
    assert.deepEqual(recepciones[0].variables, recepciones[1].variables);
    assert.equal(recepciones[0].variables.input.idActor, undefined);
    assert.equal(recepciones[0].variables.input.numeroInterno, 'EXP-QA-77');
    await page.getByRole('button', { name: 'Resolver defensa', exact: true }).click();
    await page.getByText('No acogido', { exact: true }).click(); await page.locator('#fundament').fill('Fundamento QA controlado');
    await page.getByRole('button', { name: 'Enviar resolución', exact: true }).click();
    assert.equal(llamadas.filter(l => l.query.includes('viviJuzgadoResolverNoAcogida')).length, 0);
    await page.getByRole('button', { name: 'Confirmar', exact: true }).dblclick();
    await page.getByRole('button', { name: 'Reintentar PDF de resolución' }).waitFor();
    assert.equal(llamadas.filter(l => l.query.includes('viviJuzgadoResolverNoAcogida')).length, 1);
    await page.getByRole('button', { name: 'Reintentar PDF de resolución' }).click();
    await page.getByRole('button', { name: 'Reintentar PDF de resolución' }).waitFor({ state: 'detached' });
    assert.equal(llamadas.filter(l => l.query.includes('viviJuzgadoResolverNoAcogida')).length, 1);
    const doc = llamadas.find(l => l.ruta.includes('/documento/generar')); assert.equal(doc.auth, 'Bearer qa-token-controlado');
    await page.screenshot({ path: path.join(out, 'panel-resolucion.png'), fullPage: true });
    // El rol USUARIO con permisos vacíos no habilita consulta ni mutaciones.
    await page.evaluate(({ user }) => localStorage.setItem('auth-storage', JSON.stringify({ state: { token: 'qa-token-controlado', user: { ...user, permisos: [] }, userId: user.id_usuario }, version: 0 })), { user });
    const antes = llamadas.length;
    await page.reload(); await page.getByText('Tu cuenta no tiene permiso para consultar casos del juzgado.').waitFor();
    assert.equal(llamadas.slice(antes).filter(l => l.query.includes('viviJuzgado')).length, 0);
    console.log('OK | Perfil 502 sin sesión parcial ni ORA público; JUZ01 conserva el caso ante fallo de sedes, muestra catálogo vacío/dirección/horario/referencia, recepción 503/reintento, doble clic, NO_ACOGIDA, PDF independiente, Bearer y permisos reales. Backend controlado.');
  } catch (error) { console.error('Diagnóstico QA:', JSON.stringify({ rutas: llamadas.map(l => ({ ruta: l.ruta, operacion: l.query.split('{')[0] })), texto: page ? await page.locator('body').innerText() : salida })); throw error; }
  finally { if (browser) await browser.close(); next.kill('SIGTERM'); backend.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
