// Navegador real, build Next y datos ficticios; no accede a Oracle ni envía datos institucionales.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const {chromium}=require('playwright');
const {start}=require('../../scripts/laboratorio/iniciar.cjs');
async function run(){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'tickets-inventario-'));
 let instance,browser,page;const errors=[],calls=[];let fail=false;
 try{
  instance=await start({port:4025,file:path.join(dir,'estado.json'),compiled:true});
  browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(20000);
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>/^https?:/.test(r.request().url())&&new URL(r.request().url()).hostname!=='127.0.0.1'?r.abort():r.continue());
  await page.route('**/api/platform/inventory/**',route=>{
   const url=new URL(route.request().url());assert.match(route.request().headers().authorization,/^Bearer laboratorio-/);calls.push(url);
   if(fail){fail=false;return route.fulfill({status:503,json:{message:'No se pudo consultar Activos Fijos',referencia:'prueba-inventario'}});}
   if(url.searchParams.get('q')==='inexistente')return route.fulfill({json:{items:[],hayMas:false}});
   if(url.searchParams.get('usuarioId')==='2')return route.fulfill({status:403,json:{message:'No tienes permiso para consultar estos bienes'}});
   const first={referencia:'97:97:123:456',numeroInventario:'456',tarjeta:'1782',empleado:9000001,nombreEmpleado:'Empleado de prueba',descripcion:'Switch de laboratorio',serie:'SERIE-FICTICIA',modelo:'Modelo ficticio',entrada:123,fichaCompleta:true,fichaId:null};
   const next=Number(url.searchParams.get('offset')||0)>0;
   return route.fulfill({json:{items:next?[{...first,numeroInventario:'789',referencia:'97:97:123:789'}]:[first,{...first,numeroInventario:'457',referencia:'97:97:123:457',fichaCompleta:false}],hayMas:!next}});
  });
  await page.route('**/api/platform/organization/preview',route=>route.fulfill({json:{huella:'a'.repeat(64),empresa:97,sinUsuario:1,sinUnidad:1,cuentaActualVinculada:true,unidades:[],cambios:[],personal:[{empresa:97,empleado:9000001,nombre:'Personal ficticio sin cuenta',puesto:'Analista',unidadCodigo:1,unidad:null,sinUnidad:true,cuentasHabilitadas:0}]}}));
  await page.route('**/api/usuario/*',route=>route.fulfill({json:{usuario:{id:1,nombre:'Colaborador ficticio',email:'prueba@example.invalid',rol:'Usuario',departamento:'Informática'}}}));
  await page.route('**/api/tickets/usuario/*',route=>route.fulfill({json:{tickets:[]}}));
  const visit=async route=>{await page.goto(instance.base+route);await page.waitForLoadState('networkidle');};
  await visit('/__laboratorio/entrar?usuario=1');
  await visit('/espacio/inventario');
  let source=page.getByRole('region',{name:'Inventario institucional',exact:true});
  await source.getByText('Switch de laboratorio').first().waitFor();
  assert.equal(calls.at(-1).searchParams.get('empleado'),null,'carga al abrir sin pedir un código');
  await source.getByRole('button',{name:'Preparar ficha 456',exact:true}).waitFor();
  assert.equal(await source.getByRole('button',{name:'Preparar ficha 457',exact:true}).count(),0);
  await source.getByRole('button',{name:'Bienes siguientes',exact:true}).click();
  await source.getByText('789',{exact:true}).waitFor();assert.equal(calls.at(-1).searchParams.get('offset'),'50');
  await source.getByLabel('Descripción o serie',{exact:true}).fill('inexistente');
  await source.getByRole('button',{name:'Consultar bienes',exact:true}).click();
  await source.getByText(/No se encontraron bienes vigentes/).waitFor();
  assert.equal(calls.at(-1).searchParams.get('offset'),'0');
  await source.getByLabel('Descripción o serie',{exact:true}).fill('');
  fail=true;await source.getByRole('button',{name:'Consultar bienes',exact:true}).click();
  await source.getByRole('alert').filter({hasText:'prueba-inventario'}).waitFor();
  await source.getByRole('button',{name:'Actualizar bienes',exact:true}).click();
  await source.getByRole('button',{name:'Preparar ficha 456',exact:true}).click();
  let dialog=page.getByRole('dialog');await dialog.waitFor();
  assert.equal(await dialog.locator('form form').count(),0);
  await dialog.getByText(/Vinculado al bien institucional/).waitFor();
  await dialog.getByRole('button',{name:'Cerrar',exact:true}).click();
  // El formulario manual también permite consultar sin anidar formularios ni guardar por accidente.
  await page.getByRole('button',{name:'Fichas técnicas en Tickets',exact:true}).click();
  await page.getByRole('button',{name:/Registrar equipo/i}).click();
  dialog=page.getByRole('dialog');await dialog.getByRole('region',{name:'Inventario institucional',exact:true}).waitFor();
  assert.equal(await dialog.locator('form form').count(),0);
  await dialog.getByRole('button',{name:'Consultar bienes',exact:true}).click();
  await dialog.getByRole('button',{name:'Preparar ficha 456',exact:true}).waitFor();
  await dialog.getByRole('button',{name:'Cerrar',exact:true}).click();
  await visit('/espacio/red');
  await page.getByRole('button',{name:'Activos Fijos',exact:true}).click();
  source=page.getByRole('region',{name:'Inventario institucional',exact:true});
  await source.getByText('Switch de laboratorio').first().waitFor();assert.equal(calls.at(-1).pathname,'/api/platform/inventory/dispositivos');
  await page.screenshot({path:path.join(dir,'cableado.png'),fullPage:true});
  await visit('/equipo/1');
  await page.getByRole('button',{name:'Mantenimiento',exact:true}).click();
  source=page.getByRole('region',{name:'Inventario institucional',exact:true});
  await source.getByText('Switch de laboratorio').first().waitFor();assert.equal(calls.at(-1).searchParams.get('usuarioId'),'1');
  assert.equal(await source.getByRole('button',{name:'Preparar ficha 456',exact:true}).count(),0);
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(dir,'perfil-movil.png'),fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false,'la tabla desplaza dentro de su panel');
  await visit('/equipo/2');await page.getByRole('button',{name:'Mantenimiento',exact:true}).click();
  source=page.getByRole('region',{name:'Inventario institucional',exact:true});
  await source.getByRole('alert').filter({hasText:'No tienes permiso'}).waitFor();
  assert.equal(await source.getByRole('button',{name:'Consultar bienes',exact:true}).count(),0);
  await page.setViewportSize({width:1440,height:1100});
  await visit('/espacio/organizacion');
  await page.getByRole('button',{name:'Ver ficha',exact:true}).first().click();
  dialog=page.getByRole('dialog');
  source=dialog.getByRole('region',{name:'Inventario institucional',exact:true});
  await source.getByText('Switch de laboratorio').first().waitFor();
  assert.equal(calls.at(-1).searchParams.get('equipoId'),instance.lab.state.data.ids.it);
  await dialog.getByRole('button',{name:'Cerrar',exact:true}).click();
  await page.getByRole('button',{name:'Preparar desde RRHH',exact:true}).click();
  await page.getByRole('button',{name:'Ver bienes de 9000001',exact:true}).click();
  source=page.getByRole('region',{name:'Inventario institucional',exact:true});
  await source.getByText('Switch de laboratorio').first().waitFor();
  assert.equal(calls.at(-1).searchParams.get('empleado'),'9000001');
  await page.screenshot({path:path.join(dir,'personal-sin-cuenta.png'),fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('INVENTARIO_BROWSER_OK; carga automática, filtros, paginación, reintento, preparación, formularios, red, perfil, móvil y denegación; capturas='+dir);
 }catch(e){if(page){await page.screenshot({path:path.join(dir,'fallo.png'),fullPage:true}).catch(()=>{});await fs.writeFile(path.join(dir,'fallo.txt'),await page.locator('body').innerText()).catch(()=>{});}console.error('Diagnóstico navegador: '+dir);throw e;}
 finally{await browser?.close();await instance?.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
