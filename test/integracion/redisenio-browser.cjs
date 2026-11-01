// Recorridos reales de Next con límites HTTP sustituidos. Sin Oracle ni envíos reales.
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const {once}=require('node:events');
const {spawn,execFileSync}=require('node:child_process');
const {chromium}=require('playwright');

async function run(){
 const root=path.resolve(__dirname,'../..');
 const coverage=JSON.parse(execFileSync(process.execPath,['scripts/verificar-cobertura-redisenio.cjs','--json'],{cwd:root,encoding:'utf8'}));
 const base='http://127.0.0.1:3861';const calls=[];let role='USUARIO';let loginFails=false;
 const user=()=>({id_usuario:'12',nombre:'Usuario QA Controlado',email:'qa@example.invalid',rol:role,departamento:'Informática QA',permisos:['VIVI_NOTICIAS_LEER','VIVI_NOTICIAS_EDITAR','VIVI_NOTICIAS_PUBLICAR','VIVI_JUZGADO_CONSULTAR']});
 const ticket={id:'31',codigo:'QA-031',titulo:'Solicitud controlada',descripcion:'Descripción de prueba',usuarioCreadorId:12,usuarioCreadorNombre:'Usuario QA',usuarioAsignadoId:null,usuarioAsignadoNombre:null,asignado:null,creador:{id:'12',nombre:'Usuario QA',avatar:null,departamento:'Informática QA'},categoriaId:'1',categoriaNombre:'Técnico',prioridadId:'2',prioridadNombre:'Normal',estadoId:'1',estadoNombre:'Ingresado',fechaCreacion:'2026-10-31T15:00:00Z',fechaActualizacion:'2026-10-31T15:00:00Z',fechaCierre:null,tiempoEstimado:60};
 const backend=http.createServer(async(req,res)=>{
  let body='';for await(const b of req)body+=b;
  let data={};if(body){try{data=JSON.parse(body);}catch{const m=body.match(/name="operations"\r\n\r\n([\s\S]*?)\r\n--/);if(m)data=JSON.parse(m[1]);}}
  const q=data.query||'';calls.push({path:req.url,method:req.method,query:q,variables:data.variables,auth:req.headers.authorization});
  const json=(obj,status=200)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(obj));};
  if(req.url==='/auth/send-recovery-email'||req.url==='/auth/recover-password')return json({mensaje:'Respuesta controlada'});
  if(q.includes('mutation Login'))return loginFails?json({errors:[{message:'Credenciales incorrectas',extensions:{code:'UNAUTHENTICATED'}}]}):json({data:{login:{token:'qa-token-controlado',refresh_token:'no-real',expires_in:3600}}});
  if(q.includes('query UsuarioById'))return json({data:{usuarioById:user()}});
  if(q.includes('query GetUser'))return json({data:{usuario:user()}});
  if(q.includes('query GetMyActivity'))return json({data:{myActivity:[{tipo:'LECTURA',descripcion:'Acción controlada de pruebas',fecha:'2026-10-31T15:00:00Z'}]}});
  if(q.includes('query GetMyStats'))return json({data:{myStats:{tickets:{ingresados:3,resueltos:1,cerrados:1,asignados:0},vacaciones:{dias_disponibles:0,dias_usados:0},zonas_a_cargo:[],grafico_mensual:[{mes:'Octubre',tickets:3}]}}});
  if(q.includes('query GetTechnicianStats'))return json({data:{technicianStats:{tickets:3,asignados:1,resueltos:1,pendientes:1,grafico_rendimiento:[{mes:'Octubre',resueltos:1}]}}});
  if(q.includes('query GetTechnicianEvents'))return json({data:{TechnicianEvents:[]}});
  if(q.includes('query GetTechnicianLastTickets'))return json({data:{technicianLastTickets:[]}});
  if(q.includes('query GetAnnualReport'))return json({data:{annualReport:{anio:2026,data:[{mes:'Octubre',ticketsCreados:3}]}}});
  if(q.includes('query adminDashboardStats'))return json({data:{adminDashboardStats:{filtros_aplicados:{},totales:{ingresados:3,resueltos:1,en_trabajo:1,asignados:1},por_estado:[],grafico_resueltos_mensual:[]}}});
  if(q.includes('query UserPerformance'))return json({data:{userPerformance:{filtros_aplicados:{},rows:[]}}});
  if(q.includes('query lastMovements'))return json({data:{lastMovements:[]}});
  if(q.includes('query lastTicket'))return json({data:{lastTicket:[]}});
  if(q.includes('query TicketsByUsuarioCreador'))return json({data:{ticketsByUsuarioCreador:[ticket]}});
  if(q.includes('query Tickets'))return json({data:{tickets:[ticket]}});
  if(q.includes('query GetTicketById'))return json({data:{ticket}});
  if(q.includes('mutation CreateTicket'))return json({data:{createTicket:{ticket,adjuntos:[],departamentoCreador:{id_departamento:'1',nombre:'Informática QA'}}}});
  if(q.includes('mutation UpdateTicket'))return json({data:{updateTicket:ticket}});
  if(q.includes('mutation DeleteTicket'))return json({data:{deleteTicket:true}});
  if(/ticketAttachments/.test(q))return json({data:{ticketAttachments:[]}});
  if(/ticketTags/.test(q))return json({data:{ticketTags:[]}});
  if(/ticketTagCatalog/.test(q))return json({data:{ticketTagCatalog:[]}});
  if(/ticketHistory/.test(q))return json({data:{ticketHistory:[]}});
  if(/ticketMessages/.test(q))return json({data:{ticketMessages:[]}});
  if(/ticketComments/.test(q))return json({data:{ticketComments:[]}});
  if(q.includes('query Users'))return json({data:{users:[{id:'12',name:'Usuario QA Controlado',email:'qa@example.invalid',rol:role,departamento:'Informática QA',status:'Activo',avatar:null}]}});
  if(q.includes('query TeamMembers'))return json({data:{teamMembers:[{id_usuario:12,nombre:'Usuario QA Controlado',email:'qa@example.invalid',rol:role,departamento:'Informática QA',tickets_asignados:1,tickets_resueltos:1,tickets_pendientes:0,avatar:null}]}});
  if(q.includes('query GetDepartments'))return json({data:{departamentos:[{id_departamento:'1',nombre_departamento:'Informática QA',descripcion:'Prueba',activo:1}]}});
  if(q.includes('query ManualesCategorias'))return json({data:{manualesCategorias:[{codigo:'OTROS',etiqueta:'Otros',total:1}]}});
  if(q.includes('query ManualesAgrupados'))return json({data:{manualesAgrupados:[{categoria:'OTROS',categoriaEtiqueta:'Otros',manuales:[{id:1,categoria:'OTROS',titulo:'Manual QA controlado',nombreArchivo:'manual-qa.pdf',urlVisualizacion:'/manual-qa.pdf',orden:1,tamanoBytes:100}]}]}});
  return json({errors:[{message:'Servicio no disponible en esta prueba controlada',extensions:{code:'SERVICE_UNAVAILABLE'}}]});
 });backend.listen(3862,'127.0.0.1');await once(backend,'listening');
 const next=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3861','-H','127.0.0.1'],{cwd:root,env:{...process.env,GRAPHQL_ENDPOINT:'http://127.0.0.1:3862/graphql',API_PORTAL_URL:'http://127.0.0.1:3862',AUTH_RECOVERY_BASE_URL:'http://127.0.0.1:3862/auth/',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
 let output='';next.stdout.on('data',b=>output+=b);next.stderr.on('data',b=>output+=b);let browser,context,page;const errors=[];const visited=[];
 const out=process.env.QA_SCREENSHOT_DIR||'/workspace/artifacts/tickets-redisenio';await fs.mkdir(out,{recursive:true});
 try{
  for(let i=0;i<200&&!output.includes('Ready in');i++){if(next.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,100));}assert.ok(output.includes('Ready in'));
  browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  context=await browser.newContext({viewport:{width:1600,height:1000}});page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  const fits=async()=>assert.ok(await page.evaluate(()=>{const m=document.querySelector('main');return document.documentElement.scrollWidth<=innerWidth&&(!m||m.scrollWidth<=m.clientWidth+1);}),'Desborde horizontal en '+page.url());
  await page.goto(base+'/login');await page.getByLabel('Usuario',{exact:false}).fill('qa@example.invalid');await page.locator('#clave').fill('ClaveSoloQA1!');
  loginFails=true;await page.getByRole('button',{name:'Iniciar Sesión',exact:true}).click();await page.getByText('Email o contraseña incorrectos',{exact:true}).waitFor();
  assert.equal(await page.locator('#email').inputValue(),'qa@example.invalid');assert.equal(await page.locator('#clave').inputValue(),'');
  await page.screenshot({path:path.join(out,'login-error.png')});
  loginFails=false;await page.locator('#clave').fill('ClaveSoloQA1!');await page.getByRole('button',{name:'Iniciar Sesión',exact:true}).click();await page.waitForURL('**/home');await page.getByText('Acción controlada de pruebas',{exact:true}).waitFor();
  await page.waitForLoadState('networkidle');await page.mouse.move(0,0);await page.screenshot({path:path.join(out,'inicio-usuario.png')});
  await page.getByLabel('Buscar una aplicación').fill('comunicación');const app=page.getByRole('link',{name:/Aplicaciones de Comunicación/});await app.waitFor();await app.click();await page.waitForURL('**/home/comunicacion/contenido');
  assert.equal(await page.getByRole('navigation',{name:'Menú principal'}).getByRole('link',{name:'Mis tickets',exact:true}).count(),1);
  await page.getByRole('navigation',{name:'Menú principal'}).getByRole('link',{name:'Mis tickets',exact:true}).click();await page.waitForURL('**/mis-tickets');await page.getByText(ticket.titulo,{exact:true}).waitFor();
  assert.ok(calls.some(c=>c.query.includes('query Tickets')&&c.variables?.filters?.usuarioCreadorId===12));
  const session=async(nextRole)=>{role=nextRole;await context.addCookies([{name:'auth_token',value:'qa-token-controlado',url:base},{name:'auth_role',value:role,url:base}]);await page.evaluate(user=>localStorage.setItem('auth-storage',JSON.stringify({state:{token:'qa-token-controlado',user,userId:user.id_usuario},version:0})),user());};
  for(const current of ['TECNICO','DESARROLLADOR','ADMINISTRADOR']){await session(current);await page.goto(base+'/home');await page.getByRole('heading',{name:'Hola, Usuario'}).waitFor();await page.waitForLoadState('networkidle');await fits();await page.mouse.move(0,0);await page.screenshot({path:path.join(out,'inicio-'+current.toLowerCase()+'.png')});}
  await session('ADMINISTRADOR');await page.goto(base+'/tickets-creation');await page.locator('#subject').fill('Guardar requiere dos confirmaciones');await page.locator('#department').selectOption('1');await page.locator('[contenteditable=true]').fill('Descripción controlada');
  await page.getByRole('complementary',{name:'Resumen de la solicitud'}).getByText('Guardar requiere dos confirmaciones',{exact:true}).waitFor();await page.screenshot({path:path.join(out,'crear-ticket.png')});
  const writes=()=>calls.filter(c=>c.query.includes('mutation CreateTicket')).length;const before=writes();await page.getByRole('button',{name:'Crear ticket',exact:true}).click();
  await page.getByRole('dialog',{name:'Revisa el cambio'}).waitFor();await page.locator('#description[contenteditable=false]').waitFor();assert.equal(writes(),before);await page.getByRole('button',{name:'Confirmar revisión · 1 de 2'}).click();
  assert.equal(await page.getByRole('button',{name:'Confirmar y aplicar · 2 de 2'}).isDisabled(),true);assert.equal(writes(),before);
  await page.getByRole('dialog').getByRole('button',{name:'Cancelar',exact:true}).click();assert.equal(writes(),before);assert.equal(await page.locator('#subject').inputValue(),'Guardar requiere dos confirmaciones');
  await page.getByRole('button',{name:'Crear ticket',exact:true}).click();await page.getByRole('button',{name:'Confirmar revisión · 1 de 2'}).click();await page.getByLabel('He revisado la acción y quiero aplicarla.').check();await page.getByRole('button',{name:'Confirmar y aplicar · 2 de 2'}).click();await page.getByText('Ticket QA-031 creado correctamente.',{exact:true}).waitFor();assert.equal(writes(),before+1);
  const created=calls.filter(c=>c.query.includes('mutation CreateTicket')).at(-1);assert.equal(created.variables.input.usuarioAsignadoId,12);
  // Cancelar cambia el estado y conserva el expediente; nunca llama deleteTicket.
  await page.goto(base+'/mis-tickets');await page.getByText(ticket.titulo,{exact:true}).waitFor();await page.getByRole('button',{name:'Cancelar ticket '+ticket.titulo,exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Confirmar',exact:true}).click();
  await page.getByRole('dialog',{name:'Revisa el cambio'}).waitFor();await page.getByRole('button',{name:'Confirmar revisión · 1 de 2'}).click();await page.getByLabel('He revisado la acción y quiero aplicarla.').check();await page.getByRole('button',{name:'Confirmar y aplicar · 2 de 2'}).click();await page.getByText('Ticket cancelado. Su historial se conserva.',{exact:true}).waitFor();
  assert.ok(calls.some(c=>c.query.includes('mutation UpdateTicket')&&c.variables.input.estadoId===4));assert.equal(calls.filter(c=>c.query.includes('mutation DeleteTicket')).length,0);
  await page.goto(base+'/config');await page.getByText('Vista de demostración de accesos.',{exact:false}).waitFor();await page.locator('fieldset[disabled]').waitFor();assert.equal(await page.locator('fieldset[disabled]').count(),1);await page.getByText('Roles del sistema',{exact:true}).click();assert.equal(await page.locator('fieldset[disabled]').count(),1);
  await session('TECNICO');await page.goto(base+'/tickets-creation');await page.locator('#subject').fill('Técnico no se autoasigna');await page.locator('#department').selectOption('1');await page.locator('[contenteditable=true]').fill('Descripción controlada');await page.getByRole('button',{name:'Crear ticket',exact:true}).click();await page.getByText('Ticket QA-031 creado correctamente.',{exact:true}).waitFor();const tech=calls.filter(c=>c.query.includes('mutation CreateTicket')).at(-1);assert.equal(tech.variables.input.usuarioAsignadoId,undefined);assert.equal(tech.variables.input.estadoId,1);
  for(const route of ['/usuarios','/equipo','/equipo/12','/aplicaciones','/statistics']){await session('ADMINISTRADOR');await page.goto(base+route);await page.waitForLoadState('networkidle');await fits();if(route==='/equipo/12'){await page.getByRole('heading',{name:'Información del colaborador'}).waitFor();assert.equal(await page.getByRole('article').filter({hasText:'Tickets creados'}).locator('strong').innerText(),'1');}await page.screenshot({path:path.join(out,route.replaceAll('/','-').slice(1)+'.png')});}
  await session('USUARIO');for(const route of coverage.moduleRoutes){await page.goto(base+route.path);await page.locator('main').waitFor();await page.waitForLoadState('networkidle');assert.ok(!page.url().includes('/unauthorized'),route.path);await fits();visited.push(route.path);if(['mod01','mod04','noticias','juz01'].includes(route.module))await page.screenshot({path:path.join(out,route.module+'-escritorio.png')});}
  await page.goto(base+'/home/informatica/manuales/mod07');await page.getByRole('button',{name:'Manual QA controlado'}).click();assert.ok((await page.getByTitle('Manual QA controlado',{exact:true}).boundingBox()).height>=400);
  const layoutFailures=[];
  for(const width of [1024,768]){await page.setViewportSize({width,height:1000});for(const route of coverage.moduleRoutes){await page.goto(base+route.path);await page.waitForLoadState('networkidle');try{await fits();}catch(error){layoutFailures.push({width,path:route.path});await page.screenshot({path:path.join(out,'desborde-'+width+'-'+route.module+'.png')});}}await page.screenshot({path:path.join(out,'modulos-'+width+'.png')});}
  assert.deepEqual(layoutFailures,[],'Módulos con desborde: '+JSON.stringify(layoutFailures));
  for(const width of [1920,1440,1180,1024,768,390]){await page.setViewportSize({width,height:1000});await page.goto(base+'/home');await page.getByText('Acción controlada de pruebas',{exact:true}).waitFor();await fits();await page.mouse.move(0,0);await page.screenshot({path:path.join(out,'inicio-'+width+'.png')});}
  await page.getByRole('button',{name:'Abrir menú',exact:true}).click();await page.getByRole('navigation',{name:'Menú principal'}).getByRole('link',{name:'Mis tickets',exact:true}).waitFor();await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Abrir menú',exact:true}).getAttribute('aria-expanded'),'false');
  await page.goto(base+'/config');await page.waitForURL('**/unauthorized');
  await context.clearCookies();await page.evaluate(()=>localStorage.clear());await page.goto(base+'/forgot-password');await page.locator('#recovery-email').fill('qa@example.invalid');await page.getByRole('button',{name:'Solicitar recuperación'}).click();await page.locator('#recovery-code').waitFor();await page.locator('#recovery-code').fill('123456');await page.locator('#recovery-password').fill('Recuperar123!');await page.locator('#recovery-repeat').fill('Recuperar123!');await page.getByRole('button',{name:'Actualizar contraseña'}).click();await page.getByRole('heading',{name:'Acceso recuperado'}).waitFor();
  assert.ok(!errors.length,JSON.stringify(errors));
  await fs.writeFile(path.join(out,'resultado.json'),JSON.stringify({estado:'OK',modulos:visited.length,recorridos:['login con error y éxito','buscador y secciones','mis tickets creados','inicios 4 roles','cancelación administrativa sin envío','dos confirmaciones y una sola escritura','técnico sin autoasignación','cancelar conserva historial sin deleteTicket','configuración demo sin escrituras','usuarios, equipo, perfil y aplicaciones','manual con visor utilizable','módulos a 1024 y 768','menú móvil','denegación de ruta','recuperación y nueva contraseña'],visited,errors},null,2));
  console.log('REDISENIO_BROWSER_OK; módulos='+visited.length+'; sin errores React');
 }catch(error){if(page){await page.screenshot({path:path.join(out,'fallo.png')}).catch(()=>{});await fs.writeFile(path.join(out,'fallo.txt'),await page.locator('body').innerText()).catch(()=>{});}throw error;}finally{await browser?.close();next.kill('SIGTERM');await new Promise(resolve=>backend.close(resolve));}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
