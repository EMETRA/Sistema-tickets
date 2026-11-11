const test=require('node:test'),assert=require('node:assert/strict');
const path=require('node:path');
const {newsLocationInput}=require('./load-ts.cjs')(path.resolve(__dirname,'../..'))('src/api/cms/news-location.ts');
test('ubicación de noticias admite referencia, par geográfico y borrado explícito',()=>{
 assert.deepEqual(newsLocationInput({ubicacion:'  Zona 5  ',latitud:'14.6',longitud:'-90.5'}),{ubicacion:'Zona 5',latitud:14.6,longitud:-90.5});
 assert.deepEqual(newsLocationInput({latitud:'',longitud:''}),{latitud:null,longitud:null});
 assert.deepEqual(newsLocationInput({}),{});
 for(const value of [{latitud:'91',longitud:'-90.5'},{latitud:'14.6',longitud:''},{latitud:'0x10',longitud:'0'},{ubicacion:'a'.repeat(351)}])assert.throws(()=>newsLocationInput(value));
});
