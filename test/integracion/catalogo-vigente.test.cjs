const test = require('node:test'), assert = require('node:assert/strict'), path = require('node:path');
const loader = require('./load-ts.cjs');
const root = path.resolve(__dirname, '../..');
const load = loader(root);
const { publicAppsCatalog } = load('src/config/apps-catalog.ts');
const { canAccessAppPath } = load('src/config/apps-access.ts');
const item = id => ({ id, label: id, title: id, iconName: 'clipboard-solid' });
const app = (id, ids, section = 'reportes') => ({ meta: item(id), sections: { [section]: { meta: item(section), modules: ids.map(item) } } });

test('retira los reportes y dashboards incluso con catálogo antiguo, conservando manuales y funciones en su espacio', () => {
    const ids = ['proc01', 'mod13', 'mod06', 'mod01', 'exportmod01', 'save-mod01', 'dashboard-proyectos', 'dashboard-colaboradores'];
    const catalog = { informatica: app('informatica', [...ids, 'mod07']) };
    const snapshot = JSON.stringify(catalog);
    const result = publicAppsCatalog(catalog);
    assert.deepEqual(result.informatica.sections.reportes.modules.map(m => m.id), ['mod07']);
    for (const id of ids) assert.equal(canAccessAppPath('/home/informatica/reportes/' + id, result), false);
    assert.equal(JSON.stringify(catalog), snapshot);
    assert.deepEqual(publicAppsCatalog({ informatica: app('informatica', ids) }), {});
});

test('traslada únicamente Consultar caso a Juzgado y conserva Notificar documento en Jurídico', () => {
    const catalog = { juridico: { meta: item('juridico'), sections: { casos: app('', ['juz01']).sections.reportes, reportes: app('', ['mod10']).sections.reportes } } };
    const snapshot = JSON.stringify(catalog);
    const result = publicAppsCatalog(catalog);
    assert.equal(result.juzgado.meta.title, 'Aplicaciones Juzgado');
    assert.deepEqual(result.juzgado.sections.consultas.modules.map(m => m.id), ['juz01']);
    assert.deepEqual(result.juridico.sections.reportes.modules.map(m => m.id), ['mod10']);
    assert.equal(result.juridico.sections.casos, undefined);
    assert.equal(canAccessAppPath('/home/juzgado/consultas/juz01/detail', result), true);
    assert.equal(canAccessAppPath('/home/juridico/casos/juz01', result), false);
    assert.equal(JSON.stringify(catalog), snapshot);
    assert.deepEqual(publicAppsCatalog(result), result);
});

test('no inventa acceso judicial si no figura en el catálogo autorizado', () => {
    const result = publicAppsCatalog({ juridico: app('juridico', ['mod10']) });
    assert.equal(result.juzgado, undefined);
    assert.equal(canAccessAppPath('/home/juzgado/consultas/juz01', result), false);
});

test('no duplica el caso durante una actualización entre API y Panel', () => {
    const result = publicAppsCatalog({ juridico: app('juridico', ['juz01']), juzgado: app('juzgado', ['juz01', 'otro'], 'consultas') });
    assert.equal(result.juridico, undefined);
    assert.deepEqual(result.juzgado.sections.consultas.modules.map(m => m.id), ['otro', 'juz01']);
});

test('el catálogo de respaldo ofrece la misma ubicación y no anuncia reportes retirados', () => {
    const result = publicAppsCatalog(load('src/api/graphql/home/appsCatalog.dummy.ts').APPS_CATALOG_DUMMY);
    assert.equal(result.juridico.sections.juz01, undefined);
    assert.deepEqual(result.informatica.sections.reportes.modules.map(m => m.id), ['vivi-reportes']);
    assert.equal(result.juzgado.sections.consultas.modules[0].id, 'juz01');
});

const { proxy } = loader(root)('src/proxy.ts');
const { NextRequest } = require('next/server');
const request = (pathname, session = true) => new NextRequest('https://panel.example.invalid' + pathname, { headers: session ? { Cookie: 'auth_token=token-ficticio; auth_role=USUARIO' } : {} });
test('el marcador judicial antiguo conserva el caso y los filtros sin saltarse la sesión', () => {
    const path = '/home/juridico/juz01/juz01/detail?caseNumber=abc123&tab=documentos';
    assert.equal(proxy(request(path, false)).headers.get('location'), 'https://panel.example.invalid/login');
    assert.equal(proxy(request(path)).headers.get('location'), 'https://panel.example.invalid/home/juzgado/consultas/juz01/detail?caseNumber=abc123&tab=documentos');
    assert.equal(proxy(request('/home/juzgado/consultas/juz01')).headers.get('location'), null);
});
test('los marcadores de reportes van a desuso y los dashboards a Métricas', () => {
    for (const id of ['mod01', 'exportmod01', 'save-mod01'])
        assert.equal(proxy(request('/home/informatica/reportes/' + id)).headers.get('location'), 'https://panel.example.invalid/aplicaciones/en-desuso');
    for (const id of ['dashboard-proyectos', 'dashboard-colaboradores'])
        assert.equal(proxy(request('/home/informatica/reportes/' + id)).headers.get('location'), 'https://panel.example.invalid/espacio/metricas');
    assert.equal(proxy(request('/espacio/metricas')).headers.get('location'), null);
    assert.equal(proxy(request('/home/informatica/permisos/mod06')).headers.get('location'), 'https://panel.example.invalid/espacio/accesos?tab=corporate');
});
