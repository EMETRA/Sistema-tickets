// Panel/BFF compilados y lector de archivos real; datos y conexiones Oracle ficticios en loopback.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const {parse,getOperationAST}=require('graphql');
const {chromium}=require('playwright');
const {start}=require('../../scripts/laboratorio/iniciar.cjs');
function pdf(){
 const text='BT /F1 20 Tf 50 720 Td (Adjunto ficticio de ticket) Tj ET';
 const objects=['<</Type/Catalog/Pages 2 0 R>>','<</Type/Pages/Kids[3 0 R]/Count 1>>','<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>','<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',`<</Length ${Buffer.byteLength(text)}>>\nstream\n${text}\nendstream`];
 let output='%PDF-1.4\n';const offsets=[0];for(const [i,object]of objects.entries()){offsets.push(Buffer.byteLength(output));output+=`${i+1} 0 obj\n${object}\nendobj\n`;}
 const xref=Buffer.byteLength(output);output+=`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')}trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF\n`;return Buffer.from(output);
}
async function run(){
 const root=path.resolve(__dirname,'../..'), api=process.env.TICKETS_API_SOURCE||path.resolve(root,'../api-tickets');
 const {PlatformTicketFiles}=require(path.join(api,'dist/platform/platform.ticket-files.js'));
 const {PlatformTickets}=require(path.join(api,'dist/platform/platform.tickets.js'));
 const {PlatformAccess}=require(path.join(api,'dist/platform/platform.access.js'));
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'tickets-admin-'));
 const out=process.env.QA_SCREENSHOT_DIR||path.join(dir,'capturas');await fs.mkdir(out,{recursive:true});await fs.mkdir(path.join(dir,'tickets'));
 const document=pdf();await fs.writeFile(path.join(dir,'tickets/ejemplo.pdf'),document);
 let metaReads=0;
 const store={ticketSchema:'ADMEMETRAIT',config:{get:key=>key==='file.storage.destination'?dir:undefined},table:name=>'QA.'+name,rows:async(sql,binds)=>{
  if(sql.includes('TB_TICKET_ADJUNTO')){metaReads++;if(!sql.includes('WHERE "id"=:1'))throw Object.assign(Error('Identificador inválido'),{code:'ORA-00904'});return binds[0]===2&&binds[1]===21?[{KEY_STORAGE:'tickets/ejemplo.pdf',NOMBRE_ARCHIVO:'ejemplo.pdf'}]:[];}
  if(sql.includes('TB_TICKET t'))return binds[0]===21?[{USUARIO_CREADOR:1,USUARIO_ASIGNADO:1,EQUIPO_ID:'19d647f0-643e-4b89-8c0c-4cc7adc03bde'}]:[];
  return [];
 }};
 const reader=new PlatformTicketFiles(store,new PlatformTickets(store,new PlatformAccess(store),{},{}));
 let instance,browser,page,failPdf=true,failedUploads=0;const errors=[],sends=[];
 try{
  instance=await start({port:4065,file:path.join(dir,'estado.json'),compiled:true});
  await instance.lab.state.change(s=>{
   s.users[0].rol='USER_ADMIN';
   s.tickets=[{id:21,codigo:null,titulo:'Primer ticket de prueba',descripcion:'Descripción **ficticia**.',usuarioCreadorId:1,usuarioAsignadoId:1,estadoId:3,categoriaId:1,prioridadId:2,tiempoEstimado:10,version:1,fechaCreacion:new Date().toISOString(),fechaActualizacion:new Date().toISOString()}];
   s.messages=[{ticketId:21,usuario:1,nombre_usuario:null,fechaEnvio:new Date().toISOString(),textoMensaje:'Comentario anterior de prueba',archivos:[]}];s.ticketHistory=[];
  });
  browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(25000);page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>/^https?:/.test(route.request().url())&&new URL(route.request().url()).hostname!=='127.0.0.1'?route.abort():route.continue());
  await page.route('**/api/ticket/21/attachments',route=>route.fulfill({json:{ticketAttachments:[{id:'2',ticketId:21,usuarioId:1,nombreArchivo:'ejemplo.pdf',keyStorage:'tickets/ejemplo.pdf',fecha:new Date().toISOString()}]}}));
  await page.route('**/api/platform/tickets/*/files/*',async route=>{
   if(failPdf){failPdf=false;return route.fulfill({status:503,json:{codigo:'NO_DISPONIBLE',message:'No disponible',referencia:'11111111-2222-4333-8444-555555555555'}});}
   const match=new URL(route.request().url()).pathname.match(/tickets\/(\d+)\/files\/(\d+)$/);const user=instance.lab.sessions.get((route.request().headers().authorization||'').replace(/^Bearer /,''))||0;
   try{const file=await reader.read({id:user,admin:user===1,permisos:new Set(),memberships:[]},Number(match[1]),Number(match[2]));return route.fulfill({status:200,body:file.buffer,contentType:file.mime});}
   catch(e){return route.fulfill({status:e.getStatus?.()||503,json:{codigo:e.getStatus?.()===403?'SIN_PERMISO':'NO_DISPONIBLE',message:'Archivo no disponible'}});}
  });
  await page.route('**/api/graphql',async route=>{
   const request=route.request();
   if((request.headers()['content-type']||'').includes('multipart/form-data')){
    const form=await new Request('http://127.0.0.1/',{method:'POST',headers:request.headers(),body:request.postDataBuffer()}).formData();const operation=JSON.parse(form.get('operations'));assert.equal(operation.variables.input.ticketId,21);assert.equal(form.get('0').name,'nota.txt');assert.deepEqual(JSON.parse(form.get('map')),{'0':['variables.files.0']});
    const proof=instance.lab.state.data.confirmations[request.headers()['x-ticket-confirmation']];assert.equal(proof.paso,2);failedUploads++;return route.fulfill({json:{errors:[{message:'Fallo controlado de prueba',extensions:{code:'INTERNAL_SERVER_ERROR'}}],data:null}});
   }
   const body=request.postDataJSON(), name=getOperationAST(parse(body.query)).selectionSet.selections[0].name.value;
   if(name==='sendTicketMessage'){const proof=instance.lab.state.data.confirmations[request.headers()['x-ticket-confirmation']];assert.equal(proof.paso,2);sends.push(body.variables.input);}
   return route.continue();
  });
  for(let i=0;i<100;i++){try{if((await fetch(instance.base+'/home')).status<500)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  const visit=async url=>{await page.goto(instance.base+url);await page.waitForLoadState('networkidle');};
  const confirm=async()=>{await page.getByRole('dialog',{name:'Revisa el cambio',exact:true}).waitFor();await page.getByRole('button',{name:'Confirmar revisión · 1 de 2',exact:true}).click();await page.getByLabel('He revisado la acción y quiero aplicarla.').check();await page.getByRole('button',{name:'Confirmar y aplicar · 2 de 2',exact:true}).click();};
  await visit('/__laboratorio/entrar?usuario=1');await visit('/mis-tickets/21');
  await page.getByRole('heading',{name:'#21 · Primer ticket de prueba',exact:true}).waitFor();assert.equal(await page.getByRole('heading',{name:/^null/}).count(),0);await page.getByRole('heading',{name:'Gestión del ticket',exact:true}).waitFor();await page.getByText('Comentario anterior de prueba',{exact:true}).waitFor();
  await page.getByRole('button',{name:'ejemplo.pdf',exact:true}).click();await page.getByText('Referencia: 11111111-2222-4333-8444-555555555555',{exact:true}).waitFor();await page.getByRole('button',{name:'Reintentar archivo',exact:true}).click();await page.locator('iframe[title="PDF: ejemplo.pdf"]').waitFor();
  const download=page.waitForEvent('download');await page.getByRole('link',{name:'Descargar archivo',exact:true}).click();const downloaded=await download;const saved=path.join(dir,'descarga.pdf');await downloaded.saveAs(saved);assert.equal(Buffer.compare(await fs.readFile(saved),document),0);await page.getByRole('button',{name:'Cerrar visor de archivos',exact:true}).click();
  const input=page.getByLabel('Comentario',{exact:true});await input.fill('Prueba de comentario');await page.getByRole('button',{name:'Enviar comentario',exact:true}).click();await page.getByRole('dialog',{name:'Revisa el cambio',exact:true}).waitFor();assert.equal(sends.length,0);await confirm();await page.getByText('Prueba de comentario',{exact:true}).waitFor();await page.getByRole('button',{name:'Enviar comentario',exact:true}).waitFor();assert.equal(await input.inputValue(),'');assert.equal(instance.lab.state.data.messages.filter(m=>m.textoMensaje==='Prueba de comentario').length,1);
  await input.fill('Borrador con archivo');await page.locator('input[type=file]').setInputFiles({name:'nota.txt',mimeType:'text/plain',buffer:Buffer.from('Archivo ficticio')});await page.getByRole('button',{name:'Eliminar archivo nota.txt',exact:true}).waitFor();await page.getByRole('button',{name:'Enviar comentario',exact:true}).click();await page.getByRole('dialog',{name:'Revisa el cambio',exact:true}).getByRole('button',{name:'Cancelar',exact:true}).click();assert.equal(await input.inputValue(),'Borrador con archivo');assert.equal(failedUploads,0);await page.getByRole('button',{name:'Enviar comentario',exact:true}).waitFor();assert.equal(await page.locator('main').getByRole('alert').count(),0);
  await page.getByRole('button',{name:'Enviar comentario',exact:true}).click();await confirm();await page.getByRole('alert').filter({hasText:'Conservamos el texto y los archivos'}).waitFor();assert.equal(await input.inputValue(),'Borrador con archivo');assert.equal(failedUploads,1);await page.getByRole('button',{name:'Eliminar archivo nota.txt',exact:true}).waitFor();
  await page.screenshot({path:path.join(out,'ticket-admin-detalle.png'),fullPage:true});
  for(const width of [1024,390]){await page.setViewportSize({width,height:1100});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,'ticket-'+width+'.png'),fullPage:true});}
  await visit('/__laboratorio/entrar?usuario=7');const before=metaReads;
  const forbidden=await page.evaluate(async()=>{const token=JSON.parse(localStorage.getItem('auth-storage')).state.token;const response=await fetch('/api/platform/tickets/21/files/2',{headers:{Authorization:'Bearer '+token}});return {status:response.status,body:await response.text()};});assert.equal(forbidden.status,403);assert.equal(metaReads,before);assert.doesNotMatch(forbidden.body,/%PDF/);assert.deepEqual(errors,[]);
  console.log('TICKET_ADMIN_BROWSER_OK; codigo nulo, administración por permiso efectivo, comentario con dos confirmaciones, cancelación, borrador/adjunto conservados ante fallo, visor real con ID quoted y descarga íntegra, 403 sin leer archivo; capturas='+out);
 }catch(e){if(page){await page.screenshot({path:path.join(out,'fallo.png'),fullPage:true}).catch(()=>{});await fs.writeFile(path.join(out,'fallo.txt'),await page.locator('body').innerText()).catch(()=>{});}throw e;}
 finally{await browser?.close();await instance?.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
