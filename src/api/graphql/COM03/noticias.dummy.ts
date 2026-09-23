import { EstadoNoticia, EstadoNotificacion, type NoticiaListItem } from './types';

/**
 * TODO [COM03-BACKEND]: datos dummy (mismas filas del diseño en Figma).
 * Eliminar este archivo cuando exista la query `noticias` en backend.
 */
export const NOTICIAS_DUMMY: NoticiaListItem[] = [
    {
        id: '1',
        titulo: 'Nuevo horario de circulación en zona 10',
        estado: EstadoNoticia.PROGRAMADA,
        estadoNotificacion: null,
        autor: 'Comunicación EMETRA',
        fecha: '2026-09-30T08:00:00.000Z',
    },
    {
        id: '2',
        titulo: 'Campaña de educación vial escolar',
        estado: EstadoNoticia.PUBLICADA,
        estadoNotificacion: EstadoNotificacion.ENVIADO,
        autor: 'Comunicación EMETRA',
        fecha: '2026-09-20T08:00:00.000Z',
    },
    {
        id: '3',
        titulo: 'Cierre vial por mantenimiento',
        estado: EstadoNoticia.PUBLICADA,
        estadoNotificacion: EstadoNotificacion.PENDIENTE,
        autor: 'Comunicación EMETRA',
        fecha: '2026-09-22T08:00:00.000Z',
    },
    {
        id: '4',
        titulo: 'Aviso de suspensión temporal de rutas',
        estado: EstadoNoticia.PUBLICADA,
        estadoNotificacion: EstadoNotificacion.ERROR,
        autor: 'Comunicación EMETRA',
        fecha: '2026-09-21T08:00:00.000Z',
    },
    {
        id: '5',
        titulo: 'Actualización del sistema de remisiones',
        estado: EstadoNoticia.BORRADOR,
        estadoNotificacion: null,
        autor: 'Diego Hernández',
        fecha: null,
    },
    {
        id: '6',
        titulo: 'Aerometro',
        estado: EstadoNoticia.ARCHIVADA,
        estadoNotificacion: null,
        autor: 'John Doe',
        fecha: null,
    },
];
