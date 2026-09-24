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
 * TODO [COM03-BACKEND]: inputs y respuestas propuestos. Confirmar nombres, cómo se reciben
 * los archivos (Upload por multipart) y si hay una sola mutación con acción o varias.
 */
export enum AccionNoticia {
  BORRADOR = 'BORRADOR',
  PUBLICAR = 'PUBLICAR',
  PROGRAMAR = 'PROGRAMAR',
}

/**
 * Recurso de la noticia: uno existente (recursoId) o un archivo nuevo (archivo, Upload).
 * `archivo` va en null en las variables y el archivo real se envía por multipart (fileMap).
 */
export interface RecursoNoticiaInput {
  recursoId: string | null;
  archivo: null;
}

export interface SeccionNoticiaInput {
  /** null = sección nueva */
  id: string | null;
  orden: number;
  encabezado: string;
  contenidoHtml: string;
  recurso: RecursoNoticiaInput | null;
}

export interface GuardarNoticiaInput {
  /** null = crear; con valor = editar */
  id: string | null;
  /**
   * TODO [COM03-BACKEND]: UUID del intento de envío. Se repite igual en cada "Reintentar"
   * para que backend descarte duplicados (p. ej. si publicó pero la respuesta no llegó).
   * Backend debe implementar la deduplicación por esta clave.
   */
  claveIdempotencia: string;
  accion: AccionNoticia;
  titulo: string;
  resumen: string;
  autor: string;
  categoriaId: string | null;
  subcategoriaId: string | null;
  etiquetaIds: string[];
  idioma: string;
  visibilidad: string;
  /** YYYY-MM-DD */
  fechaPublicacion: string | null;
  slug: string;
  tiempoLectura: number | null;
  recursoPrincipal: RecursoNoticiaInput | null;
  secciones: SeccionNoticiaInput[];
  /** El orden de la lista es el orden de la galería (TB_NOTICIA_RECURSO.orden, rol galeria) */
  galeria: RecursoNoticiaInput[];
}

export interface GuardarNoticiaResponse {
  guardarNoticia: {
    id: string;
    estado: EstadoNoticia;
  };
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
