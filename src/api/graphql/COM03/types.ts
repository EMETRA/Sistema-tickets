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
  PARCIAL = 'PARCIAL',
  INCIERTA = 'INCIERTA',
  SIN_DESTINATARIOS = 'SIN_DESTINATARIOS',
  SIN_PUBLICACION = 'SIN_PUBLICACION',
  NO_DISPONIBLE = 'NO_DISPONIBLE',
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
  estadoNotificacion?: EstadoNotificacion | null;
  id: string;
  titulo: string;
  estado: EstadoNoticia;
  /** Nombre del autor (texto libre) */
  autor: string;
  /** ISO 8601; null cuando aún no aplica (p. ej. borradores) */
  fecha: string | null;
  /**
   * slug, idioma y visibilidad: archivar y restaurar usan `guardarNoticiaCms`, que los pide siempre
   * (String! en el contrato). TODO [COM03-BACKEND]: confirmar que GET /news los devuelve (#1).
   */
  slug: string;
  /** Ej. "es-GT" */
  idioma: string;
  visibilidad: VisibilidadNoticia;
}

/**
 * Permisos de noticias (PERMISOS_PANEL.md, sección 2). LEER: ver listado y detalle; EDITAR: crear,
 * guardar borrador, archivar y restaurar; PUBLICAR: publicar o programar (junto con EDITAR).
 */
export type PermisoNoticia = 'VIVI_NOTICIAS_LEER' | 'VIVI_NOTICIAS_EDITAR' | 'VIVI_NOTICIAS_PUBLICAR';

export interface GetPermisosNoticiasResponse {
  usuario: { permisos: string[] | null } | null;
  [key: string]: unknown;
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
  page?: number;
  limit?: number;
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
  autores?: { id: number; nombre: string; rol: string; orden: number }[];
  categoriaIdsAdicionales?: string[];
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
 * Enums `EstadoNoticiaCms` y `VisibilidadNoticiaCms` del README "Noticias CMS" (2026-10-06).
 * Van en minúsculas. TODO [COM03-BACKEND]: `EstadoNoticia` (mayúsculas) se alinea a estos
 * valores cuando se conecten las lecturas del listado (pendiente con backend, #1).
 */
export type EstadoNoticiaCms = 'borrador' | 'programada' | 'publicada' | 'archivada';
export type VisibilidadNoticiaCms = 'publica' | 'privada';

/**
 * `SeccionNoticiaCmsInput` (README, sección 3). Si el input trae `secciones`, reemplaza todas
 * las de la noticia; el orden lo da `orden`, no la posición en el arreglo.
 */
export interface SeccionNoticiaCmsInput {
  orden: number;
  encabezado?: string;
  /** Obligatorio en el contrato (String!). */
  contenidoHtml: string;
  /** Imagen de la sección. */
  recursoId?: number | null;
}

/**
 * `GuardarNoticiaCmsInput` (README "Noticias CMS", 2026-10-07, sección 3). Campos en camelCase.
 * Sin `id` = crear (slug y titulo obligatorios); con `id` = actualizar.
 * No se envían `actor`, `idUsuario` ni `permisos`: el servidor resuelve al usuario por la sesión.
 * Imágenes y videos son recursos con id: se envían en `recursoPrincipalId`, `secciones[].recursoId`
 * y `galeriaRecursosIds` (README, sección 4).
 *
 * TODO [COM03-BACKEND]: pendientes con backend (preguntas enviadas a Jenny):
 *   - Subir imágenes y registrar videos desde api-tickets para obtener su id (el Panel no puede
 *     llamar a api-portal; regla de Feyser, 2026-10-07).
 *   - `autores: [{ autorId, rol?, orden? }]`: falta cómo obtener el catálogo de autores.
 */
export interface GuardarNoticiaCmsInput {
  autores?: { autorId: number; rol?: string; orden?: number }[];
  /** 1 a 64 caracteres. La genera el front por intento de guardado (ver NewsFormView). */
  claveIdempotente: string;
  /** Entero > 0. Ausente = crear. */
  id?: number;
  /** Único junto con `idioma`. 1 a 180 caracteres. */
  slug: string;
  /** 1 a 200 caracteres. */
  titulo: string;
  resumen?: string;
  estado: EstadoNoticiaCms;
  visibilidad: VisibilidadNoticiaCms;
  /** ISO 8601, p. ej. "2026-09-30T06:00:00.000Z". Obligatoria si se publica o programa. */
  fechaPublicacion?: string | null;
  /** Ej. "es-GT". */
  idioma: string;
  /** Minutos, ≥ 0. */
  tiempoLectura?: number | null;
  /** Máx. 200. No está en el diseño: no se envía. */
  metaTitulo?: string;
  /** Máx. 300. No está en el diseño: no se envía. */
  metaDescripcion?: string;
  /** Máx. 512. No está en el diseño: no se envía. */
  urlCanonica?: string;
  /** Recurso de portada (imagen principal). */
  recursoPrincipalId?: number | null;
  /** Recurso Open Graph. No está en el diseño: no se envía. */
  recursoOgId?: number | null;
  /** Categoría y subcategoría (TB_CATEGORIA es un árbol). */
  categoriasIds?: number[];
  etiquetasIds?: number[];
  secciones?: SeccionNoticiaCmsInput[];
  /**
   * Imágenes y videos de la galería, en el orden en que se muestran (README 2026-10-07, sección 3).
   * Reemplazo total: omitir = conservar; `[]` = borrar la galería.
   */
  galeriaRecursosIds?: number[];
}

export interface GuardarNoticiaCmsVariables {
  input: GuardarNoticiaCmsInput;
}

/** `guardada` = borrador, privada o programada; `publicada` = ya salió al outbox (README). */
export type ResultadoGuardarNoticiaCms = 'guardada' | 'publicada';

export interface PublicacionNoticiaCms {
  idNoticia: number;
  version: number;
  claveIdempotente: string;
  idEvento: number;
  idUsuario: number;
}

/** `GuardarNoticiaCmsPayload` (README, sección 3). */
export interface GuardarNoticiaCmsResult {
  resultado: ResultadoGuardarNoticiaCms;
  /** true = reintento con la misma clave y el mismo contenido; no volvió a publicar. Es éxito. */
  idempotente: boolean;
  /** `NoticiaCmsResumen` */
  noticia: {
    id: number;
    slug: string;
    idioma: string;
    estado: EstadoNoticiaCms;
    visibilidad: VisibilidadNoticiaCms;
    fechaPublicacion: string | null;
  };
  /** Solo cuando `resultado` es "publicada". */
  publicacion: PublicacionNoticiaCms | null;
}

export interface GuardarNoticiaCmsResponse {
  guardarNoticiaCms: GuardarNoticiaCmsResult;
  [key: string]: unknown;
}

/**
 * Códigos de error de `guardarNoticiaCms` (README "Noticias CMS", sección 5). Los demás errores
 * (400 validación, 401 sesión, 403 permiso, 502/503 api-portal) se distinguen por `statusCode`.
 */
export type CodigoErrorNoticiaCms =
  /** 409: ese slug ya existe en ese idioma. */
  | 'SLUG_IDIOMA_CONFLICT'
  /** 409: misma claveIdempotente con contenido distinto. */
  | 'IDEMPOTENCY_CONFLICT'
  /** 404: la noticia a actualizar no existe. */
  | 'NEWS_NOT_FOUND';

// ============================================
// LECTURAS DEL EDITOR (REST de api-tickets hacia el CMS existente de api-portal)
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
