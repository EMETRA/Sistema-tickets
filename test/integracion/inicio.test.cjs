const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { NextRequest } = require('next/server');
const root = path.resolve(__dirname, '../..');
const loader = require('./load-ts.cjs');

function routes(request) {
  const load = loader(root, {
    [path.join(root, 'src/api/graphql/client.ts')]: {graphqlRequest: request},
  });
  return {stats: load('src/app/api/my-stats/route.ts'), activity: load('src/app/api/my-activity/route.ts')};
}

test('ORA-00942 mantiene el fallo sin exponer query, variables, JWT ni detalles internos', async () => {
  const logs = [];
  const previous = console.error;
  console.error = value => logs.push(value);
  try {
    const error = new Error('ORA-00942: table or view does not exist. SELECT * FROM ESQUEMA_PRIVADO.TB_TICKET; variables={id:401}; Authorization=Bearer JWT-PRUEBA');
    error.response = {status: 200, errors: [{message: error.message, extensions: {code: 'INTERNAL_SERVER_ERROR'}}]};
    const api = routes(async () => {throw error;});
    for (const [operation, response] of [
      ['myStats', await api.stats.GET()],
      ['myActivity', await api.activity.GET(new NextRequest('http://localhost/api/my-activity?limit=10'))],
    ]) {
      assert.equal(response.status, 502);
      assert.equal(response.headers.get('cache-control'), 'private, no-store');
      const body = await response.json();
      assert.equal(body.codigo, 'PANEL_INICIO_FALLIDO');
      assert.match(body.referencia, /^[0-9a-f-]{36}$/);
      assert(!JSON.stringify(body).match(/ORA-|SELECT|ESQUEMA_PRIVADO|JWT-PRUEBA|variables/));
      const log = logs.find(item => item.operacion === operation);
      assert.equal(log.tipoFallo, 'ORACLE');
      assert.equal(log.httpOrigen, 200);
      assert.deepEqual(log.codigosOracle, ['ORA-00942']);
      assert.equal(log.referencia, body.referencia);
    }
    assert(!JSON.stringify(logs).match(/SELECT|ESQUEMA_PRIVADO|JWT-PRUEBA|variables/));
  } finally { console.error = previous; }
});

test('el diagnóstico distingue red, plazo, contrato y respuesta incompleta sin registrar mensajes privados', () => {
  const { diagnosticoErrorGraphql } = loader(root)('src/api/graphql/server-error.ts');
  const secret = 'Bearer JWT-PRIVADO SELECT * FROM TABLA_INTERNA';
  const cases = [
    [Object.assign(new TypeError(secret), {cause: {code: 'ENOTFOUND'}}), 'DNS', null, ['ENOTFOUND']],
    [Object.assign(new TypeError(secret), {cause: {code: 'ECONNREFUSED'}}), 'CONEXION', null, ['ECONNREFUSED']],
    [Object.assign(new TypeError(secret), {cause: {code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'}}), 'TLS', null, ['UNABLE_TO_VERIFY_LEAF_SIGNATURE']],
    [Object.assign(new Error(secret), {name: 'AbortError'}), 'TIEMPO_AGOTADO', null, []],
    [Object.assign(new TypeError(secret), {cause: {code: 'UND_ERR_CONNECT_TIMEOUT'}}), 'TIEMPO_AGOTADO', null, ['UND_ERR_CONNECT_TIMEOUT']],
    [Object.assign(new Error(secret), {response: {status: 400, errors: [{message: secret, extensions: {code: 'GRAPHQL_VALIDATION_FAILED'}}]}}), 'CONTRATO_GRAPHQL', 400, []],
    [Object.assign(new Error(secret), {response: {status: 502}}), 'HTTP', 502, []],
    [new SyntaxError(secret), 'RESPUESTA_NO_JSON', null, []],
    [new Error('RESPUESTA_INICIO_INCOMPLETA'), 'RESPUESTA_INCOMPLETA', null, []],
  ];
  for (const [error, tipoFallo, httpOrigen, codigosTransporte] of cases) {
    const result = diagnosticoErrorGraphql(error);
    assert.equal(result.tipoFallo, tipoFallo);
    assert.equal(result.httpOrigen, httpOrigen);
    assert.deepEqual(result.codigosTransporte, codigosTransporte);
    assert(!JSON.stringify(result).includes(secret));
  }
  const untrusted = Object.assign(new Error(secret), {code: secret, cause: {code: secret},
    response: {status: secret, errors: [{message: 'ORA-01031 '+secret, extensions: {code: secret}}]}});
  assert.deepEqual(diagnosticoErrorGraphql(untrusted), {tipoFallo:'ORACLE',httpOrigen:null,
    codigosGraphql:[],codigosTransporte:[],codigosOracle:['ORA-01031']});
});

test('errores de sesión y permiso dentro de GraphQL200 conservan 401 y 403', async () => {
  const previous = console.error; console.error = () => {};
  try {
    for (const [code, expected] of [['UNAUTHENTICATED', 401], ['FORBIDDEN', 403]]) {
      const error = Object.assign(new Error('Detalle interno'), {response: {status: 200, errors: [{extensions: {code}}]}});
      const api = routes(async () => {throw error;});
      assert.equal((await api.stats.GET()).status, expected);
      assert.equal((await api.activity.GET(new NextRequest('http://localhost/api/my-activity'))).status, expected);
    }
  } finally { console.error = previous; }
});

test('el límite llega a la consulta real; una lista vacía válida sigue siendo éxito', async () => {
  let captured;
  const api = routes(async (query, options) => {captured = {query, options}; return {myActivity: []};});
  const response = await api.activity.GET(new NextRequest('http://localhost/api/my-activity?limit=20'));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {myActivity: []});
  assert.match(captured.query, /myActivity\(limit: \$limit\)/);
  assert.deepEqual(captured.options.variables, {limit: 20});
});

test('límite inválido no consulta Tickets y una respuesta incompleta no fabrica estadísticas', async () => {
  let calls = 0;
  const api = routes(async () => {calls++; return {};});
  for (const limit of ['0', '101', '1.5', 'texto', '']) {
    assert.equal((await api.activity.GET(new NextRequest('http://localhost/api/my-activity?limit=' + limit))).status, 400);
  }
  assert.equal(calls, 0);
  const previous = console.error; console.error = () => {};
  try { assert.equal((await api.stats.GET()).status, 502); }
  finally { console.error = previous; }
});
