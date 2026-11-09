// Panel compilado y datos ficticios. Sin Oracle, SAT ni servicios institucionales.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const { start } = require('../../scripts/laboratorio/iniciar.cjs');
function samplePdf() {
  const stream='BT /F1 22 Tf 60 720 Td (Documento ficticio de prueba) Tj ET';
  const objects=['<</Type/Catalog/Pages 2 0 R>>','<</Type/Pages/Kids[3 0 R]/Count 1>>','<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>','<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',`<</Length ${Buffer.byteLength(stream)}>>\nstream\n${stream}\nendstream`];
  let pdf='%PDF-1.4\n';const offsets=[0];
  for(const [i,obj]of objects.entries()){offsets.push(Buffer.byteLength(pdf));pdf+=`${i+1} 0 obj\n${obj}\nendobj\n`;}
  const xref=Buffer.byteLength(pdf);pdf+=`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(x=>String(x).padStart(10,'0')+' 00000 n \n').join('')}trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF\n`;return Buffer.from(pdf);
}
async function run() {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'tickets-vistas-'));
  const out = process.env.QA_SCREENSHOT_DIR || path.join(temp, 'capturas');
  await fs.mkdir(out, { recursive: true });
  let instance, browser;
  try {
    instance = await start({ port: 3995, file: path.join(temp, 'estado.json'), compiled: true });
    await instance.lab.state.change(s => {
      s.events = [];
      const app = (id, title, icon, sectionId, module) => ({meta: {id, label: title, title, iconName: icon}, sections: {[sectionId]: {meta: {id: sectionId, label: 'Contenido', title: 'Módulos de ' + title, iconName: icon}, modules: [module]}}});
      s.applicationCatalog = {
        juridico: app('juridico', 'Jurídico', 'gavel-solid', 'denuncias', {id:'expedientes', label:'Expedientes', title:'Expedientes de tránsito', iconName:'file'}),
        comunicacion: app('comunicacion', 'Comunicación', 'file-lines-regular', 'contenido', {id:'noticias', label:'Noticias', title:'Noticias', iconName:'file-lines-regular'}),
        informatica: app('informatica', 'Informática', 'ticket-solid', 'equipo', {id:'mod01', label:'Reportes', title:'Reportes de actividades', iconName:'file'}),
      };
      s.tickets = Array.from({length: 13}, (_, i) => ({id:i+1, codigo:'QA-'+String(i+1).padStart(3,'0'), titulo:i===0?'No carga un adjunto':i===1?'Solicitud de soporte':i===2?'Consulta resuelta':'Solicitud de ejemplo '+(i+1), descripcion:'Al intentar adjuntar un archivo, no se completa la carga.\n\nSe conserva **el detalle de la solicitud**.', usuarioCreadorId:7, usuarioAsignadoId:i===3?null:4, estadoId:[3,2,5,1,4][i%5], categoriaId:1, prioridadId:2, tiempoEstimado:30, version:1, fechaCreacion:new Date(Date.now()-3600000-i*60000).toISOString(), fechaActualizacion:new Date().toISOString()}));
      s.tickets.push({...s.tickets[0], id:999, codigo:'PRIVADO-999', titulo:'Ticket privado de otra persona', usuarioCreadorId:3, usuarioAsignadoId:5});
      s.messages = [{ticketId:1, usuario:7, nombre_usuario:s.users[6].nombre, fechaEnvio:new Date().toISOString(), textoMensaje:'Adjunto la captura de la pantalla.', archivos:[]}, {ticketId:1, usuario:4, nombre_usuario:s.users[3].nombre, fechaEnvio:new Date().toISOString(), textoMensaje:'Estamos revisando la solicitud.', archivos:[]}];
      s.ticketHistory = [{id:'h1',ticketId:1,usuarioId:7,accion:'CREACION',valorAnterior:null,valorNuevo:'Creado',fecha:new Date().toISOString()},{id:'h2',ticketId:1,usuarioId:4,accion:'EN_TRABAJO',valorAnterior:'Asignado',valorNuevo:'En trabajo',fecha:new Date().toISOString()}];
    });
    browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
    const page = await browser.newPage({viewport:{width:1440,height:1100}});
    page.setDefaultTimeout(25000);
    const errors=[];page.on('pageerror', e=>errors.push(e.message));
    await page.route('**/*', route=>/^https?:/.test(route.request().url())&&new URL(route.request().url()).hostname!=='127.0.0.1'?route.abort():route.continue());
    let failComment=false, failFiles=false, failPreview=false; const previewCalls=[];
    await page.route('**/api/graphql', route=>{
      const raw=route.request().postData()||'';
      if(failComment && /sendTicketMessage/i.test(raw)) return route.fulfill({status:503,json:{errors:[{message:'Prueba de envío fallido'}]}});
      return route.continue();
    });
    await page.route('**/api/ticket/1/attachments', route=>route.fulfill(failFiles?{status:503,json:{error:'Prueba de archivos no disponibles'}}:{json:{ticketAttachments:['captura-ejemplo.png','documento.pdf','nota.txt','planilla.xlsx'].map((name,i)=>({id:String(i+1),ticketId:1,usuarioId:7,nombreArchivo:name,keyStorage:null,url_descarga:null,fecha:new Date().toISOString()}))}}));
    await page.route('**/api/platform/tickets/1/files/*', route=>{
      const id=new URL(route.request().url()).pathname.split('/').pop();
      assert.match(route.request().headers().authorization,/^Bearer laboratorio-/); previewCalls.push(id);
      if(failPreview)return route.fulfill({status:503,json:{message:'Archivo no disponible de prueba'}});
      const files={1:{contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZlGIAAAAASUVORK5CYII=','base64')},2:{contentType:'application/pdf',body:samplePdf()},3:{contentType:'text/plain; charset=utf-8',body:'Texto de prueba <script>window.archivoEjecutado=true</script>'},4:{contentType:'application/octet-stream',body:Buffer.from('Archivo ficticio')}};
      return route.fulfill(files[id]);
    });
    for(let i=0;i<100;i++){try{if((await fetch(instance.base+'/home')).status<500)break;}catch{}await new Promise(r=>setTimeout(r,100));}
    const visit=async url=>{await page.goto(instance.base+url);await page.waitForLoadState('networkidle');};
    await visit('/__laboratorio/entrar?usuario=7');
    await page.getByRole('heading',{name:'Tus solicitudes y aplicaciones',exact:true}).waitFor();
    await page.getByRole('button',{name:'Registraste el ticket QA-001',exact:true}).click();
    await page.getByRole('dialog').getByRole('heading',{name:'QA-001 · No carga un adjunto',exact:true}).waitFor();
    await page.getByRole('dialog').getByText('Estamos revisando la solicitud.',{exact:true}).waitFor();
    await page.screenshot({path:path.join(out,'ticket-vista-rapida.png'),fullPage:true});
    await page.getByRole('dialog').getByRole('tab',{name:'Archivos',exact:true}).click();
    await page.getByRole('dialog').getByRole('tabpanel').getByRole('button',{name:'captura-ejemplo.png',exact:true}).click();
    await page.getByRole('dialog',{name:'captura-ejemplo.png',exact:true}).getByRole('img').waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('dialog',{name:'captura-ejemplo.png',exact:true}).waitFor({state:'hidden'});
    await page.getByRole('dialog').getByRole('heading',{name:'QA-001 · No carga un adjunto',exact:true}).waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({state:'hidden'});
    await visit('/mis-tickets');
    await page.getByRole('button',{name:'Abrir ticket QA-001',exact:true}).waitFor();
    assert.equal(await page.getByText('Ticket privado de otra persona',{exact:true}).count(),0);
    assert.equal(await page.getByRole('table').getByRole('row').count(),11);
    await page.screenshot({path:path.join(out,'mis-tickets.png'),fullPage:true});
    await page.getByRole('button',{name:'Siguiente',exact:true}).click();
    await page.getByRole('button',{name:'Abrir ticket QA-013',exact:true}).waitFor();
    await page.getByLabel('Buscar tickets',{exact:true}).fill('QA-001');
    await page.getByRole('button',{name:'Abrir ticket QA-001',exact:true}).waitFor();
    assert.equal(await page.getByRole('table').getByRole('row').count(),2);
    await page.getByLabel('Buscar tickets',{exact:true}).fill('');
    await page.getByRole('button',{name:'Filtros',exact:true}).click();
    await page.getByLabel('Estado',{exact:true}).selectOption('asignado');
    assert.equal(await page.getByRole('button',{name:'Abrir ticket QA-001',exact:true}).count(),0);
    await page.getByRole('button',{name:'Limpiar filtros',exact:true}).click();
    await page.getByRole('button',{name:'Ver detalle de No carga un adjunto',exact:true}).click();
    await page.waitForURL('**/mis-tickets/1');
    await page.getByRole('heading',{name:'QA-001 · No carga un adjunto',exact:true}).waitFor();
    await page.getByText('Estamos revisando la solicitud.',{exact:true}).waitFor();
    assert.equal(await page.getByRole('heading',{name:'Gestión del ticket',exact:true}).count(),0);
    const comment=page.getByLabel('Comentario',{exact:true});
    await comment.fill('Borrador que se conserva');
    await page.getByRole('tab',{name:'Conversación',exact:true}).focus();
    await page.keyboard.press('ArrowRight');
    await page.getByRole('tab',{name:'Historial',exact:true}).waitFor();
    assert.equal(await page.getByRole('tab',{name:'Historial',exact:true}).getAttribute('aria-selected'),'true');
    await page.getByRole('columnheader',{name:'Actor',exact:true}).waitFor();
    await page.screenshot({path:path.join(out,'ticket-historial.png'),fullPage:true});
    await page.getByRole('tab',{name:'Conversación',exact:true}).click();
    assert.equal(await comment.inputValue(),'Borrador que se conserva');
    await page.screenshot({path:path.join(out,'ticket-detalle.png'),fullPage:true});
    for(const width of [1024,390]){
      await page.setViewportSize({width,height:1100});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'detalle sin desbordamiento '+width);
      await page.screenshot({path:path.join(out,'ticket-detalle-'+width+'.png'),fullPage:true});
    }
    failComment=true;
    await page.getByRole('button',{name:'Enviar comentario',exact:true}).click();
    await page.getByRole('alert').filter({hasText:'Conservamos el texto'}).waitFor();
    assert.equal(await comment.inputValue(),'Borrador que se conserva');
    failComment=false;
    await page.getByRole('button',{name:'Enviar comentario',exact:true}).click();
    await page.getByText('Borrador que se conserva',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Enviar comentario',exact:true}).waitFor();
    assert.equal(await comment.inputValue(),'');
    assert.equal(instance.lab.state.data.messages.filter(m=>m.textoMensaje==='Borrador que se conserva').length,1);
    await page.getByRole('tab',{name:'Archivos',exact:true}).click();
    await page.getByRole('tabpanel').getByRole('button',{name:'captura-ejemplo.png',exact:true}).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('dialog',{name:'captura-ejemplo.png',exact:true}).getByRole('img',{name:'captura-ejemplo.png',exact:true}).waitFor();
    await page.getByRole('button',{name:'Cerrar visor de archivos',exact:true}).click();
    for(const [name,selector]of [['documento.pdf','iframe'],['nota.txt','pre'],['planilla.xlsx','h3']]){
      await page.getByRole('tabpanel').getByRole('button',{name,exact:true}).click();
      const viewer=page.getByRole('dialog',{name,exact:true});
      await viewer.locator(selector).waitFor();
      if(name==='nota.txt'){assert.match(await viewer.locator('pre').innerText(),/<script>/);assert.equal(await page.evaluate(()=>window.archivoEjecutado),undefined);}
      if(name==='planilla.xlsx'){
        const pending=page.waitForEvent('download');await viewer.getByRole('link',{name:'Descargar archivo',exact:true}).click();assert.equal((await pending).suggestedFilename(),name);
      }
      await page.screenshot({path:path.join(out,'visor-'+name.replaceAll('.','-')+'.png'),fullPage:true});
      await viewer.getByRole('button',{name:'Cerrar visor de archivos',exact:true}).click();
    }
    failPreview=true;await page.getByRole('tabpanel').getByRole('button',{name:'nota.txt',exact:true}).click();
    await page.getByRole('dialog',{name:'nota.txt',exact:true}).getByRole('alert').waitFor();
    failPreview=false;await page.getByRole('button',{name:'Reintentar archivo',exact:true}).click();
    await page.getByRole('dialog',{name:'nota.txt',exact:true}).locator('pre').waitFor();
    await page.keyboard.press('Escape');
    assert.ok(previewCalls.length>=7);
    await page.setViewportSize({width:1440,height:1100});
    await page.reload();
    await page.getByRole('heading',{name:'QA-001 · No carga un adjunto',exact:true}).waitFor();
    await page.getByRole('button',{name:'Volver al listado de tickets',exact:true}).click();
    await page.waitForURL('**/mis-tickets');
    await page.getByRole('button',{name:'Abrir ticket QA-001',exact:true}).waitFor();
    for(const width of [1024,390]){
      await page.setViewportSize({width,height:1100});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'listado sin desbordamiento '+width);
      await page.screenshot({path:path.join(out,'mis-tickets-'+width+'.png'),fullPage:true});
    }
    await page.setViewportSize({width:1440,height:1100});
    await visit('/aplicaciones');
    await page.getByRole('heading',{name:'Aplicaciones y secciones',exact:true}).waitFor();
    assert.equal(await page.getByRole('article').count(),3);
    await page.screenshot({path:path.join(out,'aplicaciones.png'),fullPage:true});
    for(const width of [1024,390]){
      await page.setViewportSize({width,height:1100});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'aplicaciones sin desbordamiento '+width);
      await page.screenshot({path:path.join(out,'aplicaciones-'+width+'.png'),fullPage:true});
    }
    await page.getByRole('button',{name:'Ingresar a Comunicación',exact:true}).click();
    await page.waitForURL('**/home/comunicacion/contenido');
    await page.getByRole('heading',{name:'Módulos de Comunicación',exact:true}).waitFor();
    await page.getByRole('button',{name:'Ingresar a Noticias',exact:true}).waitFor();
    await page.screenshot({path:path.join(out,'aplicaciones-modulos.png'),fullPage:true});
    await visit('/mis-tickets/999');
    await page.getByRole('alert').filter({hasText:'No fue posible consultar este ticket'}).waitFor();
    assert.equal(await page.getByText('Ticket privado de otra persona',{exact:true}).count(),0);
    failFiles=true;await visit('/mis-tickets/1');
    await page.getByRole('button',{name:'Reintentar archivos',exact:true}).waitFor();
    failFiles=false;await page.getByRole('button',{name:'Reintentar archivos',exact:true}).click();
    await page.getByRole('region',{name:'Adjuntos del ticket',exact:true}).getByRole('button',{name:'captura-ejemplo.png',exact:true}).waitFor();
    assert.deepEqual(errors,[]);
    console.log('TICKETS_APLICACIONES_BROWSER_OK; búsqueda, filtros, páginas, detalle enlazable, pestañas por teclado, historial, archivos, error/reintento de comentario, aislamiento y navegación; capturas='+out);
  } finally {await browser?.close();await instance?.close();}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
