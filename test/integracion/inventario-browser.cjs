// Build real de Next y datos ficticios; sin Oracle ni servicios institucionales.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');const os=require('node:os');const path=require('node:path');
const {chromium}=require('playwright');const {start}=require('../../scripts/laboratorio/iniciar.cjs');
async function run(){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'tickets-navegacion-'));let instance,browser,page;
 const errors=[],inventory=[],writes=[];let previews=0,fail=false;
 try{
  instance=await start({port:4025,file:path.join(dir,'estado.json'),compiled:true});
  browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(r.method()==='POST'&&new URL(r.url()).pathname==='/api/platform/records/dispositivos')writes.push(r.postDataJSON());});
  await page.route('**/*',r=>/^https?:/.test(r.request().url())&&new URL(r.request().url()).hostname!=='127.0.0.1'?r.abort():r.continue());
  await page.route('**/api/platform/inventory/**',r=>{
   const u=new URL(r.request().url());assert.match(r.request().headers().authorization,/^Bearer laboratorio-/);inventory.push(u);
   if(fail){fail=false;return r.fulfill({status:503,json:{message:'No se pudo consultar Activos Fijos',referencia:'prueba-navegacion'}});}
   const source={referencia:'97:97:123:456',numeroInventario:'456',tarjeta:'1782',empleado:9000001,nombreEmpleado:'Empleado de prueba',descripcion:'Switch del inventario ficticio',serie:'SERIE-FICTICIA',modelo:'Modelo ficticio',entrada:123,fichaCompleta:true,fichaId:null};
   if(u.searchParams.get('q')==='inexistente')return r.fulfill({json:{items:[],hayMas:false}});
   const next=Number(u.searchParams.get('offset')||0)>0;
   return r.fulfill({json:{items:next?[{...source,numeroInventario:'789'}]:[source,{...source,numeroInventario:'457',fichaCompleta:false}],hayMas:!next}});
  });
  await page.route('**/api/platform/organization/people',async r=>{const response=await r.fetch(),d=await response.json();d.personal.push({empresa:97,empleado:9000999,nombre:'Empleado ficticio sin cuenta',puesto:'Analista',unidadCodigo:1,unidad:null,sinUnidad:true,cuentasHabilitadas:0,usuariosIds:[]});await r.fulfill({response,json:d});});
  await page.route('**/api/platform/organization/preview',r=>{previews++;return r.fulfill({json:{huella:'a'.repeat(64),empresa:97,sinUsuario:1,sinUnidad:1,cuentaActualVinculada:true,unidades:[],cambios:[],personal:[]}});});
  // Etiquetas que devuelve el adaptador real (su autorización se cubre en pruebas Nest).
  await page.route('**/api/platform/records/**',async r=>{
   if(r.request().method()!=='GET')return r.continue();const response=await r.fetch();if(!response.ok())return r.fulfill({response});const d=await response.json();
   for(const item of d.items||[]){item.labels=item.labels||{};for(const [field,type]of Object.entries({instalacionId:'instalaciones',activoId:'activos',origenId:'dispositivos',destinoId:'dispositivos'})){const related=instance.lab.state.data.resources[type]?.find(x=>x.id===item.datos[field]);if(related)item.labels[field]=related.nombre;}}
   return r.fulfill({response,json:d});
  });
  await page.route('**/api/usuario/*',r=>r.fulfill({json:{usuario:{id:1,nombre:'Colaborador ficticio',email:'prueba@example.invalid',rol:'Usuario',departamento:'Informática'}}}));
  await page.route('**/api/tickets/usuario/*',r=>r.fulfill({json:{tickets:[]}}));
  const visit=async url=>{await page.goto(instance.base+url);await page.waitForLoadState('networkidle');};
  const confirm=async()=>{await page.getByRole('dialog',{name:'Revisa el cambio',exact:true}).waitFor();assert.equal(writes.length,0);await page.getByRole('button',{name:'Confirmar revisión · 1 de 2'}).click();await page.getByRole('dialog',{name:'Confirma y aplica',exact:true}).waitFor();await page.getByLabel('He revisado la acción y quiero aplicarla.',{exact:true}).check();await page.getByRole('button',{name:'Confirmar y aplicar · 2 de 2'}).click();};
  await visit('/__laboratorio/entrar?usuario=1');await visit('/espacio/inventario');
  let catalog=page.getByRole('region',{name:'Inventario institucional',exact:true});await catalog.getByText('Switch del inventario ficticio').first().waitFor();
  assert.equal(inventory[0].search,'?offset=0');assert.equal(await page.getByRole('navigation',{name:'Origen de los bienes'}).count(),0);
  assert.equal(await page.getByRole('link',{name:'Equipo',exact:true}).count(),0);
  await catalog.getByRole('button',{name:'Bienes siguientes'}).click();await catalog.getByText('789',{exact:true}).waitFor();
  await catalog.getByLabel('Descripción o serie',{exact:true}).fill('inexistente');await catalog.getByRole('button',{name:'Consultar bienes'}).click();await catalog.getByText(/No se encontraron bienes/).waitFor();
  assert.equal(inventory.at(-1).searchParams.has('empleado'),false,'no serializa controles vacíos');
  await catalog.getByLabel('Descripción o serie',{exact:true}).fill('');fail=true;await catalog.getByRole('button',{name:'Consultar bienes'}).click();await catalog.getByRole('alert').filter({hasText:'prueba-navegacion'}).waitFor();await catalog.getByRole('button',{name:'Actualizar bienes'}).click();
  await catalog.getByRole('button',{name:'Crear ficha técnica 456',exact:true}).click();let dialog=page.getByRole('dialog');await dialog.getByText(/Vinculado al bien institucional/).waitFor();assert.equal(await dialog.locator('form form').count(),0);await dialog.getByRole('button',{name:'Cerrar',exact:true}).click();
  await page.getByRole('button',{name:'Fichas técnicas',exact:true}).click();await page.waitForURL(/view=fichas/);await page.getByRole('columnheader',{name:'Responsable técnico',exact:true}).waitFor();
  await page.getByRole('button',{name:'Registrar ficha técnica',exact:true}).click();dialog=page.getByRole('dialog');assert.equal(await dialog.getByRole('region',{name:'Inventario institucional',exact:true}).count(),0);await dialog.getByRole('button',{name:'Buscar un bien en Activos Fijos'}).click();await dialog.getByRole('button',{name:'Consultar bienes'}).click();await dialog.getByRole('button',{name:'Crear ficha técnica 456',exact:true}).waitFor();assert.equal(await dialog.locator('form form').count(),0);await dialog.getByRole('button',{name:'Cerrar',exact:true}).click();
  await visit('/espacio/organizacion');await page.getByText('Empleado ficticio sin cuenta',{exact:true}).waitFor();assert.equal(previews,0,'consultar personal no prepara una sincronización');
  await page.getByRole('row').filter({hasText:'Empleado ficticio sin cuenta'}).getByRole('link',{name:'Ver bienes',exact:true}).click();await page.waitForURL(/empleado=9000999/);catalog=page.getByRole('region',{name:'Inventario institucional',exact:true});await catalog.getByText('Switch del inventario ficticio').first().waitFor();assert.equal(inventory.at(-1).searchParams.get('empleado'),'9000999');await page.getByRole('link',{name:'Ver inventario completo'}).click();await page.waitForURL(/view=inventario$/);
  await visit('/equipo');await page.waitForURL(/espacio\/organizacion\?view=personas/);await page.getByText('Empleado ficticio sin cuenta',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Equipos de trabajo',exact:true}).click();await page.getByText('Sincronizar equipos desde RRHH',{exact:true}).waitFor();assert.equal(previews,0);await page.getByRole('button',{name:'Informática · ficticio',exact:true}).click();dialog=page.getByRole('dialog');assert.equal(await dialog.getByRole('region',{name:'Inventario institucional',exact:true}).count(),0);await dialog.getByRole('link',{name:'Ver bienes asignados en el inventario'}).click();await page.waitForURL(/equipoId=/);catalog=page.getByRole('region',{name:'Inventario institucional',exact:true});await catalog.getByText('Switch del inventario ficticio').first().waitFor();assert.equal(inventory.at(-1).searchParams.get('equipoId'),instance.lab.state.data.ids.it);
  await visit('/espacio/organizacion?view=responsabilidades');await page.getByLabel('Equipo de trabajo',{exact:true}).selectOption(instance.lab.state.data.ids.it);await page.getByRole('button',{name:'Registrar responsabilidad',exact:true}).click();dialog=page.getByRole('dialog');assert.equal(await dialog.getByLabel('Equipo de trabajo',{exact:true}).inputValue(),instance.lab.state.data.ids.it);await dialog.getByRole('button',{name:'Cerrar',exact:true}).click();
  await visit('/espacio/red');await page.getByRole('columnheader',{name:'Puertos',exact:true}).waitFor();assert.equal(await page.getByRole('navigation',{name:'Origen de los bienes'}).count(),0);await page.getByRole('link',{name:'Administrar ubicaciones'}).click();await page.waitForURL(/view=ubicaciones/);await page.getByRole('heading',{name:'Ubicaciones',exact:true}).waitFor();await page.goBack();await page.getByRole('columnheader',{name:'Puertos',exact:true}).waitFor();
  await page.getByRole('button',{name:'Vincular bien de Activos Fijos'}).click();await page.getByRole('heading',{name:'Vincular un bien a la red'}).waitFor();await page.getByRole('button',{name:'Crear ficha técnica 456',exact:true}).click();dialog=page.getByRole('dialog').last();await dialog.getByLabel(/^Instalación/).selectOption(instance.lab.state.data.ids.sitio);await dialog.getByLabel(/^Cantidad de puertos/).fill('8');await dialog.getByRole('button',{name:'Guardar',exact:true}).click();await confirm();await page.getByRole('dialog',{name:'Vincular un bien a la red',exact:true}).waitFor({state:'hidden'});await page.getByRole('row').filter({hasText:'Switch del inventario ficticio'}).waitFor();assert.equal(writes.length,1);assert.equal(await page.getByRole('dialog').count(),0);
  await page.screenshot({path:path.join(dir,'red-dispositivos.png'),fullPage:true});
  await page.getByRole('button',{name:'Conexiones',exact:true}).click();await page.getByRole('columnheader',{name:'Origen',exact:true}).waitFor();await page.getByRole('button',{name:'Registrar conexión',exact:true}).click();dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'Cerrar',exact:true}).click();
  await page.getByRole('button',{name:'Mapa de red',exact:true}).click();await page.getByLabel('Ubicación / nivel',{exact:true}).selectOption(instance.lab.state.data.ids.sitio);await page.getByText(/dispositivos ·/).waitFor();await page.screenshot({path:path.join(dir,'mapa-red.png'),fullPage:true});
  await visit('/equipo/1');await page.getByRole('button',{name:'Bienes asignados',exact:true}).click();catalog=page.getByRole('region',{name:'Inventario institucional',exact:true});await catalog.getByText('Switch del inventario ficticio').first().waitFor();assert.equal(inventory.at(-1).searchParams.get('usuarioId'),'1');
  await visit('/espacio/organizacion');await page.setViewportSize({width:390,height:844});await page.getByText('Empleado ficticio sin cuenta',{exact:true}).waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(dir,'personal-movil.png'),fullPage:true});
  assert.deepEqual(errors,[]);console.log('NAVEGACION_INVENTARIO_BROWSER_OK; personal, equipos, bienes, fichas, ubicaciones, dispositivo, conexiones, mapa, confirmaciones y móvil; capturas='+dir);
 }catch(e){if(page){await page.screenshot({path:path.join(dir,'fallo.png'),fullPage:true}).catch(()=>{});await fs.writeFile(path.join(dir,'fallo.txt'),await page.locator('body').innerText()).catch(()=>{});}console.error('Diagnóstico: '+dir);throw e;}
 finally{await browser?.close();await instance?.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
