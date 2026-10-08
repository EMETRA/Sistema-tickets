import type { DetalleJuzgado, EvidenciaJuzgado } from './juzgado';
function fechaGuatemala(value: string) {
  const date = new Date(value);
  return /T.*Z$/.test(value) && Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('es-GT', { timeZone: 'America/Guatemala', dateStyle: 'short', timeStyle: 'short' }).format(date)
    : value;
}
export function mapearCasoJuzgado(detalle: DetalleJuzgado) {
  const { caso, expediente } = detalle;
  const archivo = (e: EvidenciaJuzgado) => ({ id: e.id, name: `Evidencia ${e.id}`, sourceUrl: '', size: e.tamanoBytes, mime: e.mime });
  const documento = expediente?.documentos.filter(d => d.tipoDocumento === 'RESOLUCION').sort((a, b) => Number(b.numeroVersion) - Number(a.numeroVersion))[0];
  return {
    caseNumber: detalle.codigoCaso, status: detalle.estadoCaso,
    caseDate: fechaGuatemala(caso.registradaEn), place: expediente?.nombreJuzgado || 'Sin recepción presencial',
    title: `Regla ${caso.regla}`, placa: `${caso.usoPlaca}-${caso.placa}`,
    tags: [{ id: 'caso', nombre: detalle.estadoCaso }, ...(expediente ? [{ id: 'expediente', nombre: expediente.estado }] : [])],
    denuncia: { descripción: caso.observaciones || 'Sin observaciones registradas', evidencias: caso.evidenciasDenuncia.filter(e => e.estado === 'DISPONIBLE').map(archivo) },
    defensa: caso.defensa ? { ...caso.defensa, evidencias: caso.defensa.evidencias.filter(e => e.estado === 'DISPONIBLE').map(archivo) } : null,
    logs: expediente?.gestiones.map(g => ({ userName: `Actor ${g.idActor}`, email: 'No disponible', action: g.tipoGestion, date: fechaGuatemala(g.ocurridaEn), note: g.observacion || '—' })) || [],
    resolucion: expediente?.resolucion ? { id: expediente.resolucion.id, fecha: fechaGuatemala(expediente.resolucion.resueltaEn), comentario: expediente.resolucion.fundamento, plantilla: expediente.resolucion.versionPlantilla, file: documento ? { id: documento.id, name: `resolucion-${detalle.codigoCaso}.pdf` } : null } : null,
    multa: expediente?.remision ? { ...expediente.remision, placa: `${caso.usoPlaca}-${caso.placa}` } : null,
  };
}
