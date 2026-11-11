// Navegador real y API local simulada; no consulta Oracle ni servicios institucionales.
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

async function run() {
    const root = path.resolve(__dirname, '../..');
    const base = 'http://127.0.0.1:3951';
    const calls = [];
    let admin = true;
    const definitions = require('../fixtures/platform-definitions.json');
    const user = { id_usuario: '1', nombre: 'Administrador de prueba', rol: 'USER_ADMIN', permisos: ['TICKETS_ADMINISTRAR'], departamento: 'Informática', email: 'prueba@example.invalid' };
    const bootstrap = () => ({ enabled: true, actor: { id: 1, nombre: user.nombre, admin, mode: admin ? 'ADMINISTRADOR' : 'USUARIO' },
        defaultTicketTeamId: 'equipo-prueba', definitions: Object.fromEntries(Object.entries(definitions).map(([key, value]) => [key, { ...value, actions: { LEER: true, INSERTAR: true, EDITAR: true, ELIMINAR: true } }])),
        teams: [{ id: 'equipo-prueba', nombre: 'Informática' }], memberships: [{ equipoId: 'equipo-prueba', funcion: 'MIEMBRO' }],
        capabilities: { assign: admin, attend: admin, audit: admin, logs: admin, teamMetrics: admin }, timezone: 'America/Guatemala' });
    const backend = http.createServer(async (req, res) => {
        let raw = ''; for await (const chunk of req) raw += chunk;
        const body = raw ? JSON.parse(raw) : {};
        const url = new URL(req.url, 'http://local.invalid');
        calls.push({ path: url.pathname, search: url.search, method: req.method, bearer: req.headers.authorization });
        const json = (data, status = 200) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(data)); };
        if (url.pathname === '/platform/bootstrap') return json(bootstrap());
        if (url.pathname === '/platform/metrics') return json({ tickets: { total: url.searchParams.get('scope') === 'creados' ? 2 : 7, resueltos: 1, enTrabajo: 1, asignados: 1, sinAsignar: 1, sinPrimeraAtencion: 0 }, registros: [] });
        if (url.pathname.startsWith('/platform/')) return json({ items: [], total: 0, offset: 0, limit: 25 });
        if (url.pathname === '/graphql' && body.query?.includes('GetUser')) return json({ data: { usuario: user } });
        if (url.pathname === '/graphql') return json({ data: {} });
        return json({ message: 'Ruta fuera de la prueba' }, 404);
    });
    backend.listen(3952, '127.0.0.1'); await once(backend, 'listening');
    const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3951', '-H', '127.0.0.1'], {
        cwd: root, env: { ...process.env, TICKETS_PLATFORM_ENABLED: 'true', GRAPHQL_ENDPOINT: 'http://127.0.0.1:3952/graphql', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = ''; server.stdout.on('data', chunk => output += chunk); server.stderr.on('data', chunk => output += chunk);
    let browser;
    try {
        for (let n = 0; n < 200 && !output.includes('Ready in'); n++) {
            if (server.exitCode !== null) throw Error(output);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        assert.ok(output.includes('Ready in'), output);
        browser = await chromium.launch({ executablePath: process.env.QA_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
        const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
        await context.addCookies([{ name: 'auth_token', value: 'sesion-local-prueba', url: base }, { name: 'auth_role', value: 'USUARIO', url: base }]);
        await context.addInitScript(user => localStorage.setItem('auth-storage', JSON.stringify({ state: { token: 'sesion-local-prueba', user, userId: user.id_usuario }, version: 0 })), user);
        const page = await context.newPage(); const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
        await page.goto(base + '/home');
        await page.getByRole('heading', { name: 'Control de Informática', exact: true }).waitFor();
        const authBefore = await page.evaluate(() => localStorage.getItem('auth-storage'));
        const cookiesBefore = await context.cookies();
        const change = async (mode) => {
            await page.getByRole('button', { name: 'Menú de usuario' }).click();
            await page.getByRole('button', { name: 'Cambiar vista', exact: true }).click();
            await page.getByRole('dialog', { name: 'Cambiar vista' }).waitFor();
            await page.getByLabel('Vista del espacio de trabajo', { exact: true }).selectOption(mode);
            await page.getByRole('button', { name: 'Aplicar vista', exact: true }).click();
        };
        const views = [['USUARIO', 'Tus solicitudes y aplicaciones'], ['TECNICO', 'Tu atención y tus instalaciones'],
            ['DESARROLLADOR', 'Tus sistemas y tus pendientes'], ['DEVOPS', 'Tus servicios y tus pendientes'],
            ['ASIGNACION', 'Primero, los tickets por asignar'], ['JEFATURA', 'Tu unidad, en un solo lugar']];
        const out = process.env.QA_SCREENSHOT_DIR || '/tmp/tickets-vistas-presentacion'; await fs.mkdir(out, { recursive: true });
        for (const [mode, heading] of views) {
            await change(mode);
            await page.getByRole('heading', { name: heading, exact: true }).waitFor();
            await page.getByText('Los datos y permisos corresponden a tu cuenta.', { exact: true }).waitFor();
            const navigation = page.getByRole('navigation', { name: 'Menú principal' });
            assert.equal(await navigation.getByRole('link', { name: 'Personas y accesos', exact: true }).count(), 0);
            assert.equal(await page.locator('a[href="/espacio/accesos"]').count(), 0);
            assert.equal(await page.evaluate(() => localStorage.getItem('auth-storage')), authBefore);
            assert.deepEqual(await context.cookies(), cookiesBefore);
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            await page.screenshot({ path: path.join(out, 'vista-' + mode.toLowerCase() + '.png') });
        }
        await change('USUARIO');
        await page.getByRole('navigation', { name: 'Menú principal' }).getByRole('link', { name: 'Calendario', exact: true }).click();
        await page.waitForURL('**/espacio/calendario');
        await page.getByText('Vista de presentación: Usuario', { exact: true }).waitFor();
        await page.getByRole('link', { name: 'Ver inicio de esta vista', exact: true }).click();
        await page.getByRole('heading', { name: 'Tus solicitudes y aplicaciones', exact: true }).waitFor();
        await page.setViewportSize({ width: 390, height: 844 });
        await page.getByRole('button', { name: 'Menú de usuario' }).click();
        await page.getByRole('button', { name: 'Cambiar vista', exact: true }).click();
        await page.getByRole('dialog', { name: 'Cambiar vista' }).waitFor();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.screenshot({ path: path.join(out, 'selector-vista-movil.png') });
        await page.keyboard.press('Escape');
        await page.getByRole('dialog', { name: 'Cambiar vista' }).waitFor({ state: 'hidden' });
        assert.equal(await page.getByRole('button', { name: 'Menú de usuario' }).evaluate(el => el === document.activeElement), true);
        await page.getByRole('button', { name: 'Volver a mi vista', exact: true }).click();
        await page.getByRole('heading', { name: 'Control de Informática', exact: true }).waitFor();
        assert.equal(await page.getByText('Vista de presentación:', { exact: false }).count(), 0);
        admin = false; await page.reload();
        await page.getByRole('heading', { name: 'Tus solicitudes y aplicaciones', exact: true }).waitFor();
        await page.getByRole('button', { name: 'Menú de usuario' }).click();
        assert.equal(await page.getByRole('button', { name: 'Cambiar vista', exact: true }).count(), 0);
        assert.equal(await page.evaluate(() => localStorage.getItem('auth-storage')), authBefore);
        assert.ok(calls.some(call => call.path === '/platform/metrics' && call.search.includes('scope=creados')));
        assert.equal(calls.filter(call => call.method !== 'GET' && call.path !== '/graphql').length, 0);
        assert.ok(calls.filter(call => call.path.startsWith('/platform/')).every(call => call.bearer === 'Bearer sesion-local-prueba'));
        assert.deepEqual(errors, []);
        console.log('OK | Seis vistas, navegación persistente, retorno, móvil/Escape/foco; sesión y permisos originales, sin escrituras ni selector por nombre USER_ADMIN.');
    } finally { if (browser) await browser.close(); server.kill('SIGTERM'); backend.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
