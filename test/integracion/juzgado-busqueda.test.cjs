const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const load=require('./load-ts.cjs')(path.resolve(__dirname,'../..'));
const {JUZ01Schema}=load('src/views/JUZ01/JUZ01.schema.ts');
test('la búsqueda admite prefijos desde tres caracteres y código completo sin comodines',()=>{
 for(const code of ['', '12', 'a ', 'abcde%', "abc'",'a'.repeat(37)])assert.equal(JUZ01Schema.safeParse({caseNumber:code}).success,false,code);
 for(const code of ['123','c50','c503be','ABC123','ab_cd-','c503bec0-eff3-4466-b50e-96bbcecf6dd2'])assert.equal(JUZ01Schema.safeParse({caseNumber:code}).success,true,code);
 assert.deepEqual(JUZ01Schema.parse({caseNumber:' c503bec0-eff3-4466-b50e-96bbcecf6dd2 '}),{caseNumber:'c503bec0-eff3-4466-b50e-96bbcecf6dd2'});
});
