const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const {NextRequest} = require('next/server');
const loader = require('./load-ts.cjs');
const root = path.resolve(__dirname, '../..');
function view(document) {
 const {OfficePreview} = loader(root, {
  './OfficePreview.module.scss': {},
  '@/components/client/atoms/Button': {Button:({children}) => React.createElement('button',null,children)},
 })('src/components/client/organisms/FileViewer/OfficePreview.tsx');
 return renderToStaticMarkup(React.createElement(OfficePreview,{document,name:'ejemplo.docx'}));
}
test('Word se muestra en un origen aislado, con política que prohíbe scripts y conexiones', () => {
 const html = view({kind:'word',html:'<h1>Documento</h1>',notes:['Solo lectura']});
 assert.match(html,/sandbox=""/); assert.match(html,/referrerPolicy="no-referrer"/i);
 assert.match(html,/default-src &#x27;none&#x27;/); assert.match(html,/base-uri &#x27;none&#x27;/);
 assert.match(html,/srcDoc=/i); assert.match(html,/Word: ejemplo.docx/);
});
test('Excel conserva coordenadas AA, muestra nombres y valores como texto, y dispone de hojas y paginación', () => {
 const row=Array(27).fill('Texto');row[0]='<script>alert(1)</script>';
 const html = view({kind:'spreadsheet',sheets:[{name:'<img src=x>',rows:[row],rowCount:1,columnCount:27,truncated:false}],notes:[]});
 assert.match(html,/role="tablist"/);assert.match(html,/role="tabpanel"/);
 assert.match(html,/scope="col">AA</);assert.match(html,/&lt;script&gt;/);
 assert.match(html,/&lt;img src=x&gt;/);assert.doesNotMatch(html,/<script|<img/);
 assert.match(html,/Filas anteriores/);assert.match(html,/Filas siguientes/);
});
test('la ruta privada del Panel transporta el JSON Office sin cachear y conserva la autorización',async () => {
 const previous=global.fetch,enabled=process.env.TICKETS_PLATFORM_ENABLED;
 process.env.TICKETS_PLATFORM_ENABLED='true';let calls=0;
 const result={kind:'word',html:'<p>Prueba</p>',notes:[]};
 global.fetch=async(url,init)=>{calls++;assert.equal(String(url),'http://127.0.0.1:9090/platform/tickets/21/files/7/preview');assert.equal(init.headers.get('authorization'),'Bearer token-ficticio');assert.equal(init.cache,'no-store');return Response.json(result);};
 try {
  const {GET}=loader(root,{
   '@/api/config/env':{getGraphqlEndpoint:()=> 'http://127.0.0.1:9090/graphql'},
   '@/observability/server-incidents':{queuePanelIncident:()=>undefined},
  })('src/app/api/platform/[...path]/route.ts');
  const params=Promise.resolve({path:['tickets','21','files','7','preview']});
  const unauthorized=await GET(new NextRequest('http://localhost/api/platform/tickets/21/files/7/preview'),{params});
  assert.equal(unauthorized.status,401);assert.equal(calls,0);
  const response=await GET(new NextRequest('http://localhost/api/platform/tickets/21/files/7/preview',{headers:{Authorization:'Bearer token-ficticio'}}),{params});
  assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.deepEqual(await response.json(),result);assert.equal(calls,1);
 } finally {global.fetch=previous;if(enabled===undefined)delete process.env.TICKETS_PLATFORM_ENABLED;else process.env.TICKETS_PLATFORM_ENABLED=enabled;}
});
