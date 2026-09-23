/**
 * Types para COM03 - Comunicación / Noticias
 *
 * TODO [COM03-BACKEND]: tipos provisionales. Confirmar con backend nombres de
 * campos y enums, qué representa `fecha` (publicación / programación / actualización),
 * si `autor` es string u objeto de usuario, y si la query tendrá paginación.
 */

export enum EstadoNoticia {
  PROGRAMADA = 'PROGRAMADA',
  PUBLICADA = 'PUBLICADA',
  BORRADOR = 'BORRADOR',
  ARCHIVADA = 'ARCHIVADA',
}

export enum EstadoNotificacion {
  ENVIADO = 'ENVIADO',
  PENDIENTE = 'PENDIENTE',
  ERROR = 'ERROR',
}

export interface NoticiaListItem {
  id: string;
  titulo: string;
  estado: EstadoNoticia;
  /** null = la noticia no tiene notificación push */
  estadoNotificacion: EstadoNotificacion | null;
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
