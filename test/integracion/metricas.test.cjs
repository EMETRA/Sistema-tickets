const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {metricsQuery}=require('./load-ts.cjs')(path.resolve(__dirname,'../..'))('src/platform/metrics.ts');
test('Las métricas usan días inclusivos de Guatemala sin depender de la zona del navegador',()=>{
 const q=new URL('http://local'+metricsQuery({from:'2026-11-01',to:'2026-11-10',team:''},100)).searchParams;
 assert.equal(q.get('desde'),'2026-11-01T06:00:00.000Z');assert.equal(q.get('hasta'),'2026-11-11T06:00:00.000Z');assert.equal(q.get('offset'),'100');assert.equal(q.has('equipoId'),false);
});
test('No consulta periodos invertidos, fechas inexistentes ni más de 366 días',()=>{
 for(const [from,to]of [['2026-11-10','2026-11-01'],['2026-02-30','2026-03-02'],['2025-01-01','2026-01-02'],['','2026-11-01']])assert.throws(()=>metricsQuery({from,to,team:''}));
 assert.doesNotThrow(()=>metricsQuery({from:'2026-01-01',to:'2026-12-31',team:''}));
});
