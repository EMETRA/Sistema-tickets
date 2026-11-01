const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
const load=require('../test/integracion/load-ts.cjs')(root);
const {APPS_CATALOG_DUMMY:catalog}=load('src/api/graphql/home/appsCatalog.dummy.ts');
const source=ts.createSourceFile('app-registry.ts',fs.readFileSync(path.join(root,'src/config/app-registry.ts'),'utf8'),ts.ScriptTarget.Latest,true);
let modules=[];
function visit(node){if(ts.isVariableDeclaration(node)&&node.name.getText(source)==='APP_REGISTRY'&&ts.isObjectLiteralExpression(node.initializer)){modules=node.initializer.properties.filter(ts.isPropertyAssignment).map(p=>p.name.text);}ts.forEachChild(node,visit);}
visit(source);assert.ok(modules.length>0);
const routes=[];
for(const[appId,app]of Object.entries(catalog))for(const[sectionId,section]of Object.entries(app.sections))for(const module of section.modules){assert.ok(modules.includes(module.id),'Módulo sin vista registrada: '+module.id);routes.push({module:module.id,title:module.title,path:`/home/${appId}/${sectionId}/${module.id}`});}
for(const id of modules)assert.ok(routes.some(r=>r.module===id),'Vista registrada sin ruta en el catálogo: '+id);
const {PAGES_CONFIG,ROLE_LAYOUTS}=load('src/config/navigation.ts');
for(const ids of Object.values(ROLE_LAYOUTS))for(const id of ids){const route=PAGES_CONFIG[id];assert.ok(route,'Metadata faltante: '+id);const page=path.join(root,'src/app/(dashboard)',route.path.slice(1),'page.tsx');assert.ok(fs.existsSync(page),'Enlace de menú sin página: '+route.path);}
const result={modules:modules.length,moduleRoutes:routes,roleMenus:Object.fromEntries(Object.entries(ROLE_LAYOUTS).map(([role,ids])=>[role,ids.map(id=>PAGES_CONFIG[id].path)])),catalogStatus:'MANIFIESTO_ESTATICO_LEGADO; NO ES AUTORIZACION'};
if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(result,null,2));else console.log(`COBERTURA_RUTAS_OK; modulos=${modules.length}; rutas=${routes.length}; roles=${Object.keys(ROLE_LAYOUTS).length}`);
