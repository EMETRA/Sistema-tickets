const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const llamadas=[];
const load=require('./load-ts.cjs')(root,{[path.join(root,'src/api/graphql/client.ts')]:{graphqlRequestClient:async(query,options)=>{llamadas.push({query,options});return query.includes('viviJuzgadoResolverNoAcogida')?{viviJuzgadoResolverNoAcogida:{idResolucion:'90',estadoDocumento:'ERROR_REINTENTABLE'}}:{viviJuzgadoDetalle:{codigoCaso:options.variables.codigoCaso}};}}});
const api=load('src/api/graphql/juzgado.ts');
const vista=load('src/api/graphql/juzgado-vista.ts');
test('resolución transmite IDs, fundamento y versión, con el mismo input en reintento',async()=>{
 const input={idExpediente:'55',fundamento:'Fundamento de prueba',versionExpediente:'2',requestId:'juz-prueba',claveIdempotencia:'clave-prueba-123456'};
 await api.resolverCasoJuzgado('NO_ACOGIDA',input);await api.resolverCasoJuzgado('NO_ACOGIDA',input);
 assert.deepEqual(llamadas[0].options,llamadas[1].options);assert.match(llamadas[0].query,/ResolverNoAcogidaInput!/);assert.deepEqual(llamadas[0].options.variables,{input});assert.ok(!llamadas[0].query.includes('idActor'));
});
test('la consulta no ejecuta una mutación y valida el código devuelto',async()=>{
 await api.consultarCasoJuzgado('QA-CASO');assert.match(llamadas.at(-1).query,/^query/);assert.deepEqual(llamadas.at(-1).options.variables,{codigoCaso:'QA-CASO'});
});
test('el adaptador conserva estados y remisión reales sin inventar importe, pago ni identidad histórica',()=>{
 const mapped=vista.mapearCasoJuzgado({codigoCaso:'QA-CASO',estadoCaso:'REMISION_EMITIDA',caso:{codigoCaso:'QA-CASO',regla:'39',usoPlaca:'P',placa:'111BBB',registradaEn:'2026-10-08',evidenciasDenuncia:[],defensa:null},expediente:{nombreJuzgado:'Sede real',estado:'RESUELTO',gestiones:[{idActor:'24',tipoGestion:'REVISION',ocurridaEn:'fecha',observacion:null}],resolucion:{id:'90',fundamento:'Fundamento real',versionPlantilla:'DEN09-BORRADOR-1',resueltaEn:'fecha'},documentos:[],remision:{ciudad:'1',serie:'V',numero:'90'}}});
 assert.deepEqual(mapped.multa,{ciudad:'1',serie:'V',numero:'90',placa:'P-111BBB'});assert.equal(mapped.logs[0].userName,'Actor 24');assert.equal(mapped.resolucion.file,null);assert.equal(mapped.status,'REMISION_EMITIDA');
});
test('solo los permisos reales habilitan el contrato; el error de consulta no expone SQL',()=>{
 assert.match(api.mensajeJuzgado({graphQLErrors:[{extensions:{code:'FORBIDDEN'}}]}),/no tiene permiso/);assert.ok(!api.mensajeJuzgado(new Error('ORA-00942 SQL privado')).includes('ORA-'));
});
