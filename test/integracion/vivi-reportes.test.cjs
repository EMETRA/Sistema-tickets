const test = require('node:test'), assert = require('node:assert/strict'), path = require('node:path');
const load = require('./load-ts.cjs')(path.resolve(__dirname,'../..'));
const { viviReportQuery, viviReportCsv, emptyViviActivity, emptyViviUsers } = load('src/platform/vivi-reports.ts');
test('el reporte conserva el ID VIVI textual y codifica filtros literales, fechas inclusivas y página',()=>{
    const query = viviReportQuery('activity',{...emptyViviActivity,usuarioId:'9007199254740993',tipo:'AVISO',estado:'NOTIFICADA',desde:'2026-11-01',hasta:'2026-11-01'},50);
    const url = new URL(query,'http://localhost');
    assert.equal(url.pathname,'/vivi-reports/activity');assert.equal(url.searchParams.get('usuarioId'),'9007199254740993');assert.equal(url.searchParams.get('offset'),'50');
    assert.equal(new URL(viviReportQuery('users',{...emptyViviUsers,q:"A & B %'"}),'http://localhost').searchParams.get('q'),"A & B %'");
});
test('rechaza fechas imposibles, periodos invertidos e IDs inválidos antes de consultar',()=>{
    for(const filters of [{desde:'2026-02-29'},{desde:'2026-12-01',hasta:'2026-01-01'},{usuarioId:'1 OR 1=1'}]) assert.throws(()=>viviReportQuery('activity',{...emptyViviActivity,...filters}));
    for(const offset of [-1,NaN,1000001]) assert.throws(()=>viviReportQuery('users',emptyViviUsers,offset));
});
test('el CSV de página preserva acentos, ceros y comillas, y neutraliza fórmulas sin incluir documentos ni secretos',()=>{
    const csv=viviReportCsv({items:[{id:'1',nombres:'=FORMULA',apellidos:'Cáceres; "Ejemplo"',correo:'qa@example.invalid',telefono:'+50200000000',activo:false,avisos:0,reportes:2,registradoEn:'2026-11-01T00:00:00Z',dpi:'DOC_PRIVADO',hashClave:'SECRETO'}]},'users');
    assert.ok(csv.startsWith('\ufeff'));assert.match(csv,/'=FORMULA/);assert.match(csv,/Cáceres; ""Ejemplo""/);assert.match(csv,/'\+50200000000/);assert.match(csv,/Inactiva/);assert.doesNotMatch(csv,/DOC_PRIVADO|SECRETO/);
});
test('el CSV distingue aviso y reporte con el mismo ID y conserva la placa y estado',()=>{
    const items=[{id:'1',tipo:'AVISO',placa:'000AAA',estado:'EN_JUZGADO'},{id:'1',tipo:'REPORTE',estado:'NO_PUBLICADO'}];
    const csv=viviReportCsv({items},'activity');assert.match(csv,/000AAA/);assert.match(csv,/En juzgado/);assert.match(csv,/No publicado/);assert.equal(csv.split('\r\n').length,4);
});
