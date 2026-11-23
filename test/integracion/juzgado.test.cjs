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
test('un fallo judicial muestra solo la referencia saneada que permite encontrar la incidencia',()=>{
 const referencia='6cba45c9-9eba-476c-9666-a87f46c2c7da';
 const message=api.mensajeJuzgado({graphQLErrors:[{message:'ORA-01031 SELECT privado',extensions:{statusCode:503,referencia}}]});
 assert.match(message,new RegExp(referencia));assert.doesNotMatch(message,/ORA-|SELECT/);
 const invalid=api.mensajeJuzgado({graphQLErrors:[{extensions:{statusCode:503,referencia:'token=privado'}}]});
 assert.doesNotMatch(invalid,/token|Referencia/);
});
test('la generación fallida conserva su referencia HTTP y explica que solo falta el documento',()=>{
 const referencia='b06f32ff-c167-4575-ad76-d5b5400ae908';
 const error={statusCode:503,body:{codigo:'ARCHIVO_ALMACENAMIENTO_NO_CONFIGURADO',referencia,error:'SQL privado'}};
 const message=api.mensajeJuzgado(error,'documento');
 assert.match(message,/resolución está registrada/);assert.match(message,/configurar el almacenamiento/);assert.match(message,new RegExp(referencia));assert.doesNotMatch(message,/SQL/);
 assert.match(api.mensajeJuzgado({statusCode:503},'documento'),/reintenta únicamente el documento/);
 const {ArchivoJuzgadoError}=load('src/api/graphql/juzgado-archivo.ts');
 assert.match(api.mensajeJuzgado(new ArchivoJuzgadoError(503,'ARCHIVO_NO_DISPONIBLE',referencia)),new RegExp(referencia));
 assert.doesNotMatch(new ArchivoJuzgadoError(503,undefined,'token=privado').message,/privado|token/);
});
test('el error público de búsqueda orienta a seis caracteres y reconoce statusCode de GraphQL sin copiar SQL',()=>{
 assert.match(api.mensajeJuzgado({graphQLErrors:[{message:'No mostrar SQL privado',extensions:{code:'BUSQUEDA_DEMASIADO_AMPLIA',statusCode:400}}]},'busqueda'),/20 coincidencias.*6 caracteres/);
 assert.match(api.mensajeJuzgado({graphQLErrors:[{extensions:{statusCode:403}}]},'busqueda'),/no tiene permiso/);
 const invalid=api.mensajeJuzgado({graphQLErrors:[{message:'ORA-00942 SQL privado',extensions:{statusCode:400}}]},'busqueda');
 assert.match(invalid,/código/);assert.ok(!invalid.includes('SQL'));assert.ok(!invalid.includes('actuación'));
});
test('las descargas explican permiso y almacenamiento sin copiar mensajes internos',()=>{
 const {ArchivoJuzgadoError}=load('src/api/graphql/juzgado-archivo.ts');
 assert.match(new ArchivoJuzgadoError(403).message,/no tiene permiso/);
 assert.match(new ArchivoJuzgadoError(503,'ARCHIVO_NO_DISPONIBLE').message,/almacenamiento/);
 assert.match(new ArchivoJuzgadoError(404).message,/No se encontró/);
 assert.ok(!new ArchivoJuzgadoError(503,'SQL privado').message.includes('SQL'));
});
