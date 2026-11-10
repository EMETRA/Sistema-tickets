// Panel/BFF compilados + lector privado y parser Office reales; Oracle y datos ficticios.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {chromium} = require('playwright');
const {start} = require('../../scripts/laboratorio/iniciar.cjs');
async function run() {
 const api = process.env.TICKETS_API_SOURCE || path.resolve(__dirname,'../../../api-tickets');
 const {PlatformTicketFiles} = require(path.join(api,'dist/platform/platform.ticket-files.js'));
 const {PlatformOfficePreview} = require(path.join(api,'dist/platform/platform.office-preview.js'));
 const {PlatformTickets} = require(path.join(api,'dist/platform/platform.tickets.js'));
 const {PlatformAccess} = require(path.join(api,'dist/platform/platform.access.js'));
 const fixtures = require(path.join(api,'test/office/fixtures.cjs'));
 const dir = await fs.mkdtemp(path.join(os.tmpdir(),'tickets-office-'));
 const captures = path.join(dir,'capturas');await fs.mkdir(captures);await fs.mkdir(path.join(dir,'tickets'));
 const files = [
  {id:1,name:'informe.docx',buffer:fixtures.docx()},
  {id:2,name:'operaciones.xlsx',buffer:fixtures.spreadsheet()},
  {id:3,name:'antiguo.doc',buffer:fixtures.doc()},
  {id:4,name:'antiguo.xls',buffer:fixtures.spreadsheet('biff8')},
  {id:5,name:'danado.docx',buffer:Buffer.from('Archivo de prueba dañado')},
 ];
 for (const file of files) await fs.writeFile(path.join(dir,'tickets',file.name),file.buffer);
 let metaReads = 0, conversions = 0;
 const store = {ticketSchema:'ADMEMETRAIT',config:{get:key=>key==='file.storage.destination'?dir:undefined},table:name=>'QA.'+name,rows:async(sql,binds)=>{
  if(sql.includes('TB_TICKET_ADJUNTO')) {
   metaReads++;assert.match(sql,/WHERE "id"=:1 AND TICKET=:2/);
   const file = binds[1]===21 ? files.find(f=>f.id===binds[0]) : undefined;
   return file ? [{KEY_STORAGE:'tickets/'+file.name,NOMBRE_ARCHIVO:file.name}] : [];
  }
  if(sql.includes('TB_TICKET t')) return binds[0]===21 ? [{USUARIO_CREADOR:1,USUARIO_ASIGNADO:1,EQUIPO_ID:'19d647f0-643e-4b89-8c0c-4cc7adc03bde'}] : [];
  return [];
 }};
 const reader = new PlatformTicketFiles(store,new PlatformTickets(store,new PlatformAccess(store),{},{}));
 const office = new PlatformOfficePreview();
 let instance,browser,page;const errors=[],external=[];
 try {
  instance = await start({port:4075,file:path.join(dir,'estado.json'),compiled:true,graphql:({query})=>{
   if(query.includes('ticketAttachments')) return {data:{ticketAttachments:files.map(f=>({id:String(f.id),ticketId:21,usuarioId:1,nombreArchivo:f.name,keyStorage:'tickets/'+f.name,fecha:new Date().toISOString()}))}};
  }});
  await instance.lab.state.change(state=>{
   state.tickets=[{id:21,codigo:null,titulo:'Documentos del ticket',descripcion:'Archivos ficticios',usuarioCreadorId:1,usuarioAsignadoId:1,estadoId:3,categoriaId:1,prioridadId:2,version:1,fechaCreacion:new Date().toISOString(),fechaActualizacion:new Date().toISOString()}];state.messages=[];state.ticketHistory=[];
  });
  // Sustituye solo el límite Oracle/HTTP del laboratorio; atraviesa el BFF real de Next.
  const original = instance.lab.server.listeners('request')[0];
  instance.lab.server.removeAllListeners('request');
  instance.lab.server.on('request',async(req,res)=>{
   const match = req.url.match(/^\/platform\/tickets\/(\d+)\/files\/(\d+)(\/preview)?$/);
   if(!match) return original(req,res);
   const user = instance.lab.sessions.get((req.headers.authorization||'').replace(/^Bearer /,''));
   res.setHeader('Cache-Control','private, no-store');
   if(!user){res.writeHead(401,{'Content-Type':'application/json'});return res.end('{}');}
   try {
    const file = await reader.read({id:user,admin:user===1,permisos:new Set(),memberships:[]},Number(match[1]),Number(match[2]));
    if(match[3]){conversions++;const preview=await office.convert(file);res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(preview));}
    else {res.writeHead(200,{'Content-Type':file.mime});res.end(file.buffer);}
   } catch(error){res.writeHead(error.getStatus?.()||503,{'Content-Type':'application/json'});res.end(JSON.stringify({codigo:'PRUEBA',message:error.message,referencia:'11111111-2222-4333-8444-555555555555'}));}
  });
  browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  page = await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(25000);page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{const url=route.request().url();if(/^https?:/.test(url)&&new URL(url).hostname!=='127.0.0.1'){external.push(url);return route.abort();}return route.continue();});
  const visit=async url=>{await page.goto(instance.base+url);await page.waitForLoadState('networkidle');};
  for(let i=0;i<100;i++){try{if((await fetch(instance.base+'/home')).status<500)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  await visit('/__laboratorio/entrar?usuario=1');await visit('/mis-tickets/21');
  const open=async name=>{await page.getByRole('button',{name,exact:true}).click();await page.getByRole('link',{name:'Descargar archivo',exact:true}).waitFor();};
  const close=()=>page.getByRole('button',{name:'Cerrar visor de archivos',exact:true}).click();
  const download=async file=>{const ready=page.waitForEvent('download');await page.getByRole('link',{name:'Descargar archivo',exact:true}).click();const saved=path.join(dir,'descarga-'+file.name);await (await ready).saveAs(saved);assert.deepEqual(await fs.readFile(saved),file.buffer);};
  await open('informe.docx');
  const frame=page.frameLocator('iframe[title="Word: informe.docx"]');
  await frame.getByRole('heading',{name:'Informe de prueba'}).waitFor();assert.equal(await frame.locator('strong').innerText(),'Texto destacado');assert.equal(await frame.locator('table td').first().innerText(),'Equipo');assert.equal(await frame.locator('a,script').count(),0);
  assert.equal(await page.locator('iframe[title="Word: informe.docx"]').getAttribute('sandbox'),'');
  await page.screenshot({path:path.join(captures,'word.png'),fullPage:true});await download(files[0]);await close();
  await open('operaciones.xlsx');await page.getByRole('tab',{name:'Operaciones',exact:true}).waitFor();await page.getByRole('cell',{name:'Registro 1',exact:true}).waitFor();
  await page.getByRole('cell',{name:'<img src=x onerror=alert(1)>',exact:true}).waitFor();assert.equal(await page.getByRole('tabpanel',{name:'Operaciones',exact:true}).locator('img').count(),0);
  await page.getByRole('button',{name:'Filas siguientes',exact:true}).click();await page.getByRole('cell',{name:'Registro 50',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Filas siguientes',exact:true}).isDisabled(),true);
  await page.getByRole('tab',{name:'Resumen',exact:true}).click();await page.getByRole('cell',{name:'42',exact:true}).waitFor();
  await page.getByRole('tab',{name:'Resumen',exact:true}).press('ArrowRight');await page.getByText('La hoja está vacía.',{exact:true}).waitFor();
  await page.getByRole('tab',{name:'Vacía',exact:true}).press('Home');await page.getByRole('cell',{name:'Registro 1',exact:true}).waitFor();
  await page.screenshot({path:path.join(captures,'excel.png'),fullPage:true});
  for(const width of [1024,390]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(captures,'excel-'+width+'.png'),fullPage:true});}
  await download(files[1]);await close();await page.setViewportSize({width:1440,height:1000});
  await open('antiguo.doc');await page.frameLocator('iframe[title="Word: antiguo.doc"]').getByText('Documento antiguo de prueba',{exact:true}).waitFor();await close();
  await open('antiguo.xls');await page.getByRole('tab',{name:'Resumen',exact:true}).click();await page.getByRole('cell',{name:'42',exact:true}).waitFor();await close();
  await open('danado.docx');await page.getByRole('alert').filter({hasText:'No se pudo interpretar el documento'}).waitFor();await download(files[4]);await page.getByRole('button',{name:'Reintentar vista previa',exact:true}).click();await page.getByRole('alert').filter({hasText:'No se pudo interpretar el documento'}).waitFor();await close();
  await visit('/__laboratorio/entrar?usuario=7');const before=metaReads,beforeConversions=conversions;
  const forbidden=await page.evaluate(async()=>{const token=JSON.parse(localStorage.getItem('auth-storage')).state.token;const r=await fetch('/api/platform/tickets/21/files/1/preview',{headers:{Authorization:'Bearer '+token}});return r.status;});
  assert.equal(forbidden,403);assert.equal(metaReads,before);assert.equal(conversions,beforeConversions);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log('OFFICE_BROWSER_OK; Word DOCX/DOC, Excel XLSX/XLS y hojas con teclado/paginación, descarga original idéntica, fallo/reintento, 403 sin conversión, BFF y worker reales; capturas='+captures);
 } catch(error){if(page){await page.screenshot({path:path.join(captures,'fallo.png'),fullPage:true}).catch(()=>{});await fs.writeFile(path.join(captures,'fallo.txt'),await page.locator('body').innerText()).catch(()=>{});}throw error;}
 finally {await browser?.close();await instance?.close();}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
