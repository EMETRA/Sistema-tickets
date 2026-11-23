const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '../..');
const load = require('./load-ts.cjs')(root, { [path.join(root, 'src/components/client/organisms/NewsActivity/NewsActivity.module.scss')]: {} });
const { mapNoticia, mapDetalle } = load('src/api/cms/mappers.ts');
const NewsActivity = load('src/components/client/organisms/NewsActivity/NewsActivity.tsx').default;
const activity = { creadoPor: { id: 1, nombre: 'Persona creadora' }, actualizadoPor: { id: 2, nombre: 'Persona editora' }, creadoEn: '2026-11-01T12:00:00.000Z', actualizadoEn: '2026-11-11T15:00:00.000Z' };
const dto = { id: 21, titulo: 'Noticia', estado: 'borrador', idioma: 'es-GT', visibilidad: 'publica', slug: 'noticia', autor: { id: 9, nombre: 'Firma editorial' }, actividadEditorial: activity };

test('listado y detalle conservan los responsables y la firma editorial por separado', () => {
  for (const news of [mapNoticia(dto), mapDetalle(dto, [])]) {
    assert.deepEqual(news.actividadEditorial, activity);
    assert.equal(news.autor, 'Firma editorial');
  }
});
test('el CMS anterior conserva IDs y no atribuye el registro al autor editorial', () => {
  const mapped = mapNoticia({ ...dto, actividadEditorial: undefined, creado_por: 4, actualizado_por: null });
  assert.deepEqual(mapped.actividadEditorial.creadoPor, { id: 4, nombre: null });
  assert.equal(mapped.actividadEditorial.actualizadoPor, null);
  const html = renderToStaticMarkup(React.createElement(NewsActivity, { activity: mapped.actividadEditorial }));
  assert.match(html, /Usuario #4/); assert.match(html, /Sin registro/);
  assert.doesNotMatch(html, /Firma editorial/);
});
test('la ficha y la celda compacta muestran nombres, fechas locales y ningún control editable', () => {
  for (const compact of [false, true]) {
    const html = renderToStaticMarkup(React.createElement(NewsActivity, { activity, compact }));
    assert.match(html, /Creada por/); assert.match(html, /Última actualización/);
    assert.match(html, /Persona creadora/); assert.match(html, /Persona editora/);
    assert.match(html, /dateTime="2026-11-11T15:00:00.000Z"/);
    assert.match(html, /9:00/);
    assert.doesNotMatch(html, /<(input|select|button)/);
  }
});
test('sin metadatos o con fechas inválidas no inventa responsables ni fechas', () => {
  const html = renderToStaticMarkup(React.createElement(NewsActivity, { activity: { creadoPor: null, actualizadoPor: null, creadoEn: 'inválida', actualizadoEn: null } }));
  assert.equal((html.match(/Sin registro/g) || []).length, 2);
  assert.doesNotMatch(html, /<time|Invalid|NaN/);
});
