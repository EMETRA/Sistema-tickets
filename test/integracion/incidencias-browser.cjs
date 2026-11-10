// Next/BFF reales y receptor de incidencias ficticio; no usa Oracle ni servidores institucionales.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {parse,getOperationAST}=require('graphql');
const {chromium}=require('playwright');
const {start}=require('../../scripts/laboratorio/iniciar.cjs');
async function run(){
  const root=path.resolve(__dirname,'../..'),dir=await fs.mkdtemp(path.join(os.tmpdir(),'tickets-incidents-browser-'));
  const out=process.env.QA_SCREENSHOT_DIR||path.join(dir,'capturas');await fs.mkdir(out,{recursive:true});
  let instance,browser,page,failCompanies=true;const errors=[],deliveries=[];
  function graphql({query}){
    const name=getOperationAST(parse(query)).selectionSet.selections[0].name.value;
    const data={funcionesPorUsuarioEmpresas:[{empresa:'97',nombre:'Empresa ficticia'}],funcionesPorUsuarioUsuarios:[{asignaUsuario:'7',usuario:'Usuario ficticio'}],funcionesPorUsuarioAplicaciones:[{aplicacion:'13',nombre:'Aplicación ficticia'}],visaNominaExportExcel:{filename:'nomina-vacia.xls',mimeType:'application/vnd.ms-excel',contentBase64:Buffer.from('Encabezados de prueba').toString('base64'),totalEmpleados:0,totalMovimientos:0}};
    if(name==='funcionesPorUsuarioEmpresas'&&failCompanies)return {errors:[{message:'ORA-00942 SELECT sueldo_privado FROM tabla_privada',extensions:{code:'INTERNAL_SERVER_ERROR'}}]};
    return Object.hasOwn(data,name)?{data:{[name]:data[name]}}:undefined;
  }
  function incident(s,body,pathname){
    const event=pathname.endsWith('/client-errors')?{referencia:body.referencia,origen:'PANEL',operacion:'Cliente.'+body.operacion,codigos:[body.codigo],ocurridoEn:new Date().toISOString()}:body;
    deliveries.push(event);
    const existing=s.resources.incidencias.find(i=>i.datos._automatico.operacion===event.operacion);
    if(existing){existing.datos._automatico.cantidad++;return {encolada:true};}
    s.resources.incidencias.push({id:randomUUID(),nombre:'Error '+event.operacion,equipoId:s.ids.it,usuarioId:1,visibilidad:'EQUIPO',estado:'ABIERTO',version:1,creadoEn:event.ocurridoEn,actualizadoEn:event.ocurridoEn,datos:{aplicacionId:s.ids.app,severidad:'ALTA',detalle:'Códigos: '+event.codigos.join(', '),referencia:event.referencia,_automatico:{cantidad:1,operacion:event.operacion,primeraVez:event.ocurridoEn,ultimaVez:event.ocurridoEn}}});return {encolada:true,referencia:event.referencia};
  }
  try{
    instance=await start({port:4025,file:path.join(dir,'estado.json'),compiled:true,graphql,incident,incidentToken:'clave-ficticia-del-emisor-panel-para-pruebas'});
    const {APPS_CATALOG_DUMMY}=require('./load-ts.cjs')(root)('src/api/graphql/home/appsCatalog.dummy.ts');
    await instance.lab.state.change(s=>{s.applicationCatalog=APPS_CATALOG_DUMMY;s.resources.incidencias=[];const app=s.resources.aplicaciones.find(a=>a.id===s.ids.app);app.nombre='Sistema Tickets · prueba';app.equipoId=s.ids.it;app.visibilidad='EQUIPO';app.datos.codigo='SISTEMA_TICKETS';});
    browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',route=>/^https?:/.test(route.request().url())&&new URL(route.request().url()).hostname!=='127.0.0.1'?route.abort():route.continue());
    for(let i=0;i<100;i++){try{if((await fetch(instance.base+'/home')).status<500)break;}catch{}await new Promise(r=>setTimeout(r,100));}
    const visit=async url=>{await page.goto(instance.base+url);await page.waitForLoadState('networkidle');};
    const waitFor=async predicate=>{for(let i=0;i<200;i++){if(predicate())return;await new Promise(r=>setTimeout(r,100));}throw Error('La incidencia no llegó al receptor de prueba');};
    await visit('/__laboratorio/entrar?usuario=1');await visit('/espacio/accesos?tab=corporate');
    const alert=page.getByRole('alert').filter({hasText:'No se pudieron cargar los catálogos'});await alert.waitFor();await alert.getByText(/Referencia:/).waitFor();assert.doesNotMatch(await alert.innerText(),/SELECT|sueldo_privado|tabla_privada/);
    await waitFor(()=>deliveries.length===1);assert.deepEqual(deliveries[0].codigos,['ORA-00942','INTERNAL_SERVER_ERROR']);
    assert.ok((await alert.innerText()).includes(deliveries[0].referencia));await page.screenshot({path:path.join(out,'catalogo-error-con-referencia.png'),fullPage:true});
    failCompanies=false;await page.getByRole('button',{name:'Reintentar catálogos',exact:true}).click();await alert.waitFor({state:'hidden'});await page.locator('#company').selectOption('97');
    await visit('/home/rrhh/formularios/mod04');for(const [id,value]of [['company','97'],['paystubType','1'],['payrollManager','2'],['paymentType','%'],['budgetUnit','%']])await page.locator('#'+id).fill(value);
    let downloads=0;page.on('download',()=>downloads++);await page.getByRole('button',{name:'Generar Reporte en Excel',exact:true}).click();await page.getByRole('alert').filter({hasText:'No se encontraron empleados'}).waitFor();assert.equal(downloads,0);assert.equal(await page.locator('#company').inputValue(),'97');assert.equal(deliveries.length,1);
    await page.screenshot({path:path.join(out,'nomina-sin-resultados.png'),fullPage:true});
    await visit('/__laboratorio/entrar?usuario=5');await visit('/espacio/sistemas');await page.getByRole('button',{name:'Incidentes de aplicaciones',exact:true}).click();await page.getByRole('button',{name:'Error MOD06/empresas',exact:true}).click();
    await page.getByRole('heading',{name:'Detectada automáticamente',exact:true}).waitFor();await page.getByRole('dialog').getByText(deliveries[0].referencia,{exact:true}).waitFor();
    await page.screenshot({path:path.join(out,'desarrollador-incidencia.png'),fullPage:true});await page.keyboard.press('Escape');
    await page.evaluate(()=>window.dispatchEvent(new ErrorEvent('error',{message:'NO_PERSISTIR_DATOS_DEL_USUARIO'})));
    await waitFor(()=>deliveries.length===2);assert.equal(deliveries[1].codigos[0],'JS_RUNTIME_ERROR');assert.doesNotMatch(JSON.stringify(deliveries),/NO_PERSISTIR|sueldo_privado|tabla_privada/);
    await visit('/__laboratorio/entrar?usuario=7');await visit('/espacio/sistemas');await page.getByRole('alert').filter({hasText:'No tienes permiso para consultar esta sección'}).waitFor();assert.equal(await page.getByText('Error MOD06/empresas',{exact:true}).count(),0);assert.deepEqual(errors,[]);
    await fs.writeFile(path.join(out,'resultado.json'),JSON.stringify({estado:'OK',erroresOracleCapturados:1,erroresRuntimeCapturados:1,excelVacioDescargado:false,desarrolladorVeIncidencia:true,usuarioSinPermisoNoLaVe:true,datos:'Ficticios en loopback'},null,2));
    console.log('INCIDENCIAS_BROWSER_OK; error de catálogo correlacionado, reintento, nómina vacía sin descarga, incidencia visible al desarrollador, aislamiento y error JS saneado; capturas='+out);
  }catch(e){if(page){await page.screenshot({path:path.join(out,'fallo.png'),fullPage:true}).catch(()=>{});await fs.writeFile(path.join(out,'fallo.txt'),await page.locator('body').innerText()).catch(()=>{});}throw e;}
  finally{await browser?.close();await instance?.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
