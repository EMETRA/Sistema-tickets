import { graphqlRequestClient, apiFetch } from './client';

export type EvidenciaJuzgado = { id: string; origen: string; mime: string; tamanoBytes: string; estado: string };
export type DocumentoJuzgado = { id: string; tipoDocumento: string; numeroVersion: string; versionPlantilla: string; mime: string; tamanoBytes: string; generadoEn: string };
export type SedeJuzgado = { codigo: string; nombre: string; direccion: string | null; horario: string | null };
export type DetalleJuzgado = {
  codigoCaso: string; estadoCaso: string;
  caso: { id: string; codigoCaso: string; usoPlaca: string; placa: string; regla: string; observaciones: string | null; estado: string; registradaEn: string; evidenciasDenuncia: EvidenciaJuzgado[]; defensa: { id: string; nombreDeclarado: string; argumentos: string; evidencias: EvidenciaJuzgado[] } | null };
  expediente: { id: string; version: string | null; codigoJuzgado: string; nombreJuzgado: string; direccionJuzgado: string | null; horarioJuzgado: string | null; estado: string; idActorReceptor: string; recibidaEn: string; numeroInterno: string | null; observacion: string | null; gestiones: { id: string; idActor: string; tipoGestion: string; ocurridaEn: string; observacion: string | null }[]; resolucion: { id: string; decision: string; fundamento: string; autoridadSnapshot: string; versionPlantilla: string; resueltaEn: string; idActorJuez: string } | null; remision: { ciudad: string; serie: string; numero: string } | null; documentos: DocumentoJuzgado[] } | null;
};
export type RecepcionInput = { codigoCaso: string; codigoJuzgado: string; requestId: string; numeroInterno?: string; observacion?: string };
export type ResolucionInput = { idExpediente: string; fundamento: string; requestId: string; claveIdempotencia: string; versionExpediente?: string };
export type GestionInput = { idExpediente: string; tipoGestion: string; observacion: string; requestId: string };
export type ResultadoJudicial = { idResolucion: string; codigoCaso: string; estadoCaso: string; estadoExpediente: string; decision: string; reutilizada: boolean; estadoDocumento: 'DISPONIBLE' | 'ERROR_REINTENTABLE'; documento: DocumentoJuzgado | null; remision?: { ciudad: string; serie: string; numero: string } };

export const DETALLE_JUZGADO = `query ViviJuzgadoDetalle($codigoCaso: String!) {
 viviJuzgadoDetalle(codigoCaso: $codigoCaso) { codigoCaso estadoCaso
  caso { id codigoCaso usoPlaca placa regla observaciones estado registradaEn
   evidenciasDenuncia { id origen mime tamanoBytes estado }
   defensa { id nombreDeclarado argumentos evidencias { id origen mime tamanoBytes estado } }
  }
  expediente { id version codigoJuzgado nombreJuzgado direccionJuzgado horarioJuzgado estado idActorReceptor recibidaEn numeroInterno observacion
   gestiones { id idActor tipoGestion ocurridaEn observacion }
   resolucion { id decision fundamento autoridadSnapshot versionPlantilla resueltaEn idActorJuez }
   remision { ciudad serie numero }
   documentos { id tipoDocumento numeroVersion versionPlantilla mime tamanoBytes generadoEn }
  }
 }
}`;
export async function consultarCasoJuzgado(codigoCaso: string): Promise<DetalleJuzgado> {
  const data = await graphqlRequestClient<{ viviJuzgadoDetalle: DetalleJuzgado }>(DETALLE_JUZGADO, { variables: { codigoCaso } });
  if (data?.viviJuzgadoDetalle?.codigoCaso !== codigoCaso) throw new Error('No se recibió el caso solicitado');
  return data.viviJuzgadoDetalle;
}
export async function consultarSedesJuzgado(): Promise<SedeJuzgado[]> {
  const data = await graphqlRequestClient<{ viviJuzgadoSedes: SedeJuzgado[] }>('query ViviJuzgadoSedes { viviJuzgadoSedes { codigo nombre direccion horario } }');
  return data.viviJuzgadoSedes;
}
export async function recibirCasoJuzgado(input: RecepcionInput) {
  return graphqlRequestClient(`mutation RecibirCaso($input: RegistrarRecepcionJuzgadoInput!) { viviJuzgadoRegistrarRecepcion(input: $input) { idExpediente codigoCaso estado estadoCaso reutilizada } }`, { variables: { input } });
}
export async function registrarGestionJuzgado(input: GestionInput) {
  return graphqlRequestClient(`mutation RegistrarGestion($input: RegistrarGestionJuzgadoInput!) { viviJuzgadoRegistrarGestion(input: $input) { idGestion idExpediente tipoGestion estadoExpediente reutilizada } }`, { variables: { input } });
}
export async function resolverCasoJuzgado(decision: 'ACOGIDA' | 'NO_ACOGIDA', input: ResolucionInput): Promise<ResultadoJudicial> {
  const operation = decision === 'ACOGIDA' ? 'viviJuzgadoResolverAcogida' : 'viviJuzgadoResolverNoAcogida';
  const type = decision === 'ACOGIDA' ? 'ResolverAcogidaInput' : 'ResolverNoAcogidaInput';
  const data = await graphqlRequestClient<Record<string, ResultadoJudicial>>(`mutation ResolverCaso($input: ${type}!) { ${operation}(input: $input) { idResolucion codigoCaso estadoCaso estadoExpediente decision reutilizada estadoDocumento documento { id tipoDocumento numeroVersion versionPlantilla mime tamanoBytes generadoEn } ${decision === 'NO_ACOGIDA' ? 'remision { ciudad serie numero }' : ''} } }`, { variables: { input } });
  return data[operation];
}
export function generarDocumentoJuzgado(id: string) {
  return apiFetch<DocumentoJuzgado>(`/api/JUZ01/resoluciones/${encodeURIComponent(id)}/documento/generar`, undefined, { method: 'POST' });
}
export async function descargarArchivoJuzgado(tipo: 'evidencias' | 'documentos', id: string, nombre: string) {
  const { useAuthStore } = await import('@/store/useAuthStore');
  const token = useAuthStore.getState().token;
  const response = await fetch(`/api/JUZ01/${tipo}/${encodeURIComponent(id)}`, { headers: token ? { Authorization: `Bearer ${token}` } : {}, cache: 'no-store' });
  if (!response.ok) throw new Error('No se pudo descargar el archivo privado. Intenta de nuevo.');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = nombre;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function idSolicitudJuzgado(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return 'juz-' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
export function mensajeJuzgado(error: unknown): string {
  const e = error as { statusCode?: number; graphQLErrors?: { extensions?: { code?: string; originalError?: { statusCode?: number } } }[] };
  const ext = e.graphQLErrors?.[0]?.extensions;
  const status = e.statusCode || ext?.originalError?.statusCode;
  if (status === 401 || ext?.code === 'UNAUTHENTICATED') return 'La sesión venció. Vuelve a iniciar sesión.';
  if (status === 403 || ext?.code === 'FORBIDDEN') return 'Tu cuenta no tiene permiso para esta operación.';
  if (status === 404) return 'No se encontró el caso o expediente solicitado.';
  if (status === 409) return 'El expediente cambió o ya tiene otra actuación. Consulta su estado actual antes de continuar.';
  if (status === 400) return 'Revisa los datos de la actuación y vuelve a intentar.';
  return 'No se pudo completar la operación. Puedes reintentar la misma solicitud o consultar el estado actual del caso.';
}
