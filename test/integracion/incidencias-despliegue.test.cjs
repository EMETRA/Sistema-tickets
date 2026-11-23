const test=require('node:test');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const path=require('node:path');
test('la habilitación de incidencias solo agrega su volumen y rechaza alterar montajes existentes',()=>{
  const script=path.resolve(__dirname,'../../scripts/actualizar-servicio-preservando.py');
  const py=`import runpy,sys
m=runpy.run_path(sys.argv[1])
v=m['validar_montajes']
old=[dict(Type='bind',Destination='/app/uploads',Source='/tmp/archivos-existentes',RW=True)]
base=dict(services={'sistema-tickets-web':dict(volumes=[dict(type='bind',source='/tmp/archivos-existentes',target='/app/uploads')])},volumes={'tickets-incidencias':dict(name='proyecto_tickets-incidencias')})
v(base,'sistema-tickets-web',old)
base['services']['sistema-tickets-web']['volumes'].append(dict(type='volume',source='tickets-incidencias',target='/var/lib/tickets-incidencias'))
try: v(base,'sistema-tickets-web',old); raise AssertionError('Se agregó volumen sin opt-in')
except RuntimeError: pass
assert len(v(base,'sistema-tickets-web',old,True))==2
base['services']['sistema-tickets-web']['volumes'][0]['source']='/tmp/otra-carpeta'
try: v(base,'sistema-tickets-web',old,True); raise AssertionError('Se alteró un montaje existente')
except RuntimeError: pass
print('MONTAJES_INCIDENCIAS_OK')
`;
  assert.match(execFileSync('python3',['-c',py,script],{encoding:'utf8'}),/MONTAJES_INCIDENCIAS_OK/);
});
