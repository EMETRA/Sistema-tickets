// Contratos ficticios del laboratorio local; sin Oracle ni cambios institucionales.
const catalog=[['Mantenimiento','#4763E4'],['Reporte','#137F81'],['Formulario','#7955C4'],['Instalación','#1D7FBB'],['Limpieza','#19856C'],['Diagnóstico','#A86B17']].map(([nombre,color],i)=>({id:String(i+1),nombre,color}));
const labels=t=>catalog.filter(tag=>(t.tagIds||[]).includes(Number(tag.id)));
const canEdit=(a,t)=>Boolean(t.usuarioAsignadoId && [2,3].includes(t.estadoId) && (a.admin || (t.usuarioAsignadoId===a.id && a.permissions.has('TICKETS_ATENDER'))));
function report(s,a,q){
 if(!a.admin)throw Object.assign(Error('Administración requerida.'),{status:403});
 const from=q.get('desde'),to=q.get('hasta'),user=q.get('tecnicoId'),tag=q.get('etiqueta'),offset=Number(q.get('offset')||0);
 if(!Number.isFinite(Date.parse(from))||!Number.isFinite(Date.parse(to))||+new Date(to)<=+new Date(from)||+new Date(to)-+new Date(from)>366*86400000||!Number.isInteger(offset)||offset<0)throw Object.assign(Error('Periodo o página inválidos.'),{status:400});
 const source=s.tickets.filter(t=>t.estadoId===5 && t.fechaCierre && +new Date(t.fechaCierre)>=+new Date(from) && +new Date(t.fechaCierre)<+new Date(to)).map(t=>{
  const snap=t.clasificacionCierre,id=snap?.usuarioAsignadoId||null;
  return {id:t.id,codigo:t.codigo,titulo:t.titulo,resueltoEn:t.fechaCierre,tecnicoId:id,tecnico:s.users.find(u=>u.id===id)?.nombre||'Sin responsable registrado',etiquetas:snap?.clasificacionVersion===1?(snap.etiquetas.length?snap.etiquetas.map(x=>({id:String(x.id),nombre:x.nombre})):[{id:'sin-etiquetas',nombre:'Sin etiquetas'}]):[{id:'sin-historico',nombre:'Sin clasificación histórica'}]};
 });
 const selected=source.filter(t=>(!user||String(t.tecnicoId)===user)&&(!tag||t.etiquetas.some(item=>item.id===tag)));
 const grouped=new Map();
 for(const ticket of selected)for(const item of ticket.etiquetas.filter(item=>!tag||item.id===tag)){
  const key=JSON.stringify([ticket.tecnicoId,item.id,item.nombre]);
  if(!grouped.has(key))grouped.set(key,{tecnicoId:ticket.tecnicoId,tecnico:ticket.tecnico,etiquetaId:item.id,etiqueta:item.nombre,ids:new Set()});
  grouped.get(key).ids.add(ticket.id);
 }
 const users=new Map(source.filter(t=>t.tecnicoId).map(t=>[t.tecnicoId,t.tecnico]));
 const options=new Map(catalog.map(t=>[t.id,t.nombre]));options.set('sin-historico','Sin clasificación histórica');options.set('sin-etiquetas','Sin etiquetas');
 return {desde:from,hasta:to,tecnicoId:user?Number(user):null,etiqueta:tag,criterio:'RESUELTOS_POR_FECHA_CIERRE',resumen:{tickets:new Set(selected.map(t=>t.id)).size,tecnicos:new Set(selected.filter(t=>t.tecnicoId).map(t=>t.tecnicoId)).size,sinClasificacionHistorica:selected.filter(t=>t.etiquetas.some(item=>item.id==='sin-historico')).length},grupos:[...grouped.values()].map(({ids,...row})=>({...row,tickets:ids.size})).sort((a,b)=>a.tecnico.localeCompare(b.tecnico)||a.etiqueta.localeCompare(b.etiqueta)),opciones:{tecnicos:Array.from(users,([id,nombre])=>({id,nombre})),etiquetas:Array.from(options,([id,nombre])=>({id,nombre}))},items:selected.sort((a,b)=>b.resueltoEn.localeCompare(a.resueltoEn)||b.id-a.id).slice(offset,offset+50).map(t=>({...t,etiquetas:t.etiquetas.map(x=>x.nombre).join(', ')})),total:selected.length,offset,limit:50};
}
module.exports={catalog,labels,canEdit,report};
