const test=require('node:test');const assert=require('node:assert/strict');const path=require('node:path');const loader=require('./load-ts.cjs');
const root=path.resolve(__dirname,'../..');
const {RESOURCE_PRESENTATION,resourceValue}=loader(root)('src/platform/resources.ts');
const {homeNavigation}=loader(root)('src/platform/navigation.ts');
test('cada sección usa nombres de personas, bienes y red sin ambigüedad',()=>{
 const d={actor:{admin:false,mode:'TECNICO'},capabilities:{teamMetrics:false},definitions:{activos:{group:'inventario'},dispositivos:{group:'red'},equipos:{group:'organizacion'}},teams:[],memberships:[]};
 const menu=homeNavigation(d),all=[...menu.primary,...menu.secondary];assert.equal(all.find(x=>x.path==='/espacio/inventario').label,'Activos y mantenimiento');assert.equal(all.find(x=>x.path==='/espacio/red').label,'Red y cableado');assert.equal(all.find(x=>x.path==='/espacio/organizacion').label,'Personal y equipos');
 assert.equal(RESOURCE_PRESENTATION.dispositivos.columns.some(c=>c.key==='puertos'),true);assert.equal(RESOURCE_PRESENTATION.conexiones.columns.some(c=>c.key==='puertoDestino'),true);
});
test('las tablas muestran nombres autorizados y evitan usar UUID como datos del usuario',()=>{
 const row={equipoId:'team',datos:{instalacionId:'7d398874-017b-4136-8836-b9e33ba3d414',puertos:0,informatica:false},labels:{}};
 assert.equal(resourceValue(row,'instalacionId',[]),'Consultar detalle');row.labels.instalacionId='Ubicación de prueba';assert.equal(resourceValue(row,'instalacionId',[]),'Ubicación de prueba');assert.equal(resourceValue(row,'puertos',[]),'0');assert.equal(resourceValue(row,'informatica',[]),'No');assert.equal(resourceValue(row,'equipoId',[{id:'team',nombre:'Equipo de personas'}]),'Equipo de personas');
});
