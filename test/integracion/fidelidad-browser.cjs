// Run against `pnpm laboratorio`: real components, synthetic data, loopback only.
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
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  page.setDefaultTimeout(45000);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', r => /^https?:/.test(r.request().url()) && new URL(r.request().url()).hostname !== '127.0.0.1' ? r.abort() : r.continue());
  const visit = async route => {await page.goto(base+route);await page.waitForLoadState('networkidle');};
  const fits = async () => assert.ok(await page.evaluate(() => {
    const main=document.querySelector('#main-content');
    return document.documentElement.scrollWidth<=innerWidth && (!main || main.scrollWidth<=main.clientWidth+1);
  }), 'Desborde: '+page.url());
  const white = async locator => assert.equal(await locator.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)');
  const roles = [/Administración ficticia/,/Secretaría ficticia/,/Jefatura ficticia/,/Técnico ficticio/,/Desarrolladora ficticia/,/Operación ficticia/,/Analista ficticio/];
  try {
    for (const [index,role] of roles.entries()) {
      await visit('/__laboratorio');
      await page.getByRole('link',{name:role}).click();
      await page.getByRole('group',{name:'Indicadores de tickets'}).waitFor();
      await page.waitForLoadState('networkidle');
      await fits();
      const activity=page.getByRole('region',{name:'Acciones recientes en aplicaciones',exact:true});
      const calendar=page.getByRole('complementary',{name:'Próximas actividades',exact:true});
      await white(activity);await white(calendar);
      await white(page.getByRole('region',{name:'Aplicaciones autorizadas',exact:true}));
      assert.equal(await page.locator('#main-content').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(244, 246, 251)');
      assert.ok(await page.getByRole('navigation',{name:'Accesos de mi espacio'}).getByRole('link').count()>0);
      const cards=await page.getByRole('group',{name:'Indicadores de tickets'}).getByRole('article').all();
      assert.equal(cards.length,4);
      for (const card of cards) {
        await white(card);assert.ok((await card.boundingBox()).height>=129);
      }
      const heading=page.getByRole('heading',{name:/Hola,/});
      assert.equal(await heading.evaluate(el=>getComputedStyle(el.parentElement.parentElement).borderLeftWidth),'4px');
      if(index===6) {
        const texts=await page.locator('#main-content section[aria-labelledby]').allTextContents();
        assert.ok(texts[0].startsWith('Acciones recientes'), 'El orden de lectura conserva la prioridad del usuario');
      }
      await page.screenshot({path:path.join(out,'inicio-'+index+'.png'),fullPage:true});
    }
    for(const width of [1920,1440,1024,768,390]) {
      await page.setViewportSize({width,height:1000});await visit('/home');await fits();
      await page.screenshot({path:path.join(out,'inicio-'+width+'.png'),fullPage:true});
    }
    await page.setViewportSize({width:1440,height:1000});
    await visit('/espacio/asignacion');
    await white(page.getByRole('navigation',{name:'Bandejas de tickets'}).locator('..'));
    await visit('/tickets-creation');
    const drop=page.getByRole('button',{name:/Arrastra tu archivo/});
    await drop.focus();
    const chosen=page.waitForEvent('filechooser');await page.keyboard.press('Enter');await (await chosen).setFiles([]);
    assert.equal(await drop.evaluate(el=>getComputedStyle(el).borderTopWidth),'1px');
    assert.equal(await drop.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(248, 250, 255)');
    await page.screenshot({path:path.join(out,'crear-ticket.png'),fullPage:true});
    assert.deepEqual(errors,[]);
    await fs.writeFile(path.join(out,'resultado.json'),JSON.stringify({roles:7,anchos:[1920,1440,1024,768,390],superficies:'OK',ordenLectura:'OK',adjuntosTeclado:'OK',erroresReact:errors},null,2));
    console.log('FIDELIDAD_BROWSER_OK; 7 perfiles, superficies, orden de lectura, 5 anchos y adjuntos por teclado');
  } finally {await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
