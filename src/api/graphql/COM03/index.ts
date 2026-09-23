/**
 * Exportaciones de queries y types para COM03 - Comunicación / Noticias
 */

export { GET_NOTICIAS_QUERY } from './getNoticias';
export { NOTICIAS_DUMMY } from './noticias.dummy';

export type {
    NoticiaListItem,
    NoticiasFilterInput,
    GetNoticiasResponse,
} from './types';

export {
    EstadoNoticia,
    EstadoNoticia as EstadoNoticiaENUM,
    EstadoNotificacion,
} from './types';
