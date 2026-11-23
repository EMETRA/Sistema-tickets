const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {ticketReportQuery,ticketReportCsv}=require('./load-ts.cjs')(path.resolve(__dirname,'../..'))('src/platform/ticket-reports.ts');
const filters={from:'2026-11-01',to:'2026-11-10',tecnicoId:'4',etiqueta:'2'};
test('el reporte usa fechas inclusivas de Guatemala y vincula técnico/etiqueta a la consulta',()=>{
 const query=new URL('http://localhost'+ticketReportQuery(filters,50)).searchParams;
 assert.equal(query.get('desde'),'2026-11-01T06:00:00.000Z');assert.equal(query.get('hasta'),'2026-11-11T06:00:00.000Z');assert.equal(query.get('tecnicoId'),'4');assert.equal(query.get('etiqueta'),'2');assert.equal(query.get('offset'),'50');
});
test('no consulta filtros inválidos ni periodos invertidos y admite los grupos históricos',()=>{
 for(const extra of [{from:'2026-11-30'},{tecnicoId:'x'},{etiqueta:"1 OR 1=1"}]) assert.throws(()=>ticketReportQuery({...filters,...extra}));
 assert.doesNotThrow(()=>ticketReportQuery({...filters,etiqueta:'sin-historico'}));
});
test('CSV conserva todos los grupos, acentos, comillas y neutraliza fórmulas en textos',()=>{
 const report={grupos:Array.from({length:75},(_,i)=>({tecnicoId:4,tecnico:i===0?' =HYPERLINK("x")':'Técnico',etiquetaId:'2',etiqueta:i===0?'@SUM(1)':'Diagnóstico; "revisión"',tickets:1}))};
 const csv=ticketReportCsv(report,filters);assert.ok(csv.startsWith('\ufeff'));assert.equal(csv.split('\r\n').length,77);assert.match(csv,/"' =HYPERLINK\(""x""\)"/);assert.match(csv,/"'@SUM\(1\)"/);assert.match(csv,/"Diagnóstico; ""revisión"""/);assert.match(csv,/"2026-11-01";"2026-11-10"/);
});
