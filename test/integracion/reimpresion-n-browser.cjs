const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { once } = require('node:events');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');
const slip = require('../fixtures/transit-slip.json');
async function main() {
  const directory = '/tmp/reimpresion-n-browser'; await fs.mkdir(directory, {recursive:true});
  const bytes = await fs.readFile(process.env.REIMPRESION_N_PDF || '/tmp/reimpresion-n-ejemplo.pdf');
  assert.equal(bytes.subarray(0,5).toString(), '%PDF-');
  const calls=[], errors=[], reference='b06f32ff-c167-4575-ad76-d5b5400ae908';
  let allowed=false, pdfFail=true;
  const account={id_usuario:'1',nombre:'Administrador ficticio',email:'admin@example.invalid',rol:'ADMINISTRADOR',permisos:['TICKETS_ADMINISTRAR'],departamento:'Informática'};
  const meta=(id,title)=>({id,label:title,title,iconName:'clipboard-solid'});
  const catalog={juzgado:{meta:meta('juzgado','Aplicaciones Juzgado'),sections:{reportes:{meta:meta('reportes','Reportes'),modules:[meta('juz02','Reimpresión de boletas de tránsito N')]}}}};
  const backend=http.createServer(async(req,res)=>{
    let body='';for await(const b of req)body+=b;
    const url=new URL(req.url,'http://localhost');calls.push({path:url.pathname,method:req.method,authorization:req.headers.authorization});
    const json=(value,status=200)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(value));};
    if(url.pathname==='/platform/catalog')return json(catalog);
    if(url.pathname==='/platform/bootstrap')return json({enabled:true,actor:{id:1,admin:true,mode:'ADMINISTRADOR'},definitions:{},teams:[],memberships:[],capabilities:{}});
    if(url.pathname==='/platform/module-access/juz02')return json({moduloId:'juz02',allowed,actions:{LEER:allowed,INSERTAR:false,EDITAR:false,ELIMINAR:false}});
    if(url.pathname==='/platform/transit-reprints/N/999')return json({message:'No se encontró una boleta serie N con ese número.',codigo:'NO_ENCONTRADO'},404);
    if(url.pathname==='/platform/transit-reprints/N/1234567')return json(slip);
    if(url.pathname==='/platform/transit-reprints/N/1234567/pdf'){
      if(pdfFail)return json({message:'No se pudo completar la operación. Conserva los datos y reintenta.',codigo:'NO_DISPONIBLE',referencia:reference},503);
      res.writeHead(200,{'Content-Type':'application/pdf','Content-Disposition':'inline; filename="boleta-N-1234567.pdf"'});return res.end(bytes);
    }
    const data=body?JSON.parse(body):{};if(data.query?.includes('GetUser'))return json({data:{usuario:account}});
    return json({data:{}});
  });
  backend.listen(3782,'127.0.0.1');await once(backend,'listening');
  const next=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3781','-H','127.0.0.1'],{env:{...process.env,TICKETS_PLATFORM_ENABLED:'true',GRAPHQL_ENDPOINT:'http://127.0.0.1:3782/graphql',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
  let output='';next.stdout.on('data',b=>output+=b);next.stderr.on('data',b=>output+=b);
  let browser,page;
  try{
    for(let i=0;!output.includes('Ready in')&&i<200;i++){if(next.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,100));}assert.ok(output.includes('Ready in'));
    browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox'],headless:true});
    const context=await browser.newContext({viewport:{width:1440,height:1050}});
    await context.addCookies([{name:'auth_token',value:'token-ficticio',url:'http://127.0.0.1:3781'},{name:'auth_role',value:'ADMINISTRADOR',url:'http://127.0.0.1:3781'}]);
    await context.addInitScript(user=>localStorage.setItem('auth-storage',JSON.stringify({state:{token:'token-ficticio',user,userId:user.id_usuario},version:0})),account);
    page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(/Content Security Policy|Refused to (frame|load)/i.test(message.text()))errors.push(message.text());});
    await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
    await page.goto('http://127.0.0.1:3781/home/juzgado/reportes/juz02');
    await page.getByRole('heading',{name:'Sin acceso a este formulario'}).waitFor();
    assert.equal(calls.filter(c=>c.path.startsWith('/platform/transit-reprints')).length,0);
    allowed=true;await page.reload();await page.getByRole('heading',{name:'Buscar boleta de tránsito'}).waitFor();
    assert.equal(calls.filter(c=>c.path.startsWith('/platform/transit-reprints')).length,0);
    await page.getByLabel('Número de boleta').fill('K-123');await page.getByRole('button',{name:'Consultar boleta',exact:true}).click();
    await page.getByRole('alert').filter({hasText:'Ingresa el número'}).waitFor();assert.equal(calls.filter(c=>c.path.startsWith('/platform/transit-reprints')).length,0);
    await page.getByLabel('Número de boleta').fill('999');await page.getByRole('button',{name:'Consultar boleta',exact:true}).click();
    await page.getByRole('alert').filter({hasText:'No se encontró'}).waitFor();assert.equal(await page.getByLabel('Número de boleta').inputValue(),'999');
    await page.getByLabel('Número de boleta').fill('N-1234567');await page.getByRole('button',{name:'Consultar boleta',exact:true}).click();
    await page.getByRole('heading',{name:'Boleta N-1234567',exact:true}).waitFor();await page.getByText('P - 000AAA',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Ver PDF para reimpresión',exact:true}).click();await page.getByRole('alert').filter({hasText:reference}).waitFor();
    pdfFail=false;await page.getByRole('button',{name:'Reintentar PDF',exact:true}).click();
    await page.getByTitle('Vista previa boleta N-1234567').waitFor();
    await page.getByRole('heading',{name:'Vista previa de la reimpresión'}).scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(directory,'reimpresion-n-pdf.png'),fullPage:false});
    const downloadEvent=page.waitForEvent('download');await page.getByRole('link',{name:'Descargar PDF',exact:true}).click();const download=await downloadEvent;
    assert.equal(download.suggestedFilename(),'boleta-N-1234567.pdf');assert.deepEqual(await fs.readFile(await download.path()),bytes);
    const popupEvent=page.waitForEvent('popup');await page.getByRole('link',{name:'Abrir PDF para imprimir'}).click();const popup=await popupEvent;assert.ok(popup.url().startsWith('blob:'));await popup.close();
    await page.getByRole('button',{name:'Cerrar vista previa'}).click();await page.getByTitle('Vista previa boleta N-1234567').waitFor({state:'detached'});
    for(const width of [1440,1024,390]){await page.setViewportSize({width,height:1050});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(directory,'reimpresion-n-'+width+'.png'),fullPage:false});}
    assert.deepEqual(errors,[]);assert.ok(calls.filter(c=>c.path.startsWith('/platform/transit-reprints')).every(c=>c.authorization==='Bearer token-ficticio'&&c.method==='GET'));
    await page.getByLabel('Número de boleta').fill('123');assert.equal(await page.getByRole('heading',{name:'Boleta N-1234567',exact:true}).count(),0);
    console.log('REIMPRESION_N_BROWSER_OK: permiso previo, serie fija, validación, 404, artículos, PDF, reintento con referencia, descarga, impresión y vista adaptable; datos ficticios; capturas='+directory);
  }catch(error){if(page){await page.screenshot({path:path.join(directory,'fallo.png')}).catch(()=>{});console.error((await page.locator('body').innerText()).slice(-2000));}throw error;}
  finally{await browser?.close();next.kill('SIGTERM');backend.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
