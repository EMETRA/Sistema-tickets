const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
let payload, failure, variables;
const load = require('./load-ts.cjs')(root, { '@/api/graphql/client': { graphqlRequest: async (query, options) => { variables = options?.variables; if (failure) throw failure; return payload; } } });
const cases = [
  ['MOD04/visaNominaExportExcel', '?empresa=97&tipoNomina=1&maestroNomina=1&tipoPago=1&unidadPresupuestaria=12%25', 'visaNominaExportExcel', { filename: 'ejemplo.xls', mimeType: 'application/vnd.ms-excel', contentBase64: 'ZGF0b3M=' }],
  ['MOD07/manual', '?id=1', 'manual', { id: 1, titulo: 'Manual ficticio' }],
  ['MOD07/manualesDisponibles', '', 'manualesDisponibles', [{ id: 1, titulo: 'Manual ficticio' }]],
  ['MOD08/reporteAnuladosTipos', '', 'reporteAnuladosTipos', [{ codigo: 'RECIBOS_PAGO', etiqueta: 'Recibos' }]],
  ['MOD08/reporteAnuladosExcel', '?tipoReporte=RECIBOS_PAGO&fechaInicio=2026-11-01&fechaFin=2026-11-09', 'reporteAnuladosExportExcel', { filename: 'ejemplo.xls', mimeType: 'application/vnd.ms-excel', contentBase64: 'ZGF0b3M=' }],
  ['MOD08/reporteAnuladosResultados', '?tipoReporte=RECIBOS_PAGO&fechaInicio=2026-11-01&fechaFin=2026-11-09', 'reporteAnuladosResultados', { total: 0, filas: [] }],
  ['MOD06/empresas', '', 'funcionesPorUsuarioEmpresas', [{ empresa: '97', nombre: 'Empresa ficticia' }]],
  ['MOD05/reporteRhEstatusOpciones', '', 'reporteRhEstatusOpciones', [{ codigo: 'ACTIVO', etiqueta: 'Activo' }]],
];
test('Los módulos consumen el resultado GraphQL desempaquetado una sola vez', async t => {
  for (const [route, query, field, value] of cases) await t.test(route, async () => {
    failure = undefined; payload = { [field]: value };
    const { GET } = load('src/app/api/' + route + '/route.ts');
    const res = await GET({ nextUrl: new URL('http://localhost/api/' + route + query) });
    assert.equal(res.status, 200); assert.deepEqual((await res.json()).data, value);
    if (route.startsWith('MOD04')) assert.equal(variables.input.unidadPresupuestaria, '12%');
  });
});
test('Los errores de módulos distinguen sesión y permiso sin devolver SQL ni respuestas internas', async () => {
  const { GET } = load('src/app/api/MOD04/visaNominaExportExcel/route.ts');
  const req = { nextUrl: new URL('http://localhost/?empresa=97&tipoNomina=1&maestroNomina=1&tipoPago=1&unidadPresupuestaria=12') };
  for (const [code, status] of [['UNAUTHENTICATED', 401], ['FORBIDDEN', 403], ['INTERNAL_SERVER_ERROR', 502]]) {
    failure = Object.assign(Error('ORA-00942 SELECT dato_privado FROM tabla_interna'), { response: { errors: [{ message: 'dato_privado', extensions: { code } }] } });
    const res = await GET(req); assert.equal(res.status, status);
    const data = await res.json(); assert.ok(data.referencia); assert.doesNotMatch(JSON.stringify(data), /ORA-|SELECT|dato_privado|tabla_interna/);
    assert.equal(res.headers.get('Cache-Control'), 'private, no-store');
  }
  failure = undefined;
});
