// Panel/BFF de producción, con fuentes y sesión ficticias. No abre conexiones institucionales.
const assert = require('node:assert/strict'), http = require('node:http'), fs = require('node:fs/promises'), path = require('node:path');
const { spawn } = require('node:child_process'), { once } = require('node:events'), { chromium } = require('playwright');
async function main() {
    const directory = process.env.QA_SCREENSHOT_DIR || '/tmp/vivi-reportes-browser';
    await fs.mkdir(directory, { recursive: true });
    const id = '9007199254740993', calls = [], errors = [];
    let allowed = false, failUsers = false, failDetail = false;
    const reference = 'b06f32ff-c167-4575-ad76-d5b5400ae908';
    const account = { id_usuario: '1', nombre: 'Administrador ficticio', email: 'admin@example.invalid', rol: 'ADMINISTRADOR', permisos: ['TICKETS_ADMINISTRAR'], departamento: 'Informática' };
    const user = { id, nombres: 'Ana', apellidos: 'Ejemplo', correo: 'ana@example.invalid', telefono: '+50200000000', activo: true, registradoEn: '2026-11-01T12:00:00Z', avisos: 2, reportes: 1 };
    const allUsers = [user, ...Array.from({ length: 50 }, (_, i) => ({ ...user, id: String(i + 1), nombres: 'Usuario', apellidos: 'Ficticio ' + i, avisos: 0, reportes: 0, activo: i !== 49 }))];
    const activities = [
        { tipo: 'AVISO', id: '1', codigoCaso: 'abc12345-1111-4444-8888-111111111111', usoPlaca: 'P', placa: '000AAA', motivo: 'Aviso de prueba', estado: 'NOTIFICADA' },
        { tipo: 'AVISO', id: '2', codigoCaso: 'def12345-1111-4444-8888-111111111111', usoPlaca: 'P', placa: '111AAA', motivo: 'Otro aviso', estado: 'ARCHIVADA' },
        { tipo: 'REPORTE', id: '1', codigoCaso: null, usoPlaca: null, placa: null, motivo: 'Semáforo averiado', estado: 'NO_PUBLICADO' },
    ].map(e => ({ ...e, usuarioId: id, usuario: 'Ana Ejemplo', registradoEn: user.registradoEn, fechaEvento: '2026-11-01T05:00:00' }));
    const meta = (id, title) => ({ id, label: title, title, iconName: 'chart-bar-solid' });
    const catalog = { informatica: { meta: meta('informatica', 'Aplicaciones de Informática'), sections: { reportes: { meta: meta('reportes', 'Reportes'), modules: [meta('vivi-reportes', 'Reportes de VIVI')] } } } };
    const backend = http.createServer(async (req, res) => {
        let body = ''; for await (const chunk of req) body += chunk;
        const url = new URL(req.url, 'http://localhost'); calls.push({ path: url.pathname, params: Object.fromEntries(url.searchParams), authorization: req.headers.authorization });
        const json = (data, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); };
        if (url.pathname === '/platform/catalog') return json(catalog);
        if (url.pathname === '/platform/bootstrap') return json({ enabled: true, actor: { id: 1, admin: true, mode: 'ADMINISTRADOR' }, definitions: {}, teams: [], memberships: [], capabilities: {} });
        if (url.pathname === '/platform/module-access/vivi-reportes') return json({ moduloId: 'vivi-reportes', allowed, actions: { LEER: allowed, INSERTAR: false, EDITAR: false, ELIMINAR: false } });
        if (url.pathname === '/platform/vivi-reports/users') {
            if (failUsers) return json({ codigo: 'NO_DISPONIBLE', message: 'No se pudo completar la consulta.', referencia: reference }, 503);
            const offset = Number(url.searchParams.get('offset') || 0), q = (url.searchParams.get('q') || '').toLowerCase();
            let users = allUsers.filter(u => (u.nombres + ' ' + u.apellidos).toLowerCase().includes(q));
            if (url.searchParams.get('actividad') === 'SIN_ACTIVIDAD') users = users.filter(u => !u.avisos && !u.reportes);
            const activos = users.filter(u => u.activo).length, conActividad = users.filter(u => u.avisos + u.reportes > 0).length;
            return json({ resumen: { total: users.length, activos, inactivos: users.length - activos, conActividad, sinActividad: users.length - conActividad }, items: users.slice(offset, offset + 50), limite: 50, offset, hayMas: offset + 50 < users.length });
        }
        if (url.pathname === '/platform/vivi-reports/users/' + id) return failDetail ? json({ message: 'Ficha temporalmente no disponible.', referencia: reference }, 503) : json({ ...user, dpi: '0012345678901', nit: '00123-4', fechaNacimiento: '1999-01-02', sexo: 'F', etnia: null, pais: 'GT', departamento: 1, municipio: 1, zona: 0, direccion: 'Dirección ficticia', tipoPlacaDeclarada: 'P', placaDeclarada: '999XXX' });
        if (url.pathname === '/platform/vivi-reports/activity') {
            const items = activities.filter(e => (!url.searchParams.get('tipo') || e.tipo === url.searchParams.get('tipo')) && (!url.searchParams.get('estado') || e.estado === url.searchParams.get('estado')));
            const estados = items.map(e => ({ tipo: e.tipo, estado: e.estado, cantidad: 1 }));
            return json({ resumen: { total: items.length, avisos: items.filter(e => e.tipo === 'AVISO').length, reportes: items.filter(e => e.tipo === 'REPORTE').length, estados }, items, offset: 0, limite: 50, hayMas: false });
        }
        const data = body ? JSON.parse(body) : {};
        if (data.query?.includes('GetUser')) return json({ data: { usuario: account } });
        return json({ data: {} });
    });
    backend.listen(3782, '127.0.0.1'); await once(backend, 'listening');
    const next = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3781', '-H', '127.0.0.1'], { env: { ...process.env, TICKETS_PLATFORM_ENABLED: 'true', GRAPHQL_ENDPOINT: 'http://127.0.0.1:3782/graphql', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = ''; next.stdout.on('data', b => output += b); next.stderr.on('data', b => output += b);
    let browser, page;
    try {
        for (let i = 0; !output.includes('Ready in') && i < 200; i++) { if (next.exitCode !== null) throw Error(output); await new Promise(r => setTimeout(r, 100)); }
        assert.ok(output.includes('Ready in'));
        browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'], headless: true });
        const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
        await context.addCookies([{ name: 'auth_token', value: 'token-ficticio', url: 'http://127.0.0.1:3781' }, { name: 'auth_role', value: 'ADMINISTRADOR', url: 'http://127.0.0.1:3781' }]);
        await context.addInitScript(user => localStorage.setItem('auth-storage', JSON.stringify({ state: { token: 'token-ficticio', user, userId: user.id_usuario }, version: 0 })), account);
        page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
        await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
        const url = 'http://127.0.0.1:3781/home/informatica/reportes/vivi-reportes';
        await page.goto(url); await page.getByRole('heading', { name: 'Sin acceso a este formulario' }).waitFor();
        assert.equal(calls.filter(c => c.path.startsWith('/platform/vivi-reports')).length, 0);
        allowed = true; await page.reload();
        await page.getByRole('button', { name: 'Ver datos de Ana Ejemplo', exact: true }).waitFor();
        assert.equal(await page.getByRole('region', { name: 'Lista de usuarios VIVI' }).locator('tbody tr').count(), 50);
        failDetail = true; await page.getByRole('button', { name: 'Ver datos de Ana Ejemplo' }).click(); await page.getByRole('button', { name: 'Reintentar ficha' }).waitFor();
        failDetail = false; await page.getByRole('button', { name: 'Reintentar ficha' }).click();
        const detail = page.getByRole('region', { name: 'Datos de inscripción' }); await detail.getByText('0012345678901', { exact: true }).waitFor();
        assert.ok(!(await page.locator('body').innerText()).includes('HASH_CLAVE'));
        await detail.getByRole('button', { name: 'Consultar actividad de este usuario' }).click();
        await page.getByRole('region', { name: 'Lista de avisos y reportes' }).getByText('Semáforo averiado').waitFor();
        assert.equal(calls.filter(c => c.path.endsWith('/activity')).at(-1).params.usuarioId, id);
        await page.getByLabel('Tipo de registro').selectOption('AVISO'); await page.getByLabel('Estado del registro').selectOption('NOTIFICADA');
        await page.getByLabel('Grabados desde').fill('2026-11-01'); await page.getByLabel('Hasta', { exact: true }).fill('2026-11-01'); const filteredActivity = page.waitForResponse(r => r.url().includes('/api/platform/vivi-reports/activity?') && r.url().includes('estado=NOTIFICADA')); await page.getByRole('button', { name: 'Consultar', exact: true }).click(); await filteredActivity; await page.getByRole('button', { name: 'Consultar', exact: true }).waitFor();
        await page.getByRole('region', { name: 'Lista de avisos y reportes' }).getByText('000AAA', { exact: false }).waitFor();
        assert.equal(await page.getByRole('region', { name: 'Lista de avisos y reportes' }).locator('tbody tr').count(), 1);
        const last = calls.filter(c => c.path.endsWith('/activity')).at(-1); assert.equal(last.params.usuarioId, id); assert.equal(last.params.tipo, 'AVISO'); assert.equal(last.params.estado, 'NOTIFICADA');
        await page.getByRole('button', { name: 'Usuarios inscritos', exact: true }).click();
        await page.getByRole('button', { name: 'Ver datos de Ana Ejemplo' }).waitFor();
        const downloadEvent = page.waitForEvent('download'); await page.getByRole('button', { name: 'Exportar esta página CSV' }).click(); const download = await downloadEvent;
        const csv = await fs.readFile(await download.path(), 'utf8'); assert.match(csv, /Ana/); assert.match(csv, /9007199254740993/); assert.match(csv, /'\+50200000000/); assert.doesNotMatch(csv, /0012345678901/);
        await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
        await page.getByRole('region', { name: 'Lista de usuarios VIVI' }).getByText('Ficticio 49', { exact: false }).waitFor();
        assert.equal(calls.filter(c => c.path.endsWith('/users')).at(-1).params.offset, '50');
        await page.getByRole('button', { name: 'Anterior', exact: true }).click(); await page.getByRole('button', { name: 'Ver datos de Ana Ejemplo' }).waitFor();
        await page.getByLabel('Nombre, correo, teléfono o ID').fill('NO EXISTE'); await page.getByRole('button', { name: 'Consultar', exact: true }).click();
        await page.getByText('No hay resultados para los filtros aplicados.', { exact: true }).waitFor();
        await page.getByRole('button', { name: 'Limpiar filtros', exact: true }).click(); await page.getByRole('button', { name: 'Ver datos de Ana Ejemplo' }).waitFor();
        failUsers = true; await page.getByRole('button', { name: 'Consultar', exact: true }).click(); await page.getByRole('alert').filter({ hasText: reference }).waitFor();
        assert.equal(await page.getByRole('button', { name: 'Exportar esta página CSV' }).isDisabled(), true);
        failUsers = false; await page.getByRole('button', { name: 'Reintentar consulta' }).click(); await page.getByRole('alert').filter({ hasText: reference }).waitFor({ state: 'hidden' });
        for (const width of [1440, 1024, 390]) { await page.setViewportSize({ width, height: 1050 }); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); await page.screenshot({ path: path.join(directory, 'vivi-reportes-' + width + '.png'), fullPage: false }); }
        assert.deepEqual(errors, []); assert.ok(calls.filter(c => c.path.startsWith('/platform/vivi-reports')).every(c => c.authorization === 'Bearer token-ficticio'));
        console.log('VIVI_REPORTES_BROWSER_OK: permiso previo, ficha, avisos/reportes, ID largo, filtros, paginación, CSV, vacíos y reintento; backend ficticio; capturas=' + directory);
    } catch (error) { if (page) { await page.screenshot({ path: path.join(directory, 'fallo.png') }).catch(() => {}); console.error((await page.locator('body').innerText()).slice(-2000)); } throw error; }
    finally { await browser?.close(); next.kill('SIGTERM'); backend.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
