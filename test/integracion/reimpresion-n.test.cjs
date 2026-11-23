const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { NextRequest } = require('next/server');
const root = path.resolve(__dirname, '../..');
const load = require('./load-ts.cjs');
const { transitSlipNumber, transitSlipPath, validTransitSlip } = load(root)('src/platform/transit-reprints.ts');

test('solo consulta números serie N y conserva los 15 dígitos como texto', () => {
  assert.equal(transitSlipNumber(' N-1234567 '), '1234567');
  assert.equal(transitSlipPath('999999999999999', true), '/transit-reprints/N/999999999999999/pdf');
  for (const value of ['K-1','0','-1','1.2','1e3','123/../../other','1?serie=K','1 OR 1=1','1000000000000000']) assert.throws(() => transitSlipNumber(value));
});
test('no presenta respuestas parciales ni valores incompatibles que rompan la vista', () => {
  assert.equal(validTransitSlip(null), false);
  assert.equal(validTransitSlip({ ciudad:1, serie:'N', numero:'1',fecha:'',placa:'',reglas:[{monto:1}],montoOriginal:1 }), false);
  assert.equal(validTransitSlip({ ciudad:2,serie:'N' }), false);
});
test('el cliente permite PDF solo en la ruta de reimpresión esperada y propaga el error del API', async () => {
  const original = global.fetch;
  const client = load(root, { '@/store/useAuthStore': { useAuthStore: { getState: () => ({token:'token-ficticio'}) } }, '@/api/administrative-confirmation': {} })('src/platform/client.ts');
  try {
    global.fetch = async (url, init) => { assert.equal(init.headers.get('authorization'), 'Bearer token-ficticio'); return new Response('%PDF-1.4 prueba', {headers:{'content-type':'application/pdf'}}); };
    const pdf = await client.platformFetch('/transit-reprints/N/1234567/pdf');
    assert.equal(await pdf.text(), '%PDF-1.4 prueba');
    await assert.rejects(client.platformFetch('/transit-reprints/N/1234567'), {status:502});
    await assert.rejects(client.platformFetch('/transit-reprints/K/1234567/pdf'), {status:502});
    global.fetch = async () => Response.json({codigo:'NO_DISPONIBLE',message:'Servicio temporalmente no disponible',referencia:'referencia-ficticia'}, {status:503});
    await assert.rejects(client.platformFetch('/transit-reprints/N/1/pdf'), {status:503, reference:'referencia-ficticia'});
  } finally { global.fetch = original; }
});
test('el BFF conserva Bearer, bytes, referencia y cabeceras privadas del reporte', async () => {
  const original = global.fetch, env = process.env.TICKETS_PLATFORM_ENABLED;
  process.env.TICKETS_PLATFORM_ENABLED='true';
  const calls=[];
  const route = load(root, { '@/api/config/env': { getGraphqlEndpoint:()=> 'https://tickets.example.invalid/web/graphql' }, '@/observability/server-incidents': { queuePanelIncident: async () => 'referencia-local' } })('src/app/api/platform/[...path]/route.ts');
  const request = (auth=true) => route.GET(new NextRequest('https://panel.example.invalid/api/platform/transit-reprints/N/1234567/pdf', {headers:auth?{Authorization:'Bearer prueba'}:{}}), {params:Promise.resolve({path:['transit-reprints','N','1234567','pdf']})});
  try {
    global.fetch=async (url,init)=>{calls.push({url:String(url),init});return new Response('%PDF-1.4\nprueba',{headers:{'content-type':'application/pdf','content-disposition':'inline; filename="boleta-N-1234567.pdf"'}});};
    assert.equal((await request(false)).status,401); assert.equal(calls.length,0);
    const result=await request();
    assert.equal(calls[0].url,'https://tickets.example.invalid/web/platform/transit-reprints/N/1234567/pdf');
    assert.equal(calls[0].init.headers.get('authorization'),'Bearer prueba');
    assert.equal(calls[0].init.cache,'no-store');
    assert.equal(await result.text(),'%PDF-1.4\nprueba');
    assert.equal(result.headers.get('cache-control'),'private, no-store');
    assert.equal(result.headers.get('x-content-type-options'),'nosniff');
    global.fetch=async()=>Response.json({codigo:'NO_DISPONIBLE',referencia:'referencia-original'},{status:503});
    const error=await request(); assert.equal(error.status,503); assert.equal((await error.json()).referencia,'referencia-original');
  } finally { global.fetch=original; if(env===undefined)delete process.env.TICKETS_PLATFORM_ENABLED;else process.env.TICKETS_PLATFORM_ENABLED=env; }
});
