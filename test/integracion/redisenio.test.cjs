const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const load=require('./load-ts.cjs')(root);
const {canAccessPath}=load('src/config/route-access.ts');
const {getMenuByRole}=load('src/config/navigation.ts');
const {describeGraphqlChange,describeRestChange}=load('src/api/administrative-confirmation.ts');
const {ErrorHandler}=load('src/api/graphql/errors.ts');

test('El error de credenciales de fetch conserva su clasificación y no expone errores internos',()=>{
 const error=Object.assign(new Error('Mensaje interno'),{graphQLErrors:[{message:'Mensaje interno',extensions:{code:'UNAUTHENTICATED'}}]});
 assert.equal(ErrorHandler.isAuthError(error),true);
 const internal=Object.assign(new Error('ORA-00942 consulta privada'),{graphQLErrors:[{message:'ORA-00942 consulta privada',extensions:{code:'INTERNAL_SERVER_ERROR'}}]});
 assert.ok(!ErrorHandler.getUserMessage(internal).includes('ORA-'));
});

test('Mis tickets tiene ruta autorizada para los cuatro roles reales, sin habilitar rutas inexistentes',()=>{
 for(const role of ['ADMINISTRADOR','TECNICO','DESARROLLADOR','USUARIO']){
  assert.equal(canAccessPath(role,'/mis-tickets'),true);
  assert.equal(canAccessPath(role,'/calendario'),false);
  assert.equal(canAccessPath(role,'/infraestructura'),false);
  assert.ok(getMenuByRole(role).some(item=>item.path==='/mis-tickets'));
 }
 assert.equal(canAccessPath('USUARIO','/config'),false);
 assert.equal(getMenuByRole('TECNICO').find(item=>item.path==='/tickets').label,'Mis asignados');
});
test('La confirmación distingue consultas, alias de mutaciones y operaciones de sesión',()=>{
 assert.equal(describeGraphqlChange('query Q { tickets { id } }'),null);
 assert.equal(describeGraphqlChange('mutation { login(input:{email:"qa@example.invalid",clave:"no-real"}) { token } }'),null);
 assert.deepEqual(describeGraphqlChange('mutation M($input:Input!) { resultado:createTicket(input:$input) { id } }',{input:{titulo:'Adjunto no carga'}}),{label:'Crear un ticket',detail:'Adjunto no carga'});
 assert.ok(describeGraphqlChange('mutation { guardarNoticiaCms(input:{id:1}) { resultado } }'));
 assert.equal(describeRestChange('/api/usuario'),null);
 assert.equal(describeRestChange('/api/MOD06/permisos',{method:'POST'}),null);
 assert.ok(describeGraphqlChange('mutation { logout loginAdmin:createTicket(input:{titulo:"QA"}) { id } }'));
 assert.equal(describeRestChange('/api/auth/recovery',{method:'POST'}),null);
 assert.ok(describeRestChange('/api/JUZ01/resoluciones/1/documento/generar',{method:'POST'}));
});

const fetchOriginal=global.fetch,baseOriginal=process.env.AUTH_RECOVERY_BASE_URL;
after(()=>{global.fetch=fetchOriginal;if(baseOriginal===undefined)delete process.env.AUTH_RECOVERY_BASE_URL;else process.env.AUTH_RECOVERY_BASE_URL=baseOriginal;});
const recovery=require('./load-ts.cjs')(root,{'server-only':{}})('src/auth/recovery.server.ts').recoveryRequest;
function request(body,method='POST'){return new Request('http://panel.example.invalid/api/auth/recovery',{method,headers:{'Content-Type':'application/json'},body:typeof body==='string'?body:JSON.stringify(body)});}
test('Recuperación sin configurar o con cuerpo inválido no intenta enviar correos',async()=>{
 let calls=0;global.fetch=async()=>{calls++;throw Error('No debería llamar');};delete process.env.AUTH_RECOVERY_BASE_URL;
 assert.equal((await recovery(request({correo:'qa@example.invalid'}),'POST')).status,503);
 assert.equal((await recovery(request('x'.repeat(5000)),'POST')).status,400);
 assert.equal((await recovery(request({correo:'qa@example.invalid',destino:'https://other.invalid'}),'POST')).status,400);
 assert.equal(calls,0);
});
test('Recuperación usa solo los destinos fijos y no devuelve cuentas ni contraseñas',async()=>{
 process.env.AUTH_RECOVERY_BASE_URL='https://auth.example.invalid/auth/';const calls=[];
 global.fetch=async(url,options)=>{calls.push({url:String(url),...options});return Response.json({correo:'dato-privado',clave:'no-exponer'});};
 const good=await recovery(request({correo:'qa@example.invalid'}),'POST');assert.equal(good.status,200);const body=await good.json();assert.ok(!JSON.stringify(body).includes('qa@example.invalid'));
 global.fetch=async()=>Response.json({mensaje:'No existe usuario'}, {status:404});
 assert.deepEqual(await(await recovery(request({correo:'qa@example.invalid'}),'POST')).json(),body);
 global.fetch=async(url,options)=>{calls.push({url:String(url),...options});return Response.json({id:5,clave:'no-exponer'});};
 const updated=await recovery(request({OTP:'123456',clave:'Prueba123!'},'PUT'),'PUT');assert.equal(updated.status,200);assert.ok(!JSON.stringify(await updated.json()).includes('no-exponer'));
 assert.equal(calls[0].url,'https://auth.example.invalid/auth/send-recovery-email');assert.equal(calls[1].url,'https://auth.example.invalid/auth/recover-password');
 assert.equal(calls[1].method,'PUT');assert.equal(calls[1].redirect,'error');assert.ok(!calls[0].headers.Authorization);
});

// Evita convertir «mis tickets» en una consulta global si todavía no hay ID.
test('El listado por usuario no consulta datos sin identidad válida', () => {
 let role = 'ADMINISTRADOR', id = null;
 const hook = require('./load-ts.cjs')(root, {
  'react': {useMemo:fn=>fn()},
  '@/store/useAuthStore': {useAuthStore:fn=>fn({getRole:()=>role,getUserId:()=>id})},
  './useGetTickets': {useGetTickets:(filters,enabled)=>({filters,enabled})}
 })('src/api/hooks/useTicketsByRole.ts').useTicketsByRole;
 assert.equal(hook(undefined,'created').enabled,false);
 assert.equal(hook(undefined,'role').enabled,true);
 for(const current of ['USUARIO','TECNICO','DESARROLLADOR']) {
  role=current;
  assert.equal(hook().enabled,false);
  id='12';assert.equal(hook().enabled,true);assert.equal(hook(undefined,'created').filters.usuarioCreadorId,12);
  if(current!=='USUARIO')assert.equal(hook().filters.usuarioAsignadoId,12);
  id=null;
 }
});

test('Perfil y solicitudes toman el ID de la ruta y normalizan el contrato real sin exponer errores', async () => {
 let response = {usuarioById:{id_usuario:'12',nombre:'Usuario QA'}};
 let failure = null;const calls=[];
 const routes=require('./load-ts.cjs')(root,{
  'next/server':{NextResponse:Response},
  '@/api/graphql/client':{graphqlRequest:async(query,options)=>{calls.push(options.variables);if(failure)throw failure;return response;}}
 });
 const profile=routes('src/app/api/usuario/[userId]/route.ts').GET;
 const tickets=routes('src/app/api/tickets/usuario/[userId]/route.ts').GET;
 const req=new Request('http://panel.example.invalid/api/usuario/12');
 const context=id=>({params:Promise.resolve({userId:id})});
 assert.equal((await profile(req,context('12abc'))).status,400);assert.equal(calls.length,0);
 const result=await profile(req,context('12'));
 assert.equal((await result.json()).usuario.id_usuario,'12');assert.equal(result.headers.get('Cache-Control'),'no-store');assert.deepEqual(calls[0],{idUsuario:12});
 response={ticketsByUsuarioCreador:[{id:'31'}]};
 assert.deepEqual((await(await tickets(req,context('12'))).json()).tickets,[{id:'31'}]);
 response={};assert.equal((await tickets(req,context('12'))).status,503);
 failure=Object.assign(new Error('Error interno'),{graphQLErrors:[{message:'Error interno',extensions:{code:'UNAUTHENTICATED'}}]});
 assert.equal((await profile(req,context('12'))).status,401);
 failure=new Error('ORA-00942: consulta privada');
 const error=await tickets(req,context('12'));assert.equal(error.status,503);assert.ok(!JSON.stringify(await error.json()).includes('ORA-'));
});
