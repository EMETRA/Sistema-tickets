'use strict';
// Next real + backend controlado de Tickets. No usa api-portal ni una sesión real.
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { spawn } = require('node:child_process');

async function run() {
  const calls = [];
  const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a4uUAAAAASUVORK5CYII=', 'base64');
  const resource = { id: 7, tipo: 'imagen', url: '/uploads/noticias/qa.png', tipo_mime: 'image/png' };
  const news = { id: 21, titulo: 'Noticia QA controlada', slug: 'qa', idioma: 'es-GT', estado: 'borrador', visibilidad: 'publica', recurso_principal: resource };
  const backend = http.createServer(async (req, res) => {
    const chunks = []; for await (const chunk of req) chunks.push(Buffer.from(chunk));
    calls.push({ path: req.url, auth: req.headers.authorization, type: req.headers['content-type'], body: Buffer.concat(chunks) });
    if (req.url === '/uploads/noticias/qa.png') { res.writeHead(200, { 'content-type': 'image/png' }); return res.end(image); }
    let body;
    if (req.url.startsWith('/news?')) body = { items: [news], total: 1 };
    else if (req.url === '/news/21') body = news;
    else if (req.url === '/taxonomy/categories') body = [{ id: 2, nombre: 'Categoría QA', slug: 'qa', padre: null }];
    else if (req.url === '/taxonomy/tags') body = [{ id: 3, nombre: 'Etiqueta QA', slug: 'qa' }];
    else if (req.url === '/authors') body = [{ id: 4, nombre: 'Autor QA' }];
    else if (req.url === '/resources') body = [resource];
    else if (req.url === '/resources/externos') body = { id: 8, tipo: 'video', url: 'https://example.invalid/video' };
    else { res.statusCode = 404; body = { message: 'Ruta no esperada' }; }
    res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(body));
  });
  backend.listen(3752, '127.0.0.1'); await once(backend, 'listening');
  const next = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3751', '-H', '127.0.0.1'], {
    env: { ...process.env, GRAPHQL_ENDPOINT: 'http://127.0.0.1:3752/graphql', API_PORTAL_URL: '', NEXT_TELEMETRY_DISABLED: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = ''; next.stdout.on('data', b => output += b); next.stderr.on('data', b => output += b);
  const base = 'http://127.0.0.1:3751/api/COM03';
  const headers = { authorization: 'Bearer qa-editor-controlado' };
  try {
    for (let i = 0; !output.includes('Ready in') && i < 200; i++) {
      if (next.exitCode !== null) throw new Error(output);
      await new Promise(r => setTimeout(r, 100));
    }
    assert.ok(output.includes('Ready in'));
    const get = async path => { const r = await fetch(base + path, { headers }); assert.equal(r.status, 200); return r.json(); };
    assert.equal((await get('/noticias')).data[0].titulo, news.titulo);
    assert.equal((await get('/noticia/21')).data.recursoPrincipal.url, '/api/COM03/media/noticias/qa.png');
    assert.equal((await get('/autores')).data[0].nombre, 'Autor QA');
    assert.equal((await get('/categorias')).data[0].nombre, 'Categoría QA');
    assert.equal((await get('/etiquetas')).data[0].nombre, 'Etiqueta QA');
    const media = await fetch(base + '/media/noticias/qa.png'); assert.equal(media.status, 200);
    assert.deepEqual(Buffer.from(await media.arrayBuffer()), image);
    const form = new FormData(); form.append('archivos', new Blob([image], { type: 'image/png' }), 'qa.png');
    const upload = await fetch(base + '/recursos', { method: 'POST', headers, body: form });
    assert.equal(upload.status, 200); assert.equal((await upload.json())[0].id, 7);
    const uploaded = calls.find(c => c.path === '/resources'); assert.ok(uploaded.body.includes(image));
    assert.match(uploaded.type, /multipart\/form-data; boundary=/);
    const video = await fetch(base + '/recursos/externos', { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify({ url: 'https://example.invalid/video' }) });
    assert.equal(video.status, 200); assert.equal((await video.json()).id, 8);
    const before = calls.length;
    assert.equal((await fetch(base + '/noticias')).status, 401); assert.equal(calls.length, before);
    assert.ok(calls.filter(c => !c.path.startsWith('/uploads/')).every(c => c.auth === headers.authorization));
    assert.ok(calls.every(c => !c.path.includes('graphql')));
    console.log('OK | Next real sin API_PORTAL_URL: listado, detalle, autores, categorías, etiquetas, foto y subida multipart/JSON llegan a Tickets con Bearer. Backend controlado.');
  } finally { next.kill('SIGTERM'); backend.close(); }
}
run().catch(e => { console.error(e); process.exitCode = 1; });
