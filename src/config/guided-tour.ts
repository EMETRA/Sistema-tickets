/**
 * Recorrido guiado del Panel institucional.
 *
 * Es contenido, no código: el mismo texto sirve para el recorrido en pantalla
 * y como base del manual de uso en PDF que exige Contraloría (cada paso
 * equivale a una sección del capítulo «Primeros pasos»).
 *
 * - `target`: selector CSS del elemento a señalar (atributos data-tour). Sin
 *   target, el paso se muestra centrado.
 * - `audience`: perfiles que ven el paso. Si el elemento no existe o no está
 *   visible (p. ej. sin permiso), el paso se omite solo.
 */
export type TourAudience = "todos" | "personal-ti" | "mesa" | "administracion";

export type TourStep = {
    id: string;
    target?: string;
    title: string;
    body: string;
    audience?: TourAudience[];
};

export const TOUR_VERSION = "v1";

export const GUIDED_TOUR: TourStep[] = [
    {
        id: "bienvenida",
        title: "Te damos la bienvenida al Panel institucional",
        body: "En un minuto te mostramos dónde está cada cosa. Puedes salir cuando quieras con «Saltar» y volver a verlo desde Ajustes o Ayuda.",
    },
    {
        id: "menu",
        target: '[data-tour="nav-principal"]',
        title: "Tu menú, siempre a la izquierda",
        body: "Desde aquí vuelves al Inicio, revisas tus solicitudes y abres el calendario. La opción resaltada es la pantalla en la que estás.",
    },
    {
        id: "mesa",
        target: '[data-tour="nav-principal"] a[href="/espacio/asignacion"]',
        title: "Mesa de servicio",
        body: "Los tickets de tu equipo para asignar y atender, ordenados por urgencia.",
        audience: ["mesa", "administracion"],
    },
    {
        id: "solicitudes",
        target: '[data-tour="nav-principal"] a[href="/mis-tickets"]',
        title: "Mis solicitudes",
        body: "Aquí ves en qué va cada ticket que creaste, las respuestas de Informática y su historial.",
    },
    {
        id: "calendario",
        target: '[data-tour="nav-principal"] a[href="/espacio/calendario"]',
        title: "Calendario",
        body: "Actividades personales, de tu equipo y de la institución. Las reuniones virtuales tienen un botón «Unirse».",
    },
    {
        id: "aplicaciones",
        target: '[data-tour="nav-aplicaciones"]',
        title: "Aplicaciones de la institución",
        body: "Financiero, Recaudación, Juzgado, Jurídico y los demás sistemas que ya se trasladaron al panel. Solo ves las que tu perfil tiene autorizadas.",
    },
    {
        id: "informatica",
        target: '[data-tour="nav-herramientas"]',
        title: "Herramientas de Informática",
        body: "Personas y accesos, métricas, activos, red, sistemas y servidores.",
        audience: ["personal-ti", "administracion"],
    },
    {
        id: "buscar",
        target: '[data-tour="buscar"]',
        title: "Buscar o ir a…",
        body: "Escribe el nombre de una aplicación, un módulo o el número de un ticket y te llevamos ahí. Atajo de teclado: Ctrl + K (⌘ + K en Mac).",
    },
    {
        id: "crear-ticket",
        target: '[data-tour="crear-ticket"]',
        title: "¿Algo no funciona? Crea un ticket",
        body: "Cuéntale a Informática qué pasa, adjunta una captura si ayuda y sigue la respuesta en «Mis solicitudes».",
    },
    {
        id: "notificaciones",
        target: '[data-tour="notificaciones"]',
        title: "Avisos",
        body: "Te avisamos cuando responden tus tickets o hay novedades de RRHH. El punto rojo indica avisos sin leer.",
    },
    {
        id: "ajustes",
        target: '[data-tour="ajustes"]',
        title: "Ajustes a tu medida",
        body: "Modo oscuro, letra más grande, alto contraste y menos animaciones. Los cambios se ven al momento.",
    },
    {
        id: "ayuda",
        target: '[data-tour="ayuda"]',
        title: "Ayuda",
        body: "El manual de uso, cómo pedir ayuda a Informática y la opción para repetir este recorrido.",
    },
    {
        id: "fin",
        title: "¡Listo!",
        body: "Ya conoces lo principal. Si algo no queda claro, en Ayuda tienes el manual y puedes repetir este recorrido cuando quieras.",
    },
];
