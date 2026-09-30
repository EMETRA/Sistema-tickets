/**
 * Types para COM03 - Comunicación / Noticias
 *
 * Basados en el modelo de datos compartido por backend (TB_NOTICIA, TB_CATEGORIA, TB_ETIQUETA,
 * TB_RECURSO, TB_SECCION_NOTICIA y tablas de relación).
 *
 * TODO [COM03-BACKEND]: aún no existe la API GraphQL. Confirmar nombres de operaciones y campos,
 * si los enums llegan en mayúsculas o minúsculas (en la BD son minúsculas), qué representa `fecha`
 * en el listado y si la query tendrá paginación.
 */

export enum EstadoNoticia {
  PROGRAMADA = 'PROGRAMADA',
  PUBLICADA = 'PUBLICADA',
  BORRADOR = 'BORRADOR',
  ARCHIVADA = 'ARCHIVADA',
}

/**
 * Estado de la notificación push. Viene de la API de VIVI (confirmado), no de TB_NOTICIA.
 * TODO [COM03-BACKEND]: confirmar los valores reales que devuelve VIVI y mapearlos aquí.
 */
export enum EstadoNotificacion {
  ENVIADO = 'ENVIADO',
  PENDIENTE = 'PENDIENTE',
  ERROR = 'ERROR',
}

/** TB_NOTICIA.VISIBILIDAD */
export enum VisibilidadNoticia {
  PUBLICA = 'publica',
  PRIVADA = 'privada',
}

/** TB_RECURSO.tipo */
export enum TipoRecurso {
  IMAGEN = 'imagen',
  VIDEO = 'video',
  ARCHIVO = 'archivo',
  EXTERNO = 'externo',
}

/** Noticia del listado (TB_NOTICIA). No incluye la notificación push: esa viene de VIVI. */
export interface NoticiaListItem {
  id: string;
  titulo: string;
  estado: EstadoNoticia;
  /** Nombre del autor (texto libre) */
  autor: string;
  /** ISO 8601; null cuando aún no aplica (p. ej. borradores) */
  fecha: string | null;
}

/** Estado de la push de una noticia, según VIVI */
export interface EstadoNotificacionNoticia {
  noticiaId: string;
  estado: EstadoNotificacion;
}

/** Fila del listado: la noticia + el estado de su push (null = sin notificación o sin dato) */
export interface NoticiaListRow extends NoticiaListItem {
  estadoNotificacion: EstadoNotificacion | null;
}

export interface NoticiasFilterInput {
  estado?: EstadoNoticia | null;
  busqueda?: string | null;
}

export interface GetNoticiasResponse {
  noticias: NoticiaListItem[];
}

// ============================================
// CATÁLOGOS
// ============================================

/** TB_CATEGORIA: árbol de categorías (raíz = sin categoriaPadreId) */
export interface CategoriaNoticia {
  id: string;
  nombre: string;
  slug: string;
  categoriaPadreId: string | null;
}

/** TB_ETIQUETA */
export interface EtiquetaNoticia {
  id: string;
  nombre: string;
  slug: string;
}

export interface GetCategoriasNoticiaResponse {
  categoriasNoticia: CategoriaNoticia[];
}

export interface GetEtiquetasNoticiaResponse {
  etiquetasNoticia: EtiquetaNoticia[];
}

// ============================================
// DETALLE (modo edición)
// ============================================

/**
 * TB_RECURSO. No incluye nombre de archivo ni tamaño: el nombre visible se obtiene de la URL.
 */
export interface RecursoNoticia {
  id: string;
  tipo: TipoRecurso;
  url: string;
  tipoMime: string | null;
  ancho: number | null;
  alto: number | null;
  duracionSegundos: number | null;
  textoAlternativo: string | null;
  pieImagen: string | null;
  creditos: string | null;
}

/** TB_SECCION_NOTICIA */
export interface SeccionNoticia {
  id: string;
  orden: number;
  encabezado: string;
  contenidoHtml: string;
  recurso: RecursoNoticia | null;
}

/**
 * TODO [COM03-BACKEND]: estructura propuesta. En la BD las categorías y etiquetas son N:M
 * (TB_NOTICIA_CATEGORIA / TB_NOTICIA_ETIQUETA) y los recursos se asocian con un rol
 * (TB_NOTICIA_RECURSO: principal, galeria, adjunto, og).
 */
export interface NoticiaDetalle {
  id: string;
  estado: EstadoNoticia;
  titulo: string;
  resumen: string;
  autor: string;
  categoriaId: string | null;
  subcategoriaId: string | null;
  etiquetaIds: string[];
  /** Por defecto es-GT */
  idioma: string;
  visibilidad: VisibilidadNoticia;
  /** YYYY-MM-DD */
  fechaPublicacion: string | null;
  slug: string;
  tiempoLectura: number | null;
  recursoPrincipal: RecursoNoticia | null;
  secciones: SeccionNoticia[];
  /** Recursos con rol galeria */
  galeria: RecursoNoticia[];
  /** Recursos con rol adjunto */
  adjuntos: RecursoNoticia[];
}

export interface GetNoticiaResponse {
  noticia: NoticiaDetalle | null;
}

// ============================================
// MUTACIONES
// ============================================

/**
 * Botón del editor que eligió la persona. No se envía a la API: define qué `estado` se pide
 * y qué textos se muestran (confirmación, carga, resultado).
 */
export enum AccionNoticia {
  BORRADOR = 'BORRADOR',
  PUBLICAR = 'PUBLICAR',
  PROGRAMAR = 'PROGRAMAR',
}

/**
 * Valores de `estado` y `visibilidad` en la API de noticias (README de backend, 2026-09-30).
 * Van en minúsculas. TODO [COM03-BACKEND]: `EstadoNoticia` (mayúsculas) se alinea a estos
 * valores cuando se conecten las lecturas del listado (pendiente con backend).
 */
export type EstadoNoticiaCms = 'borrador' | 'programada' | 'publicada' | 'archivada';
export type VisibilidadNoticiaCms = 'publica' | 'privada';

/**
 * Sección en `NoticiaCmsInput`. Si se envía `secciones`, reemplaza todas las de la noticia.
 * Lleva `recurso_id` (imagen) **o** `video_url` (YouTube), nunca los dos.
 */
export interface SeccionNoticiaCmsInput {
  /** Obligatorio */
  orden: number;
  encabezado?: string;
  contenido_html?: string;
  /** Imagen de la sección; null la quita. */
  recurso_id?: number | null;
  /** TODO [COM03-BACKEND]: propuesta enviada a backend (2026-09-30), pendiente de confirmar. */
  video_url?: string;
}

/**
 * Item de la galería: imagen (`recurso_id`) **o** video de YouTube (`video_url`).
 * TODO [COM03-BACKEND]: `galeria` aún no está en `NoticiaCmsInput`; propuesta enviada a backend
 * (2026-09-30). Si viene, reemplaza la galería completa; si no viene, queda igual.
 */
export type GaleriaItemCmsInput =
  | { orden: number; recurso_id: number }
  | { orden: number; video_url: string };

/**
 * Input de `guardarNoticiaCms` (README de backend, 2026-09-30).
 * Sin `id` = crear (slug y titulo obligatorios); con `id` = actualizar.
 * TODO [COM03-BACKEND]: pendientes con backend:
 *   - `autor` (texto libre en el formulario) no está en el input.
 *   - `galeria` y los videos de YouTube (`video_url`): propuesta enviada (2026-09-30).
 *   - Cómo se suben las imágenes para obtener su `recurso_id` (lo definen Feyser y backend).
 */
export interface NoticiaCmsInput {
  id?: number;
  slug: string;
  titulo: string;
  resumen?: string;
  estado?: EstadoNoticiaCms;
  visibilidad?: VisibilidadNoticiaCms;
  /** ISO 8601, p. ej. "2026-09-30T06:00:00.000Z" (00:00 hora de Guatemala). Puede ir vacía. */
  fecha_publicacion?: string | null;
  idioma?: string;
  tiempo_lectura?: number | null;
  /** Imagen principal; null la quita. Excluyente con `recurso_principal`. */
  recurso_principal_id?: number | null;
  /**
   * Video principal de YouTube; null quita el recurso principal.
   * TODO [COM03-BACKEND]: propuesta enviada a backend (2026-09-30), pendiente de confirmar.
   */
  recurso_principal?: { video_url: string } | null;
  /** Categoría y subcategoría (TB_CATEGORIA es un árbol). */
  categoriasIds?: number[];
  etiquetasIds?: number[];
  secciones?: SeccionNoticiaCmsInput[];
  /** TODO [COM03-BACKEND]: propuesta enviada a backend, ver GaleriaItemCmsInput. */
  galeria?: GaleriaItemCmsInput[];
}

export interface GuardarNoticiaCmsVariables {
  /**
   * La genera el front por intento de guardado (1 a 180 caracteres) y se reenvía igual en cada
   * reintento, para que backend responda `idempotente: true` en lugar de duplicar.
   */
  claveIdempotente: string;
  noticia: NoticiaCmsInput;
}

/** `guardada` = borrador, programada, o publicada sin quedar visible (privada o fecha futura). */
export type ResultadoGuardarNoticiaCms = 'guardada' | 'publicada';

export interface PublicacionNoticiaCms {
  idNoticia: number;
  version: number;
  claveIdempotente: string;
  idEvento: number;
  idUsuario: number;
}

export interface GuardarNoticiaCmsResult {
  resultado: ResultadoGuardarNoticiaCms;
  /** true = la misma clave ya se había procesado; también es éxito. */
  idempotente: boolean;
  noticia: {
    id: number;
    slug: string;
    idioma: string;
    estado: EstadoNoticiaCms;
    visibilidad: VisibilidadNoticiaCms;
    fecha_publicacion: string | null;
  };
  /** Solo cuando `resultado` es "publicada". */
  publicacion: PublicacionNoticiaCms | null;
}

export interface GuardarNoticiaCmsResponse {
  guardarNoticiaCms: GuardarNoticiaCmsResult;
}

/** Códigos de error de la API de noticias que el admin debe mostrar (README). */
export type CodigoErrorNoticiaCms =
  | 'VALIDATION_ERROR'
  | 'INTERNAL_UNAUTHORIZED'
  | 'NEWS_NOT_FOUND'
  | 'SLUG_IDIOMA_CONFLICT'
  | 'NEWS_NOT_PUBLISHABLE'
  | 'PUBLISH_TRANSACTION_FAILED';

// ============================================
// LECTURAS DEL EDITOR (api-portal REST, README de backend)
// TODO [COM03-BACKEND]: sin conectar. Falta confirmar cómo las llama Sistema-tickets
// (URL base y autenticación). Hoy los Route Handlers devuelven datos dummy.
// ============================================

/** GET /taxonomy/categories */
export interface CategoriaCmsDto {
  id: number;
  nombre: string;
  slug: string;
  /** Id de la categoría padre; null = raíz. */
  padre: number | null;
}

/** GET /taxonomy/tags */
export interface EtiquetaCmsDto {
  id: number;
  nombre: string;
  slug: string;
}

/** Respuesta paginada de GET /news (listado admin). */
export interface ListaPaginadaCmsDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ArchivarNoticiaResponse {
  archivarNoticia: {
    id: string;
    estado: EstadoNoticia;
  };
}

/** restaurarNoticia devuelve la noticia en BORRADOR */
export interface RestaurarNoticiaResponse {
  restaurarNoticia: {
    id: string;
    estado: EstadoNoticia;
  };
}

export interface EliminarNoticiaResponse {
  eliminarNoticia: boolean;
}
