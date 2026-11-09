// Next/BFF reales, esquema generado desde Nest y servicios ficticios de loopback.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { buildSchema, parse, validate, getOperationAST, getVariableValues } = require('graphql');
const { chromium } = require('playwright');
const { start } = require('../../scripts/laboratorio/iniciar.cjs');
async function run() {
  const root = path.resolve(__dirname, '../..'), api = process.env.TICKETS_API_SOURCE || path.resolve(root, '../api-tickets');
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'tickets-modulos-'));
  const out = process.env.QA_SCREENSHOT_DIR || path.join(temp, 'capturas'); await fs.mkdir(out, {recursive:true});
  const schemaFile = path.join(temp, 'schema.gql');
  execFileSync(process.execPath, ['scripts/validar-contrato-panel.cjs', '--panel='+root, '--schema-out='+schemaFile], {cwd:api,stdio:'pipe'});
  const schema = buildSchema(await fs.readFile(schemaFile, 'utf8'));
  const calls = [], contractErrors = [], fail = new Set();
  const excel = name => ({ filename:name+'.xls',mimeType:'application/vnd.ms-excel',contentBase64:Buffer.from('Ejemplo local\tSin datos reales\n').toString('base64'),totalFilas:1,totalEmpleados:1,totalMovimientos:0 });
  const manual = {id:1,titulo:'Manual ficticio',categoria:'OTROS',categoriaEtiqueta:'Otros',nombreArchivo:'manual.pdf',orden:1,tamanoBytes:50,urlVisualizacion:'/manual.pdf',urlVisualizacionAbsoluta:null,etiquetas:[]};
  function graphql({query,variables={}}) {
    const document=parse(query), operation=getOperationAST(document), name=operation.selectionSet.selections[0]?.name?.value;
    const input=variables.input;
    const responses = {
      consultaVehiculoMuni:()=>({marca:'Marca ficticia',color:'Azul',modelo:'2020',nombrePropietario:'PROPIETARIO FICTICIO CON NOMBRE EXTENSO',nitPropietario:'00012345',direccion:'Dirección de prueba con texto largo para comprobar ajuste de líneas en dispositivos pequeños',correo:'persona@example.invalid',telefono:'00112233'}),
      visaNominaExportExcel:()=>excel('nomina-ejemplo'),
      reporteRhEstatusOpciones:()=>[{codigo:'ACTIVO',etiqueta:'Activo'},{codigo:'BAJA',etiqueta:'Baja'}],
      reporteRhCamposDisponibles:()=>[{codigo:'EMPLEADO',etiqueta:'Empleado'},{codigo:'PRIMER_NOMBRE',etiqueta:'Primer nombre'}],
      reporteRhExportExcel:()=>excel('rrhh-ejemplo'),
      funcionesPorUsuarioEmpresas:()=>[{empresa:'97',nombre:'Empresa ficticia'}],
      funcionesPorUsuarioUsuarios:()=>[{asignaUsuario:'7',usuario:'Origen de prueba'},{asignaUsuario:'8',usuario:'Destino de prueba'}],
      funcionesPorUsuarioAplicaciones:()=>[{aplicacion:'13',nombre:'Aplicación ficticia'}],
      funcionesPorUsuarioPermisos:()=>({...input,totalPermitidas:1,funciones:[{funcion:1,nombre:'Consultar',permitido:true},{funcion:2,nombre:'Registrar',permitido:false}]}),
      guardarFuncionesPorUsuario:()=>({success:true,message:'Permisos guardados correctamente',totalPermisos:input.funciones.length,bitacoraId:12}),
      copiarFuncionesPorUsuario:()=>({success:true,message:'Permisos copiados correctamente',filasInsertadas:1,bitacoraId:13}),
      reporteAnuladosTipos:()=>[{codigo:'RECIBOS_PAGO',etiqueta:'Recibos de pago'}],
      reporteAnuladosExportExcel:()=>excel('anulados-ejemplo'),
      reporteAnuladosResultados:()=>({total:0,filas:[]}),
      manualesDisponibles:()=>[manual],manual:()=>manual,
      manualesCategorias:()=>[{codigo:'OTROS',etiqueta:'Otros',total:1}],
      manualesAgrupados:()=>[{categoria:'OTROS',categoriaEtiqueta:'Otros',manuales:[manual]}],
      reporteSemanalColaboradores:()=>[{id:'1',nombre:'Colaborador ficticio'}],
      reportesSemanales:()=>[{id:'1',idColaborador:1,nombreColaborador:'Colaborador ficticio',proyecto:'Proyecto de prueba',fechaInicio:'2026-11-01',fechaFin:'2026-11-09',estadoProyecto:'ROJO',indProductividad:30}],
      reporteSemanalExportExcel:()=>excel('semanal-ejemplo'),
      ejecutarGrabacionRemisionLpr:()=>({origen:input.origen,totalProcesados:1,totalActualizados:1,totalFallidos:0,idIntegracion:'local-1',mensaje:'Proceso local finalizado',timestamp:new Date().toISOString(),idempotente:false}),
    };
    if(!responses[name])return undefined;
    const errors=validate(schema,document);
    const vars=getVariableValues(schema,operation.variableDefinitions||[],variables);
    contractErrors.push(...errors.map(e=>e.message),...(vars.errors||[]).map(e=>e.message));
    if(errors.length||vars.errors)return {errors:[{message:'Contrato inválido en prueba local'}]};
    calls.push({name,variables});
    if(fail.has(name))return {errors:[{message:'ORA-00942 SELECT dato_privado FROM tabla_interna',extensions:{code:name==='reporteRhExportExcel'?'FORBIDDEN':'INTERNAL_SERVER_ERROR'}}]};
    return {data:{[name]:responses[name]()}};
  }
  let instance,browser,page;
  try {
    instance=await start({port:4005,file:path.join(temp,'estado.json'),compiled:true,graphql});
    const { APPS_CATALOG_DUMMY } = require('./load-ts.cjs')(root)('src/api/graphql/home/appsCatalog.dummy.ts');
    await instance.lab.state.change(s => { s.applicationCatalog = APPS_CATALOG_DUMMY; });
    browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
    page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(25000);
    const errors=[],alerts=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',async d=>{alerts.push(d.message());await d.dismiss();});
    await page.route('**/*',r=>/^https?:/.test(r.request().url())&&new URL(r.request().url()).hostname!=='127.0.0.1'?r.abort():r.continue());
    for(let i=0;i<100;i++){try{if((await fetch(instance.base+'/home')).status<500)break;}catch{}await new Promise(r=>setTimeout(r,100));}
    const visit=async url=>{await page.goto(instance.base+url);await page.waitForLoadState('networkidle');};
    const download=async button=>{const result=page.waitForEvent('download');await button.click();return (await result).suggestedFilename();};
    const confirmations=async()=>{await page.getByRole('button',{name:'Confirmar revisión · 1 de 2',exact:true}).click();await page.getByLabel('He revisado la acción y quiero aplicarla.').check();await page.getByRole('button',{name:'Confirmar y aplicar · 2 de 2',exact:true}).click();};
    await visit('/__laboratorio/entrar?usuario=1');
    await visit('/home/recaudacion/consultas/consulta-vehiculos');
    await page.getByRole('button',{name:'Consultar',exact:true}).click();await page.locator('main').getByRole('alert').waitFor();assert.equal(calls.filter(c=>c.name==='consultaVehiculoMuni').length,0);
    await page.locator('#sat-uso').selectOption('P0');await page.locator('#sat-placa').fill('000QA1');
    await page.getByRole('button',{name:'Consultar',exact:true}).click();await page.getByText('Marca ficticia',{exact:true}).waitFor();
    await page.screenshot({path:path.join(out,'consulta-vehiculos.png'),fullPage:true});
    for(const width of [1024,390]){await page.setViewportSize({width,height:1100});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,'consulta-vehiculos-'+width+'.png'),fullPage:true});}
    await page.setViewportSize({width:1440,height:1100});fail.add('consultaVehiculoMuni');await page.getByRole('button',{name:'Consultar',exact:true}).click();await page.getByText(/Los parámetros se conservaron/).waitFor();assert.equal(await page.locator('#sat-placa').inputValue(),'000QA1');fail.clear();
    await visit('/home/rrhh/formularios/mod04');
    for(const [id,value]of [['company','97'],['paystubType','1'],['payrollManager','2'],['paymentType','1'],['budgetUnit','12%']])await page.locator('#'+id).fill(value);
    fail.add('visaNominaExportExcel');await page.getByRole('button',{name:'Generar Reporte en Excel',exact:true}).click();await page.locator('main').getByRole('alert').waitFor();assert.doesNotMatch(await page.locator('main').innerText(),/ORA-|SELECT|tabla_interna/);assert.equal(await page.locator('#budgetUnit').inputValue(),'12%');fail.clear();
    assert.equal(await download(page.getByRole('button',{name:'Generar Reporte en Excel',exact:true})),'nomina-ejemplo.xls');
    await visit('/home/rrhh/formularios/mod05');await page.locator('#status').selectOption('ACTIVO');await page.locator('#startDate').fill('2026-11-01');await page.locator('#endDate').fill('2026-11-09');await page.getByText('Empleado',{exact:true}).click();assert.equal(await page.getByLabel('Empleado',{exact:true}).isChecked(),true);
    await page.screenshot({path:path.join(out,'rrhh.png'),fullPage:true});
    assert.equal(await download(page.getByRole('button',{name:'Generar Excel',exact:true})),'rrhh-ejemplo.xls');
    await visit('/home/rrhh/formularios/mod05');await page.locator('#status').selectOption('ACTIVO');await page.getByText('Empleado',{exact:true}).click();assert.equal(await page.getByLabel('Empleado',{exact:true}).isChecked(),true);fail.add('reporteRhExportExcel');await page.getByRole('button',{name:'Generar Excel',exact:true}).click();await page.getByText('No tienes permisos para realizar esta operación.',{exact:true}).waitFor();assert.equal(await page.locator('#status').inputValue(),'ACTIVO');fail.clear();
    await visit('/home/informatica/permisos/mod06');await page.locator('#company').selectOption('97');await page.locator('#generalUser').selectOption('8');await page.locator('#application').selectOption('13');await page.getByRole('button',{name:'Consultar permisos',exact:true}).click();await page.getByLabel('Registrar',{exact:true}).check();
    await page.screenshot({path:path.join(out,'permisos.png'),fullPage:true});
    await page.getByRole('button',{name:'Guardar permisos',exact:true}).click();await page.getByRole('dialog',{name:'Revisa el cambio'}).waitFor();assert.equal(calls.filter(c=>c.name==='guardarFuncionesPorUsuario').length,0);await confirmations();await page.getByText('Permisos guardados correctamente',{exact:true}).waitFor();assert.deepEqual(calls.find(c=>c.name==='guardarFuncionesPorUsuario').variables.input.funciones,[1,2]);
    await page.locator('#userOrigin').selectOption('7');await page.locator('#userDestiny').selectOption('8');await page.getByLabel('Confirmo copiar los permisos',{exact:false}).check();await page.getByRole('button',{name:'Copiar permisos',exact:true}).click();assert.equal(calls.filter(c=>c.name==='copiarFuncionesPorUsuario').length,0);await confirmations();await page.getByText('Permisos copiados correctamente',{exact:true}).waitFor();assert.equal(calls.filter(c=>c.name==='copiarFuncionesPorUsuario').length,1);
    await visit('/home/financiero/formularios/mod08');await page.locator('#startDate').fill('2026-11-01');await page.locator('#endDate').fill('2026-11-09');await page.locator('#reportType').selectOption('RECIBOS_PAGO');assert.equal(await download(page.getByRole('button',{name:'Generar Reporte en Excel',exact:true})),'anulados-ejemplo.xls');
    await visit('/home/informatica/reportes/exportmod01');await page.getByText('Proyecto de prueba',{exact:true}).waitFor();assert.equal(await download(page.getByRole('button',{name:'Descargar Excel del reporte 1',exact:true})),'semanal-ejemplo.xls');
    for(const [route,field]of [['/api/MOD07/manual?id=1','id'],['/api/MOD07/manualesDisponibles','length'],['/api/MOD08/reporteAnuladosTipos','length']]){const data=await page.evaluate(async url=>{const r=await fetch(url,{headers:{Authorization:'Bearer '+JSON.parse(localStorage.getItem('auth-storage')).state.token}});return r.json();},route);assert.equal(data.data[field],1);}
    await visit('/home/informatica/reportes/save-mod01');await page.getByText('No hay un reporte guardado en esta sesión',{exact:true}).waitFor();assert.equal(await page.getByText('Reporte guardado correctamente',{exact:true}).count(),0);
    await visit('/home/recaudacion/proyectos/mod13');await page.getByText(/Esta consulta todavía no está disponible/).waitFor();assert.equal(await page.getByText('Conexión Oracle OK',{exact:true}).count(),0);
    assert.deepEqual(contractErrors,[]);assert.deepEqual(errors,[]);assert.deepEqual(alerts,[]);
    await fs.writeFile(path.join(out,'resultado.json'),JSON.stringify({estado:'OK',contratos:'Esquema real de Nest; servicios y datos ficticios',operaciones:[...new Set(calls.map(c=>c.name))],erroresReact:errors,erroresContrato:contractErrors},null,2));
    console.log('MODULOS_BROWSER_OK; SAT, nóminas, RRHH, permisos con dos confirmaciones, Excel, manuales, errores saneados y datos conservados; capturas='+out);
  } catch(e) {if(page){await page.screenshot({path:path.join(out,'fallo.png'),fullPage:true}).catch(()=>{});await fs.writeFile(path.join(out,'fallo.txt'),await page.locator('body').innerText()).catch(()=>{});}throw e;}
  finally {await browser?.close();await instance?.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
