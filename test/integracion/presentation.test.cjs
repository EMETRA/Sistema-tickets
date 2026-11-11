const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const load = require('./load-ts.cjs')(root);
const {workspacePresentation, workspaceViewNavigation, WORKSPACE_VIEWS} = load('src/platform/presentation.ts');
const {getPlatformRuntime, setPlatformRuntime} = load('src/platform/runtime.ts');
const groups = ['accesos', 'auditoria', 'inventario', 'red', 'sistemas', 'infraestructura', 'solicitudes', 'organizacion'];
const source = () => ({enabled:true,actor:{id:1,nombre:'Cuenta de prueba',admin:true,mode:'ADMINISTRADOR'},
 capabilities:{assign:true,attend:true,audit:true,logs:true,teamMetrics:true,corporateAccess:true},
 definitions:Object.fromEntries(groups.map(group=>[group,{group,actions:{LEER:true,EDITAR:true}}])),
 teams:[{id:'team',nombre:'Equipo autorizado'}],memberships:[],timezone:'America/Guatemala'});

test('las seis vistas cambian la presentación conservando el bootstrap y el runtime de permisos',()=>{
 const original=source(),before=JSON.stringify(original);setPlatformRuntime(original);
 for(const view of WORKSPACE_VIEWS){
  const projected=workspacePresentation(original,view.id);
  assert.equal(projected.actor.id,1);assert.equal(projected.actor.mode,view.id);assert.equal(projected.actor.admin,false);
  assert.equal(projected.teams,original.teams);assert.equal(projected.memberships,original.memberships);
  assert.equal(projected.capabilities.audit,false);assert.equal(projected.capabilities.corporateAccess,false);
  const paths=Object.values(workspaceViewNavigation(original,view.id)).flat().map(item=>item.path);
  assert.ok(!paths.includes('/espacio/accesos'));assert.ok(!paths.includes('/espacio/auditoria'));
  assert.equal(getPlatformRuntime(),original);assert.equal(JSON.stringify(original),before);
 }
 assert.equal(workspacePresentation(original,'ACTUAL'),original);
 assert.equal(workspacePresentation(original,'ADMINISTRADOR'),original);
});
test('un nombre USER_ADMIN sin administración efectiva no habilita la presentación',()=>{
 const ordinary={...source(),actor:{id:1,nombre:'USER_ADMIN',admin:false,mode:'USUARIO'}};
 for(const selection of ['TECNICO','DEVOPS','ADMINISTRADOR','ACTUAL','otro'])
  assert.equal(workspacePresentation(ordinary,selection),ordinary);
});
test('cada vista ofrece su navegación y capacidades sin inventar autorizaciones',()=>{
 const original=source();
 const personal=workspacePresentation(original,'USUARIO');
 assert.equal(personal.capabilities.assign,false);assert.equal(personal.capabilities.attend,false);
 assert.equal(personal.capabilities.teamMetrics,false);assert.deepEqual(Object.keys(personal.definitions),['solicitudes']);
 const paths=mode=>Object.values(workspaceViewNavigation(original,mode)).flat().map(item=>item.path);
 assert.ok(!paths('USUARIO').includes('/espacio/asignacion'));
 assert.ok(paths('TECNICO').includes('/espacio/red'));
 assert.ok(!paths('TECNICO').includes('/espacio/infraestructura'));
 assert.ok(paths('DEVOPS').includes('/espacio/infraestructura'));
 assert.ok(paths('JEFATURA').includes('/espacio/organizacion'));
 assert.ok(workspacePresentation(original,'ASIGNACION').capabilities.assign);
 const limited={...original,capabilities:{...original.capabilities,attend:false,logs:false}};
 assert.equal(workspacePresentation(limited,'DEVOPS').capabilities.attend,false);
 assert.equal(workspacePresentation(limited,'DEVOPS').capabilities.logs,false);
});
