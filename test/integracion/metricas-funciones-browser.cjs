// Next/BFF y servicios compilados de métricas; Oracle, identidad y negocio ficticios en loopback.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const {parse,getOperationAST}=require('graphql');
const {chromium}=require('playwright');
const {start}=require('../../scripts/laboratorio/iniciar.cjs');
async function run(){
 const root=path.resolve(__dirname,'../..'), api=process.env.TICKETS_API_SOURCE||path.resolve(root,'../api-tickets');
 const {PlatformActivity}=require(path.join(api,'dist/platform/platform.activity.js'));
 const {PlatformTelemetry}=require(path.join(api,'dist/platform/platform.telemetry.js'));
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'tickets-metricas-funciones-'));
 const out=process.env.QA_SCREENSHOT_DIR||path.join(temp,'capturas');await fs.mkdir(out,{recursive:true});
 const app='11111111-1111-4111-8111-111111111111', events=new Map(), jobs=[], queries=[], errors=[], calls=[];
 const store={config:{get:key=>({TICKETS_PLATFORM_ENABLED:'true',TICKETS_FILES_DIR:temp})[key]},table:name=>'QA.'+name,ticketSchema:'QA',
  tx:async fn=>fn({query:async(sql,b)=>{assert.match(sql,/INSERT INTO QA.TB_TK_METRICA_EVENTO/);if(events.has(b[2]))throw Object.assign(Error('Duplicado'),{errorNum:1});events.set(b[2],{ID:b[0],APLICACION_ID:b[1],USUARIO_ID:b[3],OPERACION:b[4],RECURSO:b[5],OCURRIDO_EN:b[6],HASH_EVENTO:b[7],CANTIDAD:1});return [];}}),
  rows:async(sql,b=[])=>{
   if(sql.includes('TB_TK_APLICACIONES'))return [{ID:app,NOMBRE:'Sistema Tickets · prueba'}];
   if(sql.startsWith('SELECT HASH_EVENTO'))return [{HASH_EVENTO:events.get(b[1])?.HASH_EVENTO}];
   if(sql.includes('TB_TK_METRICA_EVENTO')){
    const filtered=[...events.values()].filter(e=>e.USUARIO_ID===b[2]&&e.OCURRIDO_EN>=b[0]&&e.OCURRIDO_EN<b[1]).sort((a,z)=>z.OCURRIDO_EN.localeCompare(a.OCURRIDO_EN)||z.ID.localeCompare(a.ID));
    if(sql.includes('GROUP BY')){const groups=new Map();for(const e of filtered){const g=groups.get(e.OPERACION)||{APLICACION_ID:app,OPERACION:e.OPERACION,EVENTOS:0,CANTIDAD:0};g.EVENTOS++;g.CANTIDAD++;groups.set(e.OPERACION,g);}return [...groups.values()];}
    if(sql.includes('COUNT(*)'))return [{TOTAL:filtered.length}];
    return filtered.slice(b[3],b[3]+100);
   }
   if(sql.includes('TB_TICKET'))return [{TOTAL:1,RESUELTOS:0,EN_TRABAJO:1,ASIGNADOS:0}];
   return [];
  }};
 const activity=new PlatformActivity(store), telemetry=new PlatformTelemetry(store,{}, {manager:()=>true,has:()=>true});
 const functions=Array.from({length:180},(_,i)=>({funcion:i,nombre:'Función '+i+' · '+(i===179?'Nombre extenso para comprobar el ajuste en pantallas pequeñas y conservar las selecciones al buscar':'Operación de prueba'),permitido:i<120}));
 function graphql({query,variables={},actor,request,state}){
  const name=getOperationAST(parse(query)).selectionSet.selections[0].name.value;
  const data={funcionesPorUsuarioEmpresas:[{empresa:'97',nombre:'Empresa ficticia'}],funcionesPorUsuarioUsuarios:[{asignaUsuario:'7',usuario:'Persona ficticia'}],funcionesPorUsuarioAplicaciones:[{aplicacion:'13',nombre:'Aplicación ficticia'}],funcionesPorUsuarioPermisos:{...variables.input,totalPermitidas:120,funciones:functions},guardarFuncionesPorUsuario:{success:true,message:'Permisos guardados correctamente',totalPermisos:variables.input?.funciones?.length||0,bitacoraId:1}};
  if(!Object.hasOwn(data,name))return undefined;
  calls.push({name,variables});
  if(name==='guardarFuncionesPorUsuario'){const proof=state.confirmations[request.headers['x-ticket-confirmation']];assert.equal(proof.paso,2);assert.equal(variables.input.funciones.length,121);assert.ok(variables.input.funciones.includes(179));assert.ok(variables.input.funciones.includes(0));}
  jobs.push(activity.capture('FuncionesPorUsuarioResolver.'+name,actor.id,data[name],request.headers['x-ticket-request-id']));
  return {data:{[name]:data[name]}};
 }
 const drain=async count=>{await Promise.all(jobs);for(let i=0;i<100;i++){await activity.flush();if(events.size===count&&!(await fs.readdir(activity.directory).catch(()=>[])).some(f=>f.endsWith('.json')))return;await new Promise(r=>setTimeout(r,25));}throw Error('La cola no entregó las métricas');};
 let instance,browser,page,failMetrics=false;
 try{
  instance=await start({port:4055,file:path.join(temp,'estado.json'),compiled:true,graphql});
  const {APPS_CATALOG_DUMMY}=require('./load-ts.cjs')(root)('src/api/graphql/home/appsCatalog.dummy.ts');await instance.lab.state.change(s=>{s.applicationCatalog=APPS_CATALOG_DUMMY;});
  browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(25000);page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>/^https?:/.test(route.request().url())&&new URL(route.request().url()).hostname!=='127.0.0.1'?route.abort():route.continue());
  await page.route('**/api/platform/metrics?*',async route=>{const params=Object.fromEntries(new URL(route.request().url()).searchParams);queries.push(params);if(failMetrics)return route.fulfill({status:503,json:{message:'No se pudo actualizar el reporte de métricas.'}});return route.fulfill({json:await telemetry.metrics({id:1,admin:true,memberships:[],permisos:new Set()},params)});});
  for(let i=0;i<100;i++){try{if((await fetch(instance.base+'/home')).status<500)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  const visit=async url=>{await page.goto(instance.base+url);await page.waitForLoadState('networkidle');};
  await visit('/__laboratorio/entrar?usuario=1');await visit('/espacio/metricas');
  await page.getByRole('cell',{name:'No hay operaciones registradas para esta consulta.',exact:true}).waitFor();assert.equal(events.size,0);
  await page.screenshot({path:path.join(out,'metricas-sin-operaciones.png'),fullPage:true});
  await visit('/espacio/accesos?tab=corporate');await page.locator('#company').selectOption('97');await page.locator('#generalUser').selectOption('7');await page.locator('#application').selectOption('13');
  assert.equal(events.size,0,'los catálogos no son operaciones de negocio');
  await page.getByRole('button',{name:'Consultar permisos',exact:true}).click();
  const choices=page.getByRole('group',{name:'Funciones de la aplicación',exact:true});await choices.getByRole('checkbox').first().waitFor();await drain(1);
  assert.ok((await choices.boundingBox()).height<450,'la lista no alarga la pantalla');
  assert.equal(await choices.getByRole('checkbox').count(),180);
  await choices.getByRole('searchbox').fill('Función 179 ·');assert.equal(await choices.getByRole('checkbox').count(),1);await choices.getByRole('checkbox').check();
  await choices.getByRole('searchbox').fill('');assert.equal(await choices.getByRole('checkbox').first().isChecked(),true);await choices.getByText('121 seleccionadas · 180 disponibles · 180 mostradas',{exact:true}).waitFor();
  await page.screenshot({path:path.join(out,'funciones-autorizadas-compactas.png'),fullPage:true});
  for(const width of [1024,390]){await page.setViewportSize({width,height:1100});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'sin desbordamiento '+width);assert.ok((await choices.boundingBox()).height<500);await page.screenshot({path:path.join(out,'funciones-'+width+'.png'),fullPage:true});}
  await page.setViewportSize({width:1440,height:1100});await page.getByRole('button',{name:'Guardar permisos',exact:true}).click();
  await page.getByRole('dialog',{name:'Revisa el cambio',exact:true}).waitFor();assert.equal(calls.filter(c=>c.name==='guardarFuncionesPorUsuario').length,0);await page.getByRole('button',{name:'Confirmar revisión · 1 de 2',exact:true}).click();await page.getByLabel('He revisado la acción y quiero aplicarla.').check();await page.getByRole('button',{name:'Confirmar y aplicar · 2 de 2',exact:true}).click();await page.getByText('Permisos guardados correctamente',{exact:true}).waitFor();await drain(2);
  await visit('/espacio/metricas');await page.getByRole('cell',{name:'Funciones corporativas guardadas',exact:true}).waitFor();await page.getByRole('cell',{name:'Consulta de funciones corporativas',exact:true}).waitFor();await page.screenshot({path:path.join(out,'metricas-operaciones-confirmadas.png'),fullPage:true});
  await Promise.all(Array.from({length:101},()=>activity.capture('ReporteRhResolver.reporteRhExportExcel',1,{contentBase64:'DATOS_FICTICIOS',totalFilas:3})));await drain(103);
  await page.getByRole('button',{name:'Consultar',exact:true}).click();await page.getByText(/103 registros/).waitFor();
  const original=queries.at(-1).desde;await page.getByLabel('Desde',{exact:true}).fill('2026-11-01');const next=page.waitForResponse(r=>r.url().includes('/api/platform/metrics?')&&new URL(r.url()).searchParams.get('offset')==='100');await page.getByRole('button',{name:'Siguiente',exact:true}).click();await next;assert.equal(queries.at(-1).desde,original,'paginar usa los filtros aplicados');
  failMetrics=true;await page.getByRole('button',{name:'Consultar',exact:true}).click();await page.getByRole('alert').filter({hasText:'Se conservan los resultados'}).waitFor();assert.equal(await page.getByRole('row').count(),4);
  assert.deepEqual(errors,[]);console.log('METRICAS_FUNCIONES_BROWSER_OK; operaciones reales del colector compilado, catálogos excluidos, lista de 180 funciones acotada, búsqueda sin perder selección, dos confirmaciones, fechas, paginación y error conservado; capturas='+out);
 }catch(e){if(page){await page.screenshot({path:path.join(out,'fallo.png'),fullPage:true}).catch(()=>{});await fs.writeFile(path.join(out,'fallo.txt'),await page.locator('body').innerText()).catch(()=>{});}throw e;}
 finally{activity.onModuleDestroy();await browser?.close();await instance?.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
