const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const load=require('./load-ts.cjs')(path.resolve(__dirname,'../..'));
const {JUZ01Schema}=load('src/views/JUZ01/JUZ01.schema.ts');
test('la búsqueda exige seis caracteres y admite el código completo',()=>{
 for(const code of ['123','12345','abcde%','a'.repeat(37)])assert.equal(JUZ01Schema.safeParse({caseNumber:code}).success,false);
 for(const code of ['ABC123','ab_cd-','a'.repeat(36)])assert.equal(JUZ01Schema.safeParse({caseNumber:code}).success,true);
});
