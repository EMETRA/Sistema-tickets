const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const loader=require('./load-ts.cjs');
const {NextRequest}=require('next/server');
test('el BFF apagado no consulta el backend ni aparenta estar habilitado',async()=>{
 const old=process.env.TICKETS_PLATFORM_ENABLED,fetch=global.fetch;process.env.TICKETS_PLATFORM_ENABLED='false';let calls=0;global.fetch=async()=>{calls++;throw Error('No debe consultar');};
 try{const route=loader(root,{'@/api/config/env':{getGraphqlEndpoint:()=> 'https://tickets.example.invalid/graphql'}})('src/app/api/platform/[...path]/route.ts');const r=await route.GET(new NextRequest('https://panel.example.invalid/api/platform/bootstrap'),{params:Promise.resolve({path:['bootstrap']})});assert.equal(r.status,503);assert.equal((await r.json()).codigo,'FEATURE_DISABLED');assert.equal(calls,0);}finally{global.fetch=fetch;if(old===undefined)delete process.env.TICKETS_PLATFORM_ENABLED;else process.env.TICKETS_PLATFORM_ENABLED=old;}
});
test('el BFF rechaza anonimato, rutas externas y entradas de integración antes de acceder a red',async()=>{
 const old=process.env.TICKETS_PLATFORM_ENABLED,fetch=global.fetch;process.env.TICKETS_PLATFORM_ENABLED='true';let calls=0;global.fetch=async()=>{calls++;throw Error('No debe consultar');};
 try{const route=loader(root,{'@/api/config/env':{getGraphqlEndpoint:()=> 'https://tickets.example.invalid/graphql'}})('src/app/api/platform/[...path]/route.ts');const req=(path,auth=true)=>new NextRequest('https://panel.example.invalid/api/platform/'+path,{headers:auth?{Authorization:'Bearer qa'}:{}});assert.equal((await route.GET(req('bootstrap',false),{params:Promise.resolve({path:['bootstrap']})})).status,401);assert.equal((await route.GET(req('integrations'),{params:Promise.resolve({path:['integrations','metrics','id']})})).status,404);assert.equal((await route.GET(req('records'),{params:Promise.resolve({path:['records','https://other.invalid']})})).status,400);assert.equal(calls,0);}finally{global.fetch=fetch;if(old===undefined)delete process.env.TICKETS_PLATFORM_ENABLED;else process.env.TICKETS_PLATFORM_ENABLED=old;}
});
test('el BFF conserva origen fijo, confirmación y carácter privado de la respuesta',async()=>{
 const old=process.env.TICKETS_PLATFORM_ENABLED,fetch=global.fetch;process.env.TICKETS_PLATFORM_ENABLED='true';let captured;
 global.fetch=async(url,init)=>{captured={url:String(url),init};return Response.json({items:[],total:0});};
 try{const route=loader(root,{'@/api/config/env':{getGraphqlEndpoint:()=> 'https://tickets.example.invalid/graphql'}})('src/app/api/platform/[...path]/route.ts');const r=await route.GET(new NextRequest('https://panel.example.invalid/api/platform/records/activos?q=QA',{headers:{Authorization:'Bearer qa','X-Ticket-Confirmation':'proof-qa'}}),{params:Promise.resolve({path:['records','activos']})});assert.equal(captured.url,'https://tickets.example.invalid/platform/records/activos?q=QA');assert.equal(captured.init.headers.get('x-ticket-confirmation'),'proof-qa');assert.equal(captured.init.redirect,'error');assert.equal(r.headers.get('cache-control'),'private, no-store');}finally{global.fetch=fetch;if(old===undefined)delete process.env.TICKETS_PLATFORM_ENABLED;else process.env.TICKETS_PLATFORM_ENABLED=old;}
});
test('el cliente rechaza HTML con HTTP 200 fuera de descargas y no lo presenta como registros',async()=>{
 const fetch=global.fetch;
 try{global.fetch=async()=>new Response('<html>proxy</html>',{headers:{'content-type':'text/html'}});const {platformFetch}=loader(root,{'@/store/useAuthStore':{useAuthStore:{getState:()=>({token:'qa'})}},'@/api/administrative-confirmation':{confirmAdministrativeChange:async()=>{}}})('src/platform/client.ts');await assert.rejects(platformFetch('/records/activos'),/formato inesperado/);}finally{global.fetch=fetch;}
});

test('las fechas del negocio conservan el día de Guatemala cerca de medianoche UTC',()=>{const{guatemalaDay}=loader(root)('src/platform/dates.ts');assert.equal(guatemalaDay(new Date('2026-11-01T04:30:00Z')),'2026-10-31');});
