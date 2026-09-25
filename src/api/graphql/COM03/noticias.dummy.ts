import { EstadoNoticia, EstadoNotificacion, type EstadoNotificacionNoticia, type NoticiaListItem } from './types';

/**
 * TODO [COM03-BACKEND]: datos dummy (mismas filas del diseño en Figma).
 * Eliminar este archivo cuando exista la query `noticias` en backend.
 */
export const NOTICIAS_DUMMY: NoticiaListItem[] = [
    {
        id: '1',
        titulo: 'Nuevo horario de circulación en zona 10',
        estado: EstadoNoticia.PROGRAMADA,
        autor: 'Comunicación EMETRA',
        fecha: '2026-09-30T08:00:00.000Z',
    },
    {
        id: '2',
        titulo: 'Campaña de educación vial escolar',
        estado: EstadoNoticia.PUBLICADA,
        autor: 'Comunicación EMETRA',
        fecha: '2026-09-20T08:00:00.000Z',
    },
    {
        id: '3',
        titulo: 'Cierre vial por mantenimiento',
        estado: EstadoNoticia.PROGRAMADA,
        autor: 'Comunicación EMETRA',
        fecha: '2026-09-22T08:00:00.000Z',
    },
    {
        id: '4',
        titulo: 'Aviso de suspensión temporal de rutas',
        estado: EstadoNoticia.PROGRAMADA,
        autor: 'Comunicación EMETRA',
        fecha: '2026-09-21T08:00:00.000Z',
    },
    {
        id: '5',
        titulo: 'Actualización del sistema de remisiones',
        estado: EstadoNoticia.BORRADOR,
        autor: 'Diego Hernández',
        fecha: null,
    },
    {
        id: '6',
        titulo: 'Aerometro',
        estado: EstadoNoticia.ARCHIVADA,
        autor: 'John Doe',
        fecha: null,
    },
];

/**
 * TODO [COM03-BACKEND]: estados de push dummy (simulan la respuesta de la API de VIVI).
 * Las noticias sin entrada no tienen notificación y se muestran con "—".
 */
export const NOTIFICACIONES_DUMMY: EstadoNotificacionNoticia[] = [
    { noticiaId: '2', estado: EstadoNotificacion.ENVIADO },
    { noticiaId: '3', estado: EstadoNotificacion.PENDIENTE },
    { noticiaId: '4', estado: EstadoNotificacion.ERROR },
];
