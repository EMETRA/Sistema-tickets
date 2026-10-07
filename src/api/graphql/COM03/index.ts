/**
 * Exportaciones de queries y types para COM03 - Comunicación / Noticias
 */

export { GET_NOTICIAS_QUERY } from './getNoticias';
export { GET_NOTICIA_QUERY } from './getNoticia';
export { GET_CATEGORIAS_NOTICIA_QUERY, GET_ETIQUETAS_NOTICIA_QUERY } from './getCatalogos';
export { GET_PERMISOS_NOTICIAS_QUERY } from './getPermisos';
export { PERMISOS_SIMULADOS } from './permisos.dummy';
export {
    GUARDAR_NOTICIA_CMS_MUTATION,
} from './mutations';
export { cambioEstadoInput } from './cambioEstado';
export { NOTICIAS_DUMMY, NOTIFICACIONES_DUMMY } from './noticias.dummy';
export { getNoticiaDummy } from './noticia.dummy';
export { CATEGORIAS_NOTICIA_DUMMY, ETIQUETAS_NOTICIA_DUMMY } from './catalogos.dummy';
export { NoticiaCmsError, toNoticiaCmsError } from './noticiaCmsError';

export type {
    NoticiaListItem,
    NoticiaListRow,
    PermisoNoticia,
    GetPermisosNoticiasResponse,
    EstadoNotificacionNoticia,
    NoticiasFilterInput,
    GetNoticiasResponse,
    CategoriaNoticia,
    EtiquetaNoticia,
    GetCategoriasNoticiaResponse,
    GetEtiquetasNoticiaResponse,
    RecursoNoticia,
    SeccionNoticia,
    NoticiaDetalle,
    GetNoticiaResponse,
    EstadoNoticiaCms,
    VisibilidadNoticiaCms,
    SeccionNoticiaCmsInput,
    GuardarNoticiaCmsInput,
    GuardarNoticiaCmsVariables,
    ResultadoGuardarNoticiaCms,
    PublicacionNoticiaCms,
    GuardarNoticiaCmsResult,
    GuardarNoticiaCmsResponse,
    CodigoErrorNoticiaCms,
    CategoriaCmsDto,
    EtiquetaCmsDto,
    ListaPaginadaCmsDto,
} from './types';

export {
    EstadoNoticia,
    EstadoNoticia as EstadoNoticiaENUM,
    EstadoNotificacion,
    VisibilidadNoticia,
    TipoRecurso,
    AccionNoticia,
} from './types';
