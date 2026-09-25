import { EstadoNoticia, TipoRecurso, VisibilidadNoticia, type NoticiaDetalle, type RecursoNoticia } from './types';
import { NOTICIAS_DUMMY } from './noticias.dummy';
import { slugify } from '@/helpers/slugify';

const recursoDummy = (id: string, tipo: TipoRecurso, url: string, tipoMime: string): RecursoNoticia => ({
    id,
    tipo,
    url,
    tipoMime,
    ancho: null,
    alto: null,
    duracionSegundos: null,
    textoAlternativo: null,
    pieImagen: null,
    creditos: null,
});

/**
 * TODO [COM03-BACKEND]: detalle dummy para el modo edición (contenido del formulario en Figma).
 * Eliminar este archivo cuando exista la query `noticia(id)` en backend.
 */
export function getNoticiaDummy(id: string): NoticiaDetalle | null {
    const item = NOTICIAS_DUMMY.find((noticia) => noticia.id === id);
    if (!item) return null;

    return {
        id: item.id,
        estado: item.estado,
        titulo: item.titulo,
        resumen: 'Texto de prueba con el resumen de la noticia.',
        autor: item.autor,
        categoriaId: '1',
        subcategoriaId: null,
        etiquetaIds: ['1', '2'],
        idioma: 'es-GT',
        visibilidad: VisibilidadNoticia.PUBLICA,
        fechaPublicacion: item.fecha ? item.fecha.slice(0, 10) : null,
        slug: slugify(item.titulo),
        tiempoLectura: item.estado === EstadoNoticia.BORRADOR ? null : 4,
        recursoPrincipal: recursoDummy(`principal-${item.id}`, TipoRecurso.IMAGEN, '/recursos/portada.jpg', 'image/jpeg'),
        secciones: [
            {
                id: `seccion-${item.id}-1`,
                orden: 1,
                encabezado: 'Antes: cómo funcionaba',
                contenidoHtml: '<p>Texto de prueba con el contenido de la primera sección.</p>',
                recurso: null,
            },
            {
                id: `seccion-${item.id}-2`,
                orden: 2,
                encabezado: 'Ahora: qué cambia',
                contenidoHtml: '<p>Texto de prueba con el contenido de la segunda sección.</p>',
                recurso: null,
            },
        ],
        galeria: [
            recursoDummy(`galeria-${item.id}-1`, TipoRecurso.VIDEO, '/recursos/video-recorrido.mp4', 'video/mp4'),
        ],
        adjuntos: [],
    };
}
