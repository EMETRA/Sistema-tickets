import { EstadoNoticia, EstadoNotificacion, VisibilidadNoticia, TipoRecurso } from '@/api/graphql/COM03/types';
import type { CategoriaNoticia, NoticiaDetalle, NoticiaListItem, RecursoNoticia } from '@/api/graphql/COM03/types';
export type CmsResourceDto = {
    id: number; tipo: string; url: string; tipo_mime?: string | null; ancho?: number | null; alto?: number | null;
    duracion_segundos?: number | null; texto_alternativo?: string | null; pie_imagen?: string | null; creditos?: string | null;
};
export type CmsNewsDto = {
    id: number; titulo: string; slug: string; idioma: string; estado: string; visibilidad: string;
    resumen?: string | null; fecha_publicacion?: string | null; tiempo_lectura?: number | null;
    autor?: { id: number; nombre: string } | null;
    autores?: { id: number; nombre: string; rol: string; orden: number }[];
    categorias?: { id: number; nombre: string; slug: string }[]; etiquetas?: { id: number }[];
    recurso_principal?: CmsResourceDto | null;
    secciones?: { id: number; orden: number; encabezado?: string | null; contenido_html?: string | null; recurso?: CmsResourceDto | null }[];
    galeria?: { orden: number; recurso: CmsResourceDto }[];
    notificacionPush?: { estado: string; versionPublicacion?: number; alcance?: string };
};
const pushStates: Record<string, EstadoNotificacion> = {
    enviada: EstadoNotificacion.ENVIADO, pendiente: EstadoNotificacion.PENDIENTE, fallida: EstadoNotificacion.ERROR,
    parcial: EstadoNotificacion.PARCIAL, incierta: EstadoNotificacion.INCIERTA,
    sin_destinatarios: EstadoNotificacion.SIN_DESTINATARIOS, sin_publicacion: EstadoNotificacion.SIN_PUBLICACION,
    no_disponible: EstadoNotificacion.NO_DISPONIBLE,
};
export function estadoPush(estado?: string): EstadoNotificacion { return pushStates[estado || ''] || EstadoNotificacion.NO_DISPONIBLE; }
export function cmsMediaUrl(url: string): string { return url.startsWith('/uploads/noticias/') ? `/api/COM03/media/${url.slice('/uploads/'.length)}` : url; }
export function mapRecurso(dto?: CmsResourceDto | null): RecursoNoticia | null {
    if (!dto) return null;
    return {
        id: String(dto.id), tipo: dto.tipo as TipoRecurso, url: cmsMediaUrl(dto.url), tipoMime: dto.tipo_mime ?? null,
        ancho: dto.ancho ?? null, alto: dto.alto ?? null, duracionSegundos: dto.duracion_segundos ?? null,
        textoAlternativo: dto.texto_alternativo ?? null, pieImagen: dto.pie_imagen ?? null, creditos: dto.creditos ?? null,
    };
}
export function mapNoticia(dto: CmsNewsDto): NoticiaListItem {
    return {
        id: String(dto.id), titulo: dto.titulo, slug: dto.slug, idioma: dto.idioma,
        estado: dto.estado.toUpperCase() as EstadoNoticia, visibilidad: dto.visibilidad as VisibilidadNoticia,
        autor: dto.autor?.nombre || '', fecha: dto.fecha_publicacion ?? null,
        estadoNotificacion: estadoPush(dto.notificacionPush?.estado),
    };
}
export function mapDetalle(dto: CmsNewsDto, categorias: CategoriaNoticia[]): NoticiaDetalle {
    const ids = (dto.categorias || []).map(c => String(c.id));
    const root = ids.find(id => categorias.find(c => c.id === id)?.categoriaPadreId === null) || null;
    const child = root ? ids.find(id => categorias.find(c => c.id === id)?.categoriaPadreId === root && id !== root) || null : null;
    return {
        ...mapNoticia(dto), resumen: dto.resumen || '', categoriaId: root, subcategoriaId: child,
        categoriaIdsAdicionales: ids.filter(id => id !== root && id !== child),
        etiquetaIds: (dto.etiquetas || []).map(e => String(e.id)), fechaPublicacion: dto.fecha_publicacion ?? null,
        tiempoLectura: dto.tiempo_lectura ?? null, recursoPrincipal: mapRecurso(dto.recurso_principal), autores: dto.autores || [],
        secciones: (dto.secciones || []).map(s => ({ id: String(s.id), orden: s.orden, encabezado: s.encabezado || '', contenidoHtml: s.contenido_html || '', recurso: mapRecurso(s.recurso) })),
        galeria: [...(dto.galeria || [])].sort((a,b) => a.orden-b.orden).flatMap(g => { const r = mapRecurso(g.recurso); return r ? [r] : []; }), adjuntos: [],
    };
}
export type CmsCategoryDto = { id: number; nombre: string; slug: string; padre?: { id: number } | number | null };
export function mapCategoria(c: CmsCategoryDto): CategoriaNoticia {
    const padre = typeof c.padre === 'object' ? c.padre?.id : c.padre;
    return { id: String(c.id), nombre: c.nombre, slug: c.slug, categoriaPadreId: padre == null ? null : String(padre) };
}
