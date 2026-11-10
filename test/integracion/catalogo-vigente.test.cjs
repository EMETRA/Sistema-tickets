const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const load=require('./load-ts.cjs')(path.resolve(__dirname,'../..'));
const {publicAppsCatalog}=load('src/config/apps-catalog.ts');
test('el catálogo público retira los procesos y mod06 sin mutar el catálogo original',()=>{
 const item=id=>({id,label:id,title:id,iconName:'window'});
 const catalog={recaudacion:{meta:item('recaudacion'),sections:{consultas:{meta:item('consultas'),modules:[item('mod13'),item('consulta-vehiculos')]},procesos:{meta:item('procesos'),modules:[item('proc01')]}}},informatica:{meta:item('informatica'),sections:{permisos:{meta:item('permisos'),modules:[item('mod06')]}}}};
 const result=publicAppsCatalog(catalog);assert.equal(result.informatica,undefined);assert.equal(result.recaudacion.sections.procesos,undefined);assert.deepEqual(result.recaudacion.sections.consultas.modules.map(m=>m.id),['consulta-vehiculos']);assert.equal(catalog.informatica.sections.permisos.modules[0].id,'mod06');
});
