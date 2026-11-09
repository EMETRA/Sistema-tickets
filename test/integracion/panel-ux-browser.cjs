// UI real con Tickets controlado. Sin Oracle, cuentas reales o publicaciones.
const assert=require('node:assert/strict');
const http=require('node:http');
const {once}=require('node:events');
const {spawn}=require('node:child_process');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require('playwright');
async function run(){
 const user={id_usuario:'12',nombre:'Usuario QA controlado',rol:'USUARIO',email:'qa@example.invalid',permisos:['VIVI_NOTICIAS_LEER','VIVI_NOTICIAS_EDITAR','VIVI_NOTICIAS_PUBLICAR'],departamento:'Prueba'};
 let newsFail=true;
 const calls=[];
 const news=Array.from({length:23},(_,i)=>({id:i+21,titulo:i===0?'Movilidad durante las actividades de la ciudad':`Aviso de tránsito ${i+1}`,slug:`aviso-${i}`,idioma:'es-GT',estado:i%2?'publicada':'borrador',visibilidad:'publica',autores:[{id:4,nombre:'Comunicación QA'}],fecha_publicacion:'2026-10-29T15:00:00Z',notificacionPush:{estado:'PENDIENTE'}}));
 const backend=http.createServer(async(req,res)=>{
  let body='';for await(const chunk of req)body+=chunk;
  const data=(req.headers['content-type']||'').includes('application/json')&&body?JSON.parse(body):{};
  const q=data.query||'';
  calls.push({path:req.url,method:req.method,query:q,variables:data.variables,body,auth:req.headers.authorization});
  const json=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
  if(q.includes('mutation GuardarNoticia'))return json({data:{guardarNoticiaCms:{resultado:'guardada',idempotente:false,noticia:{id:90,slug:'qa',idioma:'es-GT',estado:'borrador',visibilidad:'publica',fechaPublicacion:null},publicacion:null}}});
  if(q.includes('query GetUser')||q.includes('query PermisosNoticias'))return json({data:{usuario:user}});
  if(q.includes('query GetMyActivity'))return json({data:{myActivity:[{tipo:'Consulta',descripcion:'Actividad de prueba controlada',fecha:'2026-10-29T18:00:00Z'}]}});
  if(q.includes('query GetMyStats'))return json({data:{myStats:{tickets:{ingresados:2,resueltos:1,cerrados:0},vacaciones:{dias_disponibles:0,dias_usados:0},zonas_a_cargo:[],grafico_mensual:[{mes:'2026-10',tickets:2}]}}});
  const url=new URL(req.url,'http://control.invalid');
  if(url.pathname==='/news'){
   if(newsFail)return json({message:'Error controlado sin detalles internos'},503);
   let items=news.filter(n=>!url.searchParams.get('estado')||n.estado===url.searchParams.get('estado'));
   if(url.searchParams.get('q'))items=items.filter(n=>n.titulo.toLowerCase().includes(url.searchParams.get('q').toLowerCase()));
   const total=items.length,offset=(Number(url.searchParams.get('page')||1)-1)*20;
   return json({items:items.slice(offset,offset+20),total});
  }
  if(url.pathname==='/resources') {const names=[...body.matchAll(/filename="([^"]+)"/g)].map(m=>m[1]);return json(names.map((name,i)=>({id:100+i,tipo:'imagen',url:`/uploads/noticias/${name}`,tipo_mime:'image/png'})));}
  if(url.pathname==='/taxonomy/categories')return json([{id:1,nombre:'Movilidad',slug:'movilidad',padre:null},{id:2,nombre:'Desvíos',slug:'desvios',padre:{id:1}}]);
  if(url.pathname==='/taxonomy/tags')return json([]);
  if(url.pathname==='/authors')return json([{id:4,nombre:user.nombre}]);
  return json({data:{}});
 });
 backend.listen(3852,'127.0.0.1');await once(backend,'listening');
 const next=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3851','-H','127.0.0.1'],{env:{...process.env,GRAPHQL_ENDPOINT:'http://127.0.0.1:3852/graphql',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
 let output='';next.stdout.on('data',b=>output+=b);next.stderr.on('data',b=>output+=b);
 let browser,page; const browserErrors=[];
 try{
  for(let i=0;!output.includes('Ready in')&&i<200;i++){if(next.exitCode!==null)throw new Error(output);await new Promise(r=>setTimeout(r,100));}
  assert.ok(output.includes('Ready in'));
  browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1600,height:1050}});page=await context.newPage();page.on('console',msg=>{if(msg.type()==='error')browserErrors.push(msg.text());});page.on('pageerror',err=>browserErrors.push(err.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.goto('http://127.0.0.1:3851/login');
  await context.addCookies([{name:'auth_token',value:'qa-token-controlado',url:'http://127.0.0.1:3851'},{name:'auth_role',value:'USUARIO',url:'http://127.0.0.1:3851'}]);
  await page.evaluate(user=>localStorage.setItem('auth-storage',JSON.stringify({state:{token:'qa-token-controlado',user,userId:user.id_usuario},version:0})),user);
  const out=process.env.QA_SCREENSHOT_DIR||'/workspace/artifacts/panel-inicio-noticias';await fs.mkdir(out,{recursive:true});
  const fits=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'La página no debe desbordar horizontalmente');
  await page.goto('http://127.0.0.1:3851/home');await page.getByText('Actividad de prueba controlada',{exact:true}).waitFor();
  await page.getByRole('heading',{name:'Hola, Usuario'}).waitFor();
  for(const width of [1920,1440,1024,768,390]){await page.setViewportSize({width,height:1050});await fits();}
  await page.setViewportSize({width:1600,height:1050});await page.locator('main').evaluate(el=>{el.scrollTop=0});await page.waitForLoadState('networkidle');await page.screenshot({path:path.join(out,'inicio-escritorio.png')});
  const newsUrl='http://127.0.0.1:3851/home/comunicacion/contenido/noticias';await page.goto(newsUrl);
  await page.getByRole('button',{name:'Reintentar noticias'}).waitFor();
  assert.equal(await page.getByText('No hay noticias que coincidan con el filtro.',{exact:true}).count(),0);
  assert.equal(await page.getByText('Aún no hay noticias',{exact:true}).count(),0);
  newsFail=false;await page.getByRole('button',{name:'Reintentar noticias'}).click();
  await page.getByText(news[0].titulo,{exact:true}).waitFor();
  await page.getByText('Página 1 de 2 · 23 noticias',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Siguiente',exact:true}).click();await page.getByText('Página 2 de 2 · 23 noticias',{exact:true}).waitFor();await page.getByText(news[20].titulo,{exact:true}).waitFor();
  await page.getByRole('button',{name:'Publicadas',exact:true}).click();await page.getByText('11 noticias en el filtro actual',{exact:true}).waitFor();
  await page.getByPlaceholder('Buscar noticia').fill('sinresultados');await page.getByText('No hay noticias que coincidan con el filtro.',{exact:true}).waitFor();
  assert.equal(await page.getByPlaceholder('Buscar noticia').isVisible(),true);
  await page.getByRole('button',{name:'Limpiar filtros'}).click();await page.getByText(news[0].titulo,{exact:true}).waitFor();
  for(const width of [1920,1440,1024,768,390]){await page.setViewportSize({width,height:1050});await fits();}
  await page.setViewportSize({width:1600,height:1050});await page.locator('main').evaluate(el=>{el.scrollTop=0});await page.waitForLoadState('networkidle');await page.screenshot({path:path.join(out,'noticias-escritorio.png')});
  await page.getByRole('button',{name:'Crear noticia',exact:true}).click();await page.locator('#noticia-titulo').fill('Borrador local de prueba');
  await page.getByRole('heading',{name:'Imagen o video principal',exact:true}).waitFor();
  for(const width of [1600,1024,768,390]){await page.setViewportSize({width,height:1050});await fits();assert.equal(await page.locator('#noticia-titulo').inputValue(),'Borrador local de prueba');}
  await page.setViewportSize({width:1600,height:1050});await page.locator('main').evaluate(el=>{el.scrollTop=0});await page.screenshot({path:path.join(out,'noticias-formulario.png')});
  assert.ok(!calls.some(c=>/^\s*mutation\b/.test(c.query)),'El recorrido de UX no publica ni guarda');
  assert.ok(calls.filter(c=>c.path.startsWith('/news')).every(c=>c.auth==='Bearer qa-token-controlado'));
  await page.locator('#noticia-autor').fill(user.nombre);
  const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a4uUAAAAASUVORK5CYII=','base64');
  const mainSection=page.locator('section').filter({has:page.getByRole('heading',{name:'Imagen o video principal',exact:true})});
  await mainSection.locator('input[type=file]').setInputFiles({name:'portada.png',mimeType:'image/png',buffer:image});
  await page.locator('input[type=file]').first().setInputFiles({name:'seccion.png',mimeType:'image/png',buffer:image});
  await page.getByLabel('Encabezado',{exact:false}).first().fill('Sección de prueba');
  await page.getByLabel('Contenido',{exact:false}).first().fill('Texto controlado de la sección');
  await page.getByRole('button',{name:'Guardar borrador',exact:true}).click();
  await page.getByRole('button',{name:'Confirmar',exact:true}).click();
  await page.getByRole('button',{name:'Ver listado de noticias',exact:true}).waitFor();
  const saved=calls.find(c=>c.query.includes('mutation GuardarNoticia'));
  assert.ok(saved,'El borrador simulado llega a Tickets');
  assert.equal(saved.variables.input.secciones[0].recursoId,100);
  assert.equal(saved.variables.input.recursoPrincipalId,101);
  assert.equal(calls.filter(c=>c.path==='/resources').length,1,'Ambas fotos van en un solo lote confirmado');
  console.log('OK | Inicio y Noticias: escritorio/tablet/móvil, error sin falso vacío, reintento, paginación, filtros/búsqueda, formulario conserva edición y confirma portada + foto de sección con IDs distintos en un borrador simulado.');
 }catch(e){if(page)console.error('UX_CONTROLADO',await page.locator('body').innerText());console.error('ERRORES_CONTROLADOS',browserErrors);console.error('LLAMADAS_CONTROLADAS',calls.map(c=>({path:c.path,method:c.method,query:c.query.slice(0,90)})));throw e;}
 finally{if(browser)await browser.close();next.kill('SIGTERM');backend.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
