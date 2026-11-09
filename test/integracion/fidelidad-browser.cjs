// Next y componentes reales, con datos ficticios locales. Referencia: P04/P05/P06/P63–65.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const {chromium} = require('playwright');
const base = process.env.TICKETS_LAB_TEST_URL || 'http://127.0.0.1:3030';
const out = process.env.QA_SCREENSHOT_DIR || '/tmp/tickets-fidelidad';
async function run() {
  assert.match(base, /^http:\/\/127\.0\.0\.1:\d+$/);
  await fs.mkdir(out, {recursive:true});
  const browser = await chromium.launch({executablePath:process.env.QA_CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  const page = await browser.newPage({viewport:{width:1440,height:1100}});
  page.setDefaultTimeout(45000);
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>/^https?:/.test(r.request().url()) && new URL(r.request().url()).hostname!=='127.0.0.1' ? r.abort() : r.continue());
  const visit=async route=>{await page.goto(base+route);await page.waitForLoadState('networkidle');};
  const fits=async()=>assert.ok(await page.evaluate(()=>{const m=document.querySelector('#main-content');return document.documentElement.scrollWidth<=innerWidth && (!m||m.scrollWidth<=m.clientWidth+1);}), 'Desborde: '+page.url());
  const white=async locator=>assert.equal(await locator.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)');
  const roles=[[/Administración ficticia/,'Control de Informática'],[/Secretaría ficticia/,'Primero, los tickets por asignar'],[/Jefatura ficticia/,'Tu unidad, en un solo lugar'],[/Técnico ficticio/,'Tu atención y tus instalaciones'],[/Desarrolladora ficticia/,'Tus sistemas y tus pendientes'],[/Operación ficticia/,'Tus servicios y tus pendientes'],[/Analista ficticio/,'Tus solicitudes y aplicaciones']];
  try {
    for(const [index,[role,title]] of [...Array.from(roles.entries()).slice(6),...Array.from(roles.entries()).slice(0,6)]) {
      await visit('/__laboratorio');await page.getByRole('link',{name:role}).click();
      const heading=page.getByRole('heading',{name:title,exact:true});await heading.waitFor();await page.waitForLoadState('networkidle');await fits();
      const primary=page.getByRole('region',{name:index===6?'Acciones recientes':index===2?'Tickets de mi equipo':index<=1?'Tickets recientes':'Mis tickets asignados',exact:true});
      const calendar=page.getByRole('complementary',{name:'Calendario',exact:true});await white(primary);await white(calendar);
      assert.equal(await heading.evaluate(el=>getComputedStyle(el.parentElement).borderLeftWidth),'4px');
      assert.equal(await page.locator('#main-content').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(244, 246, 251)');
      const cards=await page.getByRole('group',{name:'Indicadores de tickets'}).getByRole('article').all();assert.equal(cards.length,4);
      for(const card of cards){await white(card);assert.ok((await card.boundingBox()).height>=129);}
      const shortcuts=page.getByRole('navigation',{name:'Accesos de mi espacio'}).getByRole('link');assert.equal(await shortcuts.count(),3);
      if(index===6) {
        assert.deepEqual(await page.getByRole('group',{name:'Indicadores de tickets'}).locator('article > span:first-child').allTextContents(),['Mis solicitudes','En atención','Resueltas','Pendientes de respuesta']);
        assert.deepEqual(await shortcuts.locator('h2').allTextContents(),['Aplicaciones autorizadas','Crear ticket','Mis métricas']);
        assert.deepEqual(await page.getByRole('navigation',{name:'Menú principal',exact:true}).locator('a:visible').allTextContents(),['Inicio','Mis tickets','Calendario','Aplicaciones','Mis métricas']);
        assert.equal(await page.locator('#main-content section[aria-labelledby]').count(),1, 'El usuario no tiene paneles extra de bandeja/aplicaciones');
        await primary.getByText(/Revisaste el recibo/).waitFor();await primary.getByText(/Registraste el ticket/).waitFor();
        const left=await primary.boundingBox(),right=await calendar.boundingBox();assert.ok(left.x<right.x && Math.abs(left.y-right.y)<2,'Actividad y calendario en una fila');
        const bottom=await page.getByRole('navigation',{name:'Accesos de mi espacio'}).boundingBox();assert.ok(bottom.y>=Math.max(left.y+left.height,right.y+right.height));
      }
      const painted = await page.screenshot({path:path.join(out,'inicio-'+index+'.png'),fullPage:true});
      const active = await page.getByRole('navigation',{name:'Menú principal',exact:true}).getByRole('link',{name:'Inicio',exact:true}).boundingBox();
      const pixel = await page.evaluate(({png,x,y})=>new Promise((resolve,reject)=>{
        const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const brand=ctx.getImageData(12,32,180,46).data;let brandInk=0;for(let i=0;i<brand.length;i+=4)if(brand[i]<100&&brand[i+1]<130&&brand[i+2]<180)brandInk++;resolve({color:Array.from(ctx.getImageData(x,y,1,1).data),brandInk});};img.onerror=reject;img.src='data:image/png;base64,'+png;
      }),{png:painted.toString('base64'),x:Math.floor(active.x+active.width-12),y:Math.floor(active.y+active.height/2)});
      assert.deepEqual(pixel.color,[67,97,238,255],'Inicio debe estar pintado en la captura inicial, sin redimensionar');assert.ok(pixel.brandInk>50,'La marca debe estar pintada en la captura inicial');
    }
    await visit('/__laboratorio');await page.getByRole('link',{name:/Analista ficticio/}).click();await page.getByRole('heading',{name:'Tus solicitudes y aplicaciones',exact:true}).waitFor();await page.waitForLoadState('networkidle');
    const more=page.getByRole('button',{name:'Más herramientas',exact:true});await more.click();assert.equal(await more.getAttribute('aria-expanded'),'true');await page.getByRole('link',{name:'Buscar registros',exact:true}).waitFor();await more.click();assert.equal(await more.getAttribute('aria-expanded'),'false');
    for(const width of [1920,1440,1024,768,390]) {
      await page.setViewportSize({width,height:1100});await visit('/home');await fits();
      await page.screenshot({path:path.join(out,'inicio-'+width+'.png'),fullPage:true});
    }
    await page.setViewportSize({width:1440,height:1100});
    await visit('/home');await page.getByRole('button',{name:/Registraste el ticket/}).click();await page.getByRole('dialog').waitFor();await page.getByRole('dialog').getByRole('heading',{name:'Impresora de prueba sin conexión',exact:true}).waitFor();await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
    for(const [label,href,title] of [['Aplicaciones autorizadas','/aplicaciones','Aplicaciones del panel'],['Crear ticket','/tickets-creation','Nuevo ticket'],['Mis métricas','/espacio/metricas','Métricas de atención y actividad']]) {
      await visit('/home');const link=page.getByRole('navigation',{name:'Accesos de mi espacio'}).getByRole('link',{name:new RegExp(label)});
      assert.equal(await link.getAttribute('href'),href);await link.click();await page.getByRole('heading',{name:new RegExp(title,'i')}).waitFor();await fits();
    }
    await visit('/home');await page.getByRole('link',{name:'Ayuda',exact:true}).click();await page.getByRole('heading',{name:'Solicitar ayuda a Informática',exact:true}).waitFor();
    await visit('/home');await page.getByRole('link',{name:'Seguimiento de mis tickets',exact:true}).click();await page.getByRole('heading',{name:/Mis tickets/i}).first().waitFor();
    // Fallo parcial: métricas fallidas no ocultan la agenda ni muestran ceros inventados.
    const failed='**/api/platform/metrics?*';await page.route(failed,r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Fallo simulado'})}));
    await visit('/home');await page.getByRole('button',{name:'Reintentar actividad',exact:true}).waitFor();
    assert.ok((await page.getByRole('complementary',{name:'Calendario',exact:true}).getByRole('listitem').count())>0);
    assert.deepEqual(await page.getByRole('group',{name:'Indicadores de tickets'}).locator('strong').allTextContents(),['—','—','—','—']);
    await page.unroute(failed);await page.getByRole('button',{name:'Reintentar actividad',exact:true}).click();await page.getByText(/Revisaste el recibo/).waitFor();
    await visit('/tickets-creation');const drop=page.getByRole('button',{name:/Arrastra tu archivo/});await drop.focus();
    const chosen=page.waitForEvent('filechooser');await page.keyboard.press('Enter');await(await chosen).setFiles([]);
    assert.equal(await drop.evaluate(el=>getComputedStyle(el).borderTopWidth),'1px');
    await page.screenshot({path:path.join(out,'crear-ticket.png'),fullPage:true});
    assert.deepEqual(errors,[]);
    await fs.writeFile(path.join(out,'resultado.json'),JSON.stringify({referencia:'P04/P05/P06/P63–65',roles:7,anchos:[1920,1440,1024,768,390],composicionUsuario:'OK',navegacion:'OK',falloParcial:'OK',adjuntosTeclado:'OK',erroresReact:errors},null,2));
    console.log('FIDELIDAD_BROWSER_OK; 7 perfiles, composición P04, enlaces reales, fallos parciales, 5 anchos y teclado');
  } finally {await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
