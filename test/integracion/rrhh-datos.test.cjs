const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../..');const load=require('./load-ts.cjs');
const {hrLocalIso,hrLocalInput,hrDeadline,hrDraft}=load(root)('src/platform/hr.ts');
test('al corregir una devolución conserva la propuesta y las observaciones sin confirmar por el usuario',()=>{
 const data={estado:'DEVUELTA',campana:{campos:[{codigo:'TELEFONO',modo:'EDITAR'},{codigo:'DPI',modo:'CONFIRMAR'}]},perfil:{datos:{TELEFONO:'original'}},entrega:{respuestas:{TELEFONO:{valor:'propuesto'},DPI:{confirmacion:'CORREGIR',observacion:'Revisar documento'}}}};
 assert.deepEqual(hrDraft(data),{TELEFONO:{valor:'propuesto'},DPI:{observacion:'Revisar documento'}});
 assert.deepEqual(hrDraft(data,{TELEFONO:{valor:''},DPI:{confirmacion:'CORRECTO',observacion:''}}),{TELEFONO:{valor:''},DPI:{observacion:''}});
 assert.equal(hrDraft(data,{TELEFONO:{valor:null}}).TELEFONO.valor,'');
 assert.equal(hrDraft({...data,estado:'PENDIENTE'}).TELEFONO.valor,'original');
 assert.deepEqual(hrDraft(data,{TELEFONO:{valor:'borrador'},DPI:{confirmacion:'CORREGIR',observacion:'Nota local'}}),{TELEFONO:{valor:'borrador'},DPI:{observacion:'Nota local'}});
});
test('plazos de 1,3,7 días y un mes se calculan en Guatemala sin perder fin de mes',()=>{
 const start=new Date('2027-01-31T15:00:00Z');
 assert.equal(hrDeadline(start,'mes').toISOString(),'2027-02-28T15:00:00.000Z');
 assert.equal(hrDeadline(new Date('2027-03-01T02:00:00Z'),'mes').toISOString(),'2027-03-29T02:00:00.000Z');
 assert.equal(hrDeadline(new Date('2027-01-31T04:00:00Z'),'mes').toISOString(),'2027-03-01T04:00:00.000Z');
 assert.equal(hrDeadline(new Date('2028-01-31T15:00:00Z'),'mes').toISOString(),'2028-02-29T15:00:00.000Z');
 for(const period of ['1','3','7'])assert.equal(+hrDeadline(start,period)-+start,Number(period)*86400000);
 assert.equal(hrLocalIso('2026-11-13T09:00'),'2026-11-13T15:00:00.000Z');
 assert.equal(hrLocalInput(new Date('2026-11-13T15:00:00Z')),'2026-11-13T09:00');
 assert.throws(()=>hrLocalIso('sin fecha'));assert.throws(()=>hrLocalIso('2027-02-30T09:00'));assert.throws(()=>hrDeadline(start,'otro'));
});
test('el perfil propio y las notificaciones requieren sesión y están disponibles en todos los roles reales',()=>{
 const {canAccessPath}=load(root)('src/config/route-access.ts');const {protectedRoutes}=load(root)('src/config/protected-routes.ts');
 for(const role of ['ADMINISTRADOR','TECNICO','SUPERVISOR','USUARIO'])for(const route of ['/mi-perfil','/notificaciones']){assert.equal(canAccessPath(role,route),true);assert.ok(protectedRoutes.includes(route));}
 assert.equal(canAccessPath(null,'/mi-perfil'),false);assert.equal(canAccessPath('USUARIO','/mi-perfil/otra-persona'),false);
});
test('BFF de RRHH conserva identidad, datos y referencia; no permite consultar sin Bearer',async()=>{
 const {NextRequest}=require('next/server');const saved=global.fetch,enabled=process.env.TICKETS_PLATFORM_ENABLED;process.env.TICKETS_PLATFORM_ENABLED='true';
 const calls=[];const route=load(root,{'@/api/config/env':{getGraphqlEndpoint:()=> 'https://tickets.example.invalid/web/graphql'},'@/observability/server-incidents':{queuePanelIncident:async()=> 'ref-local'}})('src/app/api/platform/[...path]/route.ts');
 const request=(auth=true)=>route.GET(new NextRequest('https://panel.example.invalid/api/platform/hr/me',{headers:auth?{authorization:'Bearer ficticio'}:{}}),{params:Promise.resolve({path:['hr','me']})});
 try{global.fetch=async(url,init)=>{calls.push({url:String(url),init});return Response.json({vinculado:true,datos:{DPI:'0000000000000'}});};assert.equal((await request(false)).status,401);assert.equal(calls.length,0);const result=await request();assert.equal(result.status,200);assert.equal(calls[0].url,'https://tickets.example.invalid/web/platform/hr/me');assert.equal(calls[0].init.headers.get('authorization'),'Bearer ficticio');assert.equal(result.headers.get('cache-control'),'private, no-store');global.fetch=async()=>Response.json({codigo:'NO_DISPONIBLE',referencia:'ref-original'},{status:503});assert.equal((await(await request()).json()).referencia,'ref-original');}
 finally{global.fetch=saved;if(enabled===undefined)delete process.env.TICKETS_PLATFORM_ENABLED;else process.env.TICKETS_PLATFORM_ENABLED=enabled;}
});
