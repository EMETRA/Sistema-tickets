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
 * TODO [COM03-BACKEND]: TB_NOTICIA no tiene un campo de estado de la notificación push.
 * Confirmar de dónde sale (¿servicio de push / VIVI?) o si se elimina la columna del listado.
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

export interface NoticiaListItem {
  id: string;
  titulo: string;
  estado: EstadoNoticia;
  /** null = la noticia no tiene notificación push */
  estadoNotificacion: EstadoNotificacion | null;
  /** Nombre del autor (texto libre) */
  autor: string;
  /** ISO 8601; null cuando aún no aplica (p. ej. borradores) */
  fecha: string | null;
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
