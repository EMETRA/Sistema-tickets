const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { logMessage, matchesContainer, needsAttention, healthLabel, usagePercent } = require('./load-ts.cjs')(path.resolve(__dirname, '../..'))('src/platform/monitoring.ts');
const row = { nombre: 'portal-worker', imagen: 'worker:qa', version: 'abc123', estado: 'running', salud: null };
test('ejecución no implica salud y los filtros usan estado, comprobación y búsqueda', () => {
  assert.equal(needsAttention(row), false);
  assert.equal(healthLabel(row.salud), 'Sin comprobación');
  assert.equal(matchesContainer(row, 'WORKER', 'running'), true);
  assert.equal(matchesContainer(row, 'otro', 'running'), false);
  assert.equal(matchesContainer({ ...row, salud: 'unhealthy' }, '', 'atencion'), true);
  assert.equal(matchesContainer({ ...row, estado: 'restarting' }, '', 'atencion'), true);
  assert.equal(matchesContainer({ ...row, estado: 'exited' }, '', 'detenidos'), true);
  assert.equal(usagePercent(undefined, 100), null);
  assert.equal(usagePercent(0, 100), 0);
});
test('los extractos vacíos distinguen configuración, inactividad, fallo y observador anterior', () => {
  assert.match(logMessage({ ...row, logsEstado: 'NO_HABILITADO' }), /no está habilitada/);
  assert.match(logMessage({ ...row, logsEstado: 'SIN_LINEAS' }), /no hubo líneas/);
  assert.match(logMessage({ ...row, logsEstado: 'ERROR_LECTURA' }), /no pudo leer/);
  assert.match(logMessage({ ...row, logsEstado: 'LIMITE_ALCANZADO' }), /límite/);
  assert.match(logMessage(row), /observador es anterior/);
  assert.equal(logMessage({ ...row, logs: 'trabajo completo' }), '');
});
