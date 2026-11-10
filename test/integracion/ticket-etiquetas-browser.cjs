// Recorrido del Panel/BFF compilados sobre el laboratorio ficticio de loopback.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const {chromium}=require('playwright');
const {start}=require('../../scripts/laboratorio/iniciar.cjs');
async function run(){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'tickets-etiquetas-')),captures=path.join(dir,'capturas');await fs.mkdir(captures);
 let instance,browser,page;const errors=[];
 try{
  instance=await start({port:4085,file:path.join(dir,'estado.json'),compiled:true});
  await instance.lab.state.change(s=>{
   s.tickets=[{id:21,codigo:null,titulo:'Clasificación de prueba',descripcion:'Datos ficticios',usuarioCreadorId:7,usuarioAsignadoId:4,estadoId:2,categoriaId:1,prioridadId:2,version:1,fechaCreacion:new Date().toISOString(),fechaActualizacion:new Date().toISOString()},
   {id:22,codigo:null,titulo:'Cierre anterior de prueba',descripcion:'Datos ficticios',usuarioCreadorId:7,usuarioAsignadoId:5,estadoId:5,categoriaId:1,prioridadId:2,version:1,fechaCreacion:new Date().toISOString(),fechaActualizacion:new Date().toISOString(),fechaCierre:new Date().toISOString()}];s.ticketHistory=[];s.messages=[];
  });
  browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(25000);page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>/^https?:/.test(route.request().url())&&new URL(route.request().url()).hostname!=='127.0.0.1'?route.abort():route.continue());
  const visit=async url=>{await page.goto(instance.base+url);await page.waitForLoadState('networkidle');};
  const ticket=()=>instance.lab.state.data.tickets.find(t=>t.id===21);
  const wait=async check=>{for(let i=0;i<100;i++){if(await check())return;await new Promise(resolve=>setTimeout(resolve,50));}assert.ok(await check());};
  const confirm=async()=>{await page.getByRole('dialog',{name:'Revisa el cambio',exact:true}).getByRole('button',{name:'Confirmar revisión · 1 de 2',exact:true}).click();await page.getByLabel('He revisado la acción y quiero aplicarla.').check();await page.getByRole('button',{name:'Confirmar y aplicar · 2 de 2',exact:true}).click();};
  for(let i=0;i<100;i++){try{if((await fetch(instance.base+'/home')).status<500)break;}catch{}await new Promise(resolve=>setTimeout(resolve,100));}
  await visit('/__laboratorio/entrar?usuario=1');await visit('/mis-tickets/21');
  const input=()=>page.getByRole('combobox',{name:'Etiquetas de trabajo',exact:true});
  const add=async name=>{await input().fill(name);await page.getByRole('option',{name,exact:true}).click();await page.getByRole('button',{name:'Quitar '+name,exact:true}).waitFor();await input().press('Escape');};
  const remove=async name=>{await page.getByRole('button',{name:'Quitar '+name,exact:true}).click();await input().press('Escape');};
  await input().fill('diagnostico');await page.getByRole('option',{name:'Diagnóstico',exact:true}).waitFor();await input().fill('');
  await add('Limpieza');await page.getByRole('button',{name:'Guardar etiquetas',exact:true}).click();
  await page.getByRole('dialog',{name:'Revisa el cambio',exact:true}).getByRole('button',{name:'Cancelar',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Quitar Limpieza',exact:true}).count(),1);assert.deepEqual(ticket().tagIds||[],[]);
  await page.getByRole('button',{name:'Guardar etiquetas',exact:true}).click();await confirm();await wait(()=>ticket().tagIds?.includes(5));
  await visit('/__laboratorio/entrar?usuario=4');await visit('/mis-tickets/21');
  await remove('Limpieza');await add('Mantenimiento');await add('Reporte');
  assert.equal(await page.getByRole('button',{name:'Iniciar atención',exact:true}).isDisabled(),true);
  instance.lab.failures.push({ruta:'/platform/tickets/21/tags',restantes:1});
  await page.getByRole('button',{name:'Guardar etiquetas',exact:true}).click();await page.getByRole('alert').filter({hasText:'simulad'}).waitFor();assert.equal(await page.getByRole('button',{name:'Quitar Mantenimiento',exact:true}).count(),1);assert.deepEqual(ticket().tagIds,[5]);
  await page.getByRole('button',{name:'Guardar etiquetas',exact:true}).click();await wait(()=>JSON.stringify(ticket().tagIds)==='[1,2]');
  await page.getByRole('button',{name:'Iniciar atención',exact:true}).click();await wait(()=>ticket().estadoId===3);await visit('/mis-tickets/21');
  await remove('Mantenimiento');assert.equal(await page.getByRole('button',{name:'Resolver ticket',exact:true}).isDisabled(),true);await remove('Reporte');await page.getByRole('button',{name:'Guardar etiquetas',exact:true}).click();await wait(()=>ticket().tagIds.length===0);
  assert.equal(await page.getByRole('button',{name:'Resolver ticket',exact:true}).isDisabled(),true);
  const blocked=await page.evaluate(async version=>{const token=JSON.parse(localStorage.getItem('auth-storage')).state.token;const response=await fetch('/api/platform/tickets/21/resolve',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({version,requestId:crypto.randomUUID()})});return response.status;},ticket().version);assert.equal(blocked,409);assert.equal(ticket().estadoId,3);
  await add('Mantenimiento');await add('Reporte');await page.getByRole('button',{name:'Guardar etiquetas',exact:true}).click();await wait(()=>ticket().tagIds.length===2);
  await wait(()=>page.getByRole('button',{name:'Resolver ticket',exact:true}).isEnabled());await page.screenshot({path:path.join(captures,'clasificacion.png'),fullPage:true});
  await page.getByRole('button',{name:'Resolver ticket',exact:true}).click();await wait(()=>ticket().estadoId===5);assert.deepEqual(ticket().clasificacionCierre.etiquetas.map(t=>t.nombre),['Mantenimiento','Reporte']);
  await visit('/mis-tickets/21');assert.equal(await input().count(),0);
  await visit('/__laboratorio/entrar?usuario=1');await visit('/espacio/metricas');await page.getByRole('button',{name:'Por técnico y etiqueta',exact:true}).click();await page.getByRole('heading',{name:'Tickets resueltos por técnico y etiqueta',exact:true}).waitFor();await page.getByRole('cell',{name:'Sin clasificación histórica',exact:true}).first().waitFor();
  const summary=page.getByRole('table',{name:'Tickets resueltos agrupados por técnico y etiqueta',exact:true});await summary.getByRole('cell',{name:'Mantenimiento',exact:true}).waitFor();assert.equal(await summary.locator('tbody tr').count(),3);
  await page.getByLabel('Técnico',{exact:true}).selectOption('4');await page.getByRole('button',{name:'Consultar reporte',exact:true}).click();await page.locator('p').filter({hasText:/^Resultados del .* · Técnico ficticio · Hora de Guatemala\.$/}).waitFor();assert.equal(await summary.locator('tbody tr').count(),2);
  await page.getByLabel('Etiqueta',{exact:true}).selectOption('2');await page.getByRole('button',{name:'Consultar reporte',exact:true}).click();await page.locator('p').filter({hasText:/^Resultados del .* · Técnico ficticio · Reporte · Hora de Guatemala\.$/}).waitFor();assert.equal(await summary.locator('tbody tr').count(),1);
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Descargar resumen CSV',exact:true}).click();const file=await download;const filename=path.join(dir,'reporte.csv');await file.saveAs(filename);const csv=await fs.readFile(filename,'utf8');assert.ok(csv.startsWith('\ufeff'));assert.match(csv,/"Reporte"/);assert.equal(csv.split('\r\n').length,3);
  const popupReady=page.waitForEvent('popup');await page.getByRole('link',{name:'#21 · Clasificación de prueba',exact:true}).click();const popup=await popupReady;await popup.getByRole('heading',{name:'#21 · Clasificación de prueba',exact:true}).waitFor();await popup.close();assert.equal(await page.getByLabel('Etiqueta',{exact:true}).inputValue(),'2');
  await page.screenshot({path:path.join(captures,'reporte.png'),fullPage:true});
  for(const width of [1024,390]){await page.setViewportSize({width,height:1100});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.getByRole('button',{name:'Descargar resumen CSV',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(captures,'reporte-'+width+'.png')});}
  await visit('/__laboratorio/entrar?usuario=7');await visit('/espacio/metricas');assert.equal(await page.getByRole('button',{name:'Por técnico y etiqueta',exact:true}).count(),0);
  const forbidden=await page.evaluate(async()=>{const token=JSON.parse(localStorage.getItem('auth-storage')).state.token;const response=await fetch('/api/platform/tickets/reports/labels?desde=2026-11-01T06:00:00Z&hasta=2026-11-11T06:00:00Z',{headers:{Authorization:'Bearer '+token}});return response.status;});assert.equal(forbidden,403);assert.deepEqual(errors,[]);
  console.log('TICKET_ETIQUETAS_BROWSER_OK; administrador con doble confirmación/cancelación, técnico clasifica, fallo conserva selección, cierre requiere etiquetas, copia histórica, reporte único/múltiples etiquetas, filtros, CSV y permiso efectivo; capturas='+captures);
 }catch(error){if(page){await page.screenshot({path:path.join(captures,'fallo.png'),fullPage:true}).catch(()=>{});await fs.writeFile(path.join(captures,'fallo.txt'),await page.locator('body').innerText()).catch(()=>{});}throw error;}
 finally{await browser?.close();await instance?.close();}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
