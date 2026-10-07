const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const makeLoader = require('./load-ts.cjs');
const base = () => ({ titulo:'QA Noticias', resumen:'Prueba', autor:'Comunicación EMETRA', categoriaId:'1', subcategoriaId:'2', etiquetaIds:['3'], idioma:'es-GT', visibilidad:'publica', fechaPublicacion:'', slug:'qa-noticias', tiempoLectura:'', archivoPrincipal:null, secciones:[], galeria:[] });
const file = name => new File(['imagen'], name, {type:'image/png'});
const media = f => ({id:'nuevo-'+f.name,name:f.name,sizeBytes:f.size,mimeType:f.type,file:f});
function setup(apiFetch, graphqlRequestClient = async () => { throw new Error('Mutación inesperada'); }) {
 const load = makeLoader(root, { [path.join(root,'src/api/graphql/client.ts')]: {apiFetch, graphqlRequestClient} });
 return {load, ...load('src/views/COM03/utils/prepareGuardarNoticiaPayload.ts'), accion: load('src/api/graphql/COM03/types.ts').AccionNoticia.BORRADOR};
}

test('conserva portada, imagen de sección y orden de galería; reutiliza IDs al reintentar', async () => {
 const calls=[]; const f1=file('portada.png'),f2=file('seccion.png'),f3=file('galeria.png');
 const s=setup(async (url,_,init) => {calls.push(url); if(url.endsWith('/recursos')) { assert.equal(init.body.getAll('archivos').length,3); return init.body.getAll('archivos').map(f=>{const id={'portada.png':11,'seccion.png':12,'galeria.png':13}[f.name];return{id,tipo:'imagen',url:'/uploads/noticias/'+id+'.png'};}); } return {data:[{id:24,nombre:'Comunicación EMETRA'}]}; });
 const values={...base(),archivoPrincipal:media(f1),secciones:[{id:'s',encabezado:'QA',contenido:'Texto',imagen:media(f2)}],galeria:[media(f3),media(f1)]};
 const cache=s.crearCacheRecursos(); const first=await s.prepareGuardarNoticiaPayload(values,null,s.accion,cache);
 assert.equal(first.variables.input.recursoPrincipalId,11); assert.equal(first.variables.input.secciones[0].recursoId,12);
 assert.deepEqual(first.variables.input.galeriaRecursosIds,[13,11]); assert.deepEqual(first.variables.input.autores,[{autorId:24,rol:'autor',orden:1}]);
 const second=await s.prepareGuardarNoticiaPayload(values,null,s.accion,cache);
 assert.deepEqual(first,second); assert.deepEqual(calls,['/api/COM03/recursos','/api/COM03/autores']);
});
test('un recurso no confirmado impide guardar un payload parcial', async () => {
 const s=setup(async()=>[]); const values={...base(),archivoPrincipal:media(file('qa.png'))};
 await assert.rejects(()=>s.prepareGuardarNoticiaPayload(values,null,s.accion,s.crearCacheRecursos()),/confirmó todas/);
});
test('un fallo en el segundo lote conserva el primero para el reintento', async () => {
 let attempts=0; const sizes=[]; let fail=true;
 const s=setup(async (url,_,init)=>{ if(url.endsWith('/autores'))return{data:[{id:24,nombre:'Comunicación EMETRA'}]}; const files=init.body.getAll('archivos');sizes.push(files.length); attempts++; if(attempts===2&&fail)throw new Error('red');return files.map((_,i)=>({id:attempts*100+i,tipo:'imagen',url:'/uploads/noticias/qa.png'})); });
 const values={...base(),galeria:Array.from({length:21},(_,i)=>media(file(i+'.png')))}; const cache=s.crearCacheRecursos();
 await assert.rejects(()=>s.prepareGuardarNoticiaPayload(values,null,s.accion,cache),/red/); fail=false;
 const payload=await s.prepareGuardarNoticiaPayload(values,null,s.accion,cache); assert.deepEqual(sizes,[20,1,1]); assert.equal(payload.variables.input.galeriaRecursosIds.length,21);
});
test('registra YouTube una sola vez y crea un autor únicamente si falta en el catálogo', async()=>{
 const calls=[]; let mutation;
 const s=setup(async(url,_,init)=>{calls.push(url); if(url.endsWith('/externos')){assert.deepEqual(JSON.parse(init.body),{url:'https://www.youtube.com/watch?v=abcdefghijk',tipo:'video'});return{id:30,tipo:'video',url:'https://www.youtube.com/watch?v=abcdefghijk'};}return{data:[]};},async(q,v)=>{mutation={q,v};return{crearAutorCms:{id:26,nombre:'Comunicación EMETRA'}};});
 const values={...base(),galeria:[{id:'video-nuevo',name:'Youtube',file:null,sizeBytes:null,mimeType:'video/youtube',youtubeId:'abcdefghijk',url:'https://www.youtube.com/watch?v=abcdefghijk'}]}; const cache=s.crearCacheRecursos();
 const payload=await s.prepareGuardarNoticiaPayload(values,null,s.accion,cache);await s.prepareGuardarNoticiaPayload(values,null,s.accion,cache);
 assert.deepEqual(calls,['/api/COM03/recursos/externos','/api/COM03/autores']);assert.deepEqual(payload.variables.input.galeriaRecursosIds,[30]);assert.deepEqual(mutation.v.variables,{input:{nombre:'Comunicación EMETRA'}});
});
test('editar solo imágenes conserva el HTML, autores y categorías adicionales existentes',async()=>{
 const s=setup(async()=>{throw new Error('HTTP inesperado');});const values={...base(),categoriaIdsAdicionales:['4'],secciones:[{id:'10',encabezado:'Texto',contenido:'Hola',contenidoOriginal:'Hola',contenidoHtmlOriginal:'<p><strong>Hola</strong></p>',imagen:null}]};
 const payload=await s.prepareGuardarNoticiaPayload(values,{id:'21',autor:'Comunicación EMETRA',autores:[{id:24,nombre:'Comunicación EMETRA',rol:'autor',orden:1},{id:25,nombre:'Foto',rol:'fotografo',orden:2}]},s.accion,s.crearCacheRecursos());
 assert.equal(payload.variables.input.secciones[0].contenidoHtml,'<p><strong>Hola</strong></p>');assert.deepEqual(payload.variables.input.categoriasIds,[1,2,4]);assert.equal(payload.variables.input.autores.length,2);
});
test('permisos ausentes o no confirmados no habilitan editar o publicar',()=>{
 const p=makeLoader(root)('src/views/COM03/utils/permisos.ts');assert.deepEqual(p.permisosParaUI(null),{puedeLeer:false,puedeEditar:false,puedePublicar:false});assert.equal(p.permisosParaUI(['VIVI_NOTICIAS_PUBLICAR']).puedePublicar,false);
});
test('misma carga conserva la clave idempotente; un cambio recibe otra clave',()=>{
 const p=makeLoader(root)('src/views/COM03/utils/claveIdempotente.ts');const first=p.claveParaIntento(null,'contenido',()=> 'qa-primera');assert.equal(p.claveParaIntento(first,'contenido',()=>{throw Error('No debe crear clave');}),first);assert.equal(p.claveParaIntento(first,'cambio',()=> 'qa-nueva').clave,'qa-nueva');
});
