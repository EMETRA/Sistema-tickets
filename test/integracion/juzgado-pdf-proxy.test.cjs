const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { NextRequest } = require('next/server');
const root = path.resolve(__dirname, '../..');
const referencia = 'b06f32ff-c167-4575-ad76-d5b5400ae908';
const nueva = 'ff39e477-6b05-4779-836e-f936ac8e16a3';

async function fixture(run) {
    const savedFetch = global.fetch, savedLog = console.error;
    const logs = [], queued = [], calls = [];
    let response;
    global.fetch = async (url, init) => {
        calls.push({ url: String(url), init });
        if (response instanceof Error) throw response;
        return response;
    };
    console.error = value => logs.push(JSON.parse(value));
    const route = require('./load-ts.cjs')(root, {
        '@/api/config/env': { getGraphqlEndpoint: () => 'https://tickets.example.invalid/web/graphql' },
        '@/observability/server-incidents': { queuePanelIncident: async (...args) => { queued.push(args); return nueva; } },
    })('src/app/api/JUZ01/[...path]/route.ts');
    const request = (method = 'POST', routePath = 'resoluciones/4/documento/generar', auth = true) =>
        route[method](new NextRequest('https://panel.example.invalid/api/JUZ01/' + routePath, {
            method, headers: auth ? { Authorization: 'Bearer sesion-ficticia', 'x-ticket-request-id': 'solicitud-ficticia', 'x-ticket-confirmation': 'confirmacion-ficticia' } : {},
        }), { params: Promise.resolve({ path: routePath.split('/') }) });
    try { await run({ set: value => response = value, request, calls, logs, queued }); }
    finally { global.fetch = savedFetch; console.error = savedLog; }
}

test('el proxy conserva la referencia del API y no duplica su incidencia ni devuelve mensajes internos', () => fixture(async f => {
    f.set(Response.json({ codigo: 'SERVICIO_NO_DISPONIBLE', referencia, mensaje: 'ORA-01031 /ruta/privada token=secreto' }, { status: 503 }));
    const result = await f.request(); const body = await result.json();
    assert.equal(result.status, 503); assert.equal(body.referencia, referencia);
    assert.equal(body.codigo, 'ARCHIVO_HTTP_ERROR'); assert.equal(f.queued.length, 0);
    assert.equal(f.logs[0].referencia, referencia); assert.equal(f.logs[0].metodo, 'POST');
    assert.doesNotMatch(JSON.stringify({ body, logs: f.logs }), /ORA-|privada|secreto|Bearer|example.invalid/);
    assert.equal(f.calls[0].url, 'https://tickets.example.invalid/web/vivi/juzgado/resoluciones/4/documento/generar');
    assert.equal(f.calls[0].init.headers.Authorization, 'Bearer sesion-ficticia');
    assert.equal(f.calls[0].init.headers['x-ticket-confirmation'], 'confirmacion-ficticia');
    assert.equal(result.headers.get('cache-control'), 'private, no-store');
}));

test('un fallo sin referencia válida encola una incidencia y conserva el HTTP aunque el JSON sea null', () => fixture(async f => {
    for (const body of [null, { referencia: 'token=secreto', message: 'SQL privado' }]) {
        f.set(Response.json(body, { status: 503 }));
        const result = await f.request();
        assert.equal(result.status, 503); assert.equal((await result.json()).referencia, nueva);
    }
    assert.equal(f.queued.length, 2);
    assert.equal(f.queued[0][0], 'JUZ01.POST.resoluciones');
    assert.doesNotMatch(JSON.stringify(f.queued), /SQL privado|secreto/);
}));

test('sesión, permiso y conflicto no crean incidencias técnicas', () => fixture(async f => {
    assert.equal((await f.request('POST', undefined, false)).status, 401);
    assert.equal(f.calls.length, 0);
    for (const status of [401, 403, 409]) {
        f.set(Response.json({ codigo: 'SIN_PERMISO' }, { status }));
        assert.equal((await f.request()).status, status);
    }
    assert.equal(f.queued.length, 0);
}));

test('generar exige JSON y descargar conserva los bytes y las cabeceras privadas del PDF', () => fixture(async f => {
    f.set(new Response('<html>proxy externo</html>', { headers: { 'content-type': 'text/html' } }));
    const invalid = await f.request();
    assert.equal(invalid.status, 502); assert.equal((await invalid.json()).codigo, 'ARCHIVO_RESPUESTA_INVALIDA');
    assert.equal(f.queued.length, 1);
    f.set(Response.json({ id: '80', tipoDocumento: 'RESOLUCION' }, { status: 201 }));
    const metadata = await f.request(); assert.equal(metadata.status, 201); assert.equal((await metadata.json()).id, '80');
    f.set(new Response('%PDF-1.4\nprueba', { headers: { 'content-type': 'application/pdf', 'content-disposition': 'attachment; filename="resolucion.pdf"' } }));
    const pdf = await f.request('GET', 'documentos/80');
    assert.equal(await pdf.text(), '%PDF-1.4\nprueba');
    assert.equal(pdf.headers.get('content-disposition'), 'attachment; filename="resolucion.pdf"');
    assert.equal(pdf.headers.get('cache-control'), 'private, no-store');
}));

test('el transporte se registra sin convertirlo en otra solicitud de resolución', () => fixture(async f => {
    const error = Object.assign(new Error('fallo de red'), { cause: { code: 'ENOTFOUND' } });
    f.set(error); const result = await f.request(); const body = await result.json();
    assert.equal(result.status, 502); assert.equal(body.codigo, 'ENOTFOUND'); assert.equal(body.referencia, nueva);
    assert.equal(f.calls.length, 1); assert.equal(f.queued[0][1], error);
}));
