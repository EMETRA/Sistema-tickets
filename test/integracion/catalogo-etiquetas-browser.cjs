// Panel/BFF reales + servicio de catálogo del API; persistencia Oracle ficticia, sin correo.
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const {chromium}=require('playwright'),{start}=require('../../scripts/laboratorio/iniciar.cjs');
async function main(){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'tickets-catalogo-'));
 const {PlatformTagCatalog}=require(path.resolve(__dirname,'../../../api-tickets/dist/platform/platform.tag-catalog'));
 const labels=require('../../scripts/laboratorio/ticket-labels.cjs');labels.catalog.splice(0);
 let instance,browser,page;const errors=[],audits=[];
 try{
  instance=await start({port:4105,file:path.join(dir,'estado.json'),compiled:true});
  await instance.lab.state.change(s=>{s.tickets=[{id:21,codigo:null,titulo:'Catálogo de prueba',descripcion:'Datos ficticios',usuarioCreadorId:7,usuarioAsignadoId:4,estadoId:2,categoriaId:1,prioridadId:2,version:1,fechaCreacion:new Date().toISOString(),fechaActualizacion:new Date().toISOString()}];s.messages=[];s.ticketHistory=[];});
  const runner={query:async(sql,b)=>{assert.match(sql,/INSERT INTO ADMEMETRAIT.TB_TICKET_TAG/);labels.catalog.push({id:String(labels.catalog.length+1),nombre:b[0],color:b[1]});return [];}};
  const store={ticketSchema:'ADMEMETRAIT',rows:async()=>labels.catalog.map(t=>({ID:Number(t.id),NOMBRE:t.nombre,COLOR:t.color}))};
  const commands={run:async(actor,body,method,route,confirmation,fn)=>{assert.equal(method,'POST');assert.ok(instance.lab.state.data.confirmations[confirmation]?.paso===2);return fn(runner);},audit:async(...args)=>{audits.push(args);}};
  const service=new PlatformTagCatalog(store,commands);
  const original=instance.lab.server.listeners('request')[0];instance.lab.server.removeAllListeners('request');instance.lab.server.on('request',async(req,res)=>{
   if(!req.url.startsWith('/platform/tickets/tag-catalog'))return original(req,res);
   const user=instance.lab.sessions.get((req.headers.authorization||'').replace(/^Bearer /,'')),actor={id:user,nombre:'Actor ficticio',admin:user===1};
   const json=(r,status=201)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(r));};
   try{const chunks=[];for await(const c of req)chunks.push(c);const body=JSON.parse(Buffer.concat(chunks)||'{}');const result=await service.save(actor,body,req.url.endsWith('/initialize'),req.headers['x-ticket-confirmation']);json(result);}catch(e){json({message:e.message},e.getStatus?.()||500);}
  });
  browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>/^https?:/.test(r.request().url())&&new URL(r.request().url()).hostname!=='127.0.0.1'?r.abort():r.continue());
  const visit=async url=>{await page.goto(instance.base+url);await page.waitForLoadState('networkidle');};
  const confirm=async()=>{await page.getByRole('button',{name:'Confirmar revisión · 1 de 2',exact:true}).click();await page.getByLabel('He revisado la acción y quiero aplicarla.').check();await page.getByRole('button',{name:'Confirmar y aplicar · 2 de 2',exact:true}).click();};
  for(let i=0;i<100;i++){try{if((await fetch(instance.base+'/home')).status<500)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  await visit('/__laboratorio/entrar?usuario=1');await visit('/mis-tickets/21');await page.getByRole('button',{name:'Crear etiquetas iniciales',exact:true}).click();assert.equal(labels.catalog.length,0);await confirm();for(const name of ['Mantenimiento','Reporte','Formulario','Instalación','Limpieza','Diagnóstico'])await page.getByRole('checkbox',{name,exact:true}).waitFor();assert.equal(labels.catalog.length,6);assert.equal(audits.length,1);assert.equal(await page.getByRole('button',{name:'Crear etiquetas iniciales',exact:true}).count(),0);
  await page.getByText('Nueva etiqueta de trabajo',{exact:true}).click();await page.getByLabel('Nombre de la etiqueta',{exact:true}).fill('Red');await page.getByRole('button',{name:'Crear etiqueta',exact:true}).click();await confirm();await page.getByRole('checkbox',{name:'Red',exact:true}).waitFor();assert.equal(labels.catalog.length,7);await page.screenshot({path:path.join(dir,'catalogo.png'),fullPage:true});
  await visit('/__laboratorio/entrar?usuario=4');await visit('/mis-tickets/21');assert.equal(await page.getByText('Nueva etiqueta de trabajo',{exact:true}).count(),0);await page.getByRole('checkbox',{name:'Mantenimiento',exact:true}).check();assert.equal(await page.getByRole('checkbox',{name:'Mantenimiento',exact:true}).isChecked(),true);
  const denied=await page.evaluate(async()=>{const token=JSON.parse(localStorage.getItem('auth-storage')).state.token;return (await fetch('/api/platform/tickets/tag-catalog/initialize',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({requestId:crypto.randomUUID()})})).status;});assert.equal(denied,403);assert.equal(labels.catalog.length,7);assert.deepEqual(errors,[]);console.log('CATALOGO_ETIQUETAS_BROWSER_OK; carga real del servicio sobre DB ficticia, doble confirmación, nuevas etiquetas y permisos; capturas='+dir);
 }catch(e){if(page){await page.screenshot({path:path.join(dir,'fallo.png'),fullPage:true}).catch(()=>{});console.error((await page.locator('body').innerText()).slice(-3000));}throw e;}finally{await browser?.close();await instance?.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
