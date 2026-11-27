/** Espacios del «Panel institucional» y el propósito de cada pantalla. */
export type SpaceMeta = { space: string; description: string; title?: string };

const SECTIONS: Record<string, SpaceMeta> = {
    "/mis-tickets": {
        space: "Mi trabajo",
        title: "Mis solicitudes",
        description: "Tus solicitudes a Informática y en qué estado está cada una.",
    },
    "/tickets": { space: "Mi trabajo", description: "Tickets dentro de tu alcance." },
    "/tickets-creation": {
        space: "Mi trabajo",
        description: "Describe la solicitud; el área elegida la recibirá en su bandeja.",
    },
    "/espacio/asignacion": {
        space: "Mi trabajo",
        description: "Asigna, atiende y da seguimiento a las solicitudes de soporte.",
    },
    "/espacio/calendario": {
        space: "Mi trabajo",
        description: "Actividades personales, de tu equipo y generales.",
    },
    "/aplicaciones": {
        space: "Aplicaciones",
        title: "Todas las aplicaciones",
        description: "Los sistemas institucionales autorizados para tu perfil, por área.",
    },
    "/espacio/metricas": {
        space: "Informática",
        description: "Atención de tickets y operaciones confirmadas en las aplicaciones.",
    },
    "/espacio/inventario": {
        space: "Informática",
        description: "Bienes institucionales, fichas técnicas, mantenimientos y ubicaciones.",
    },
    "/espacio/red": { space: "Informática", description: "Mapa de red, dispositivos, puertos y enlaces." },
    "/espacio/sistemas": {
        space: "Informática",
        description:
            "Ficha técnica de cada aplicación: repositorios, versiones, incidentes y objetos Oracle.",
    },
    "/espacio/infraestructura": {
        space: "Informática",
        description: "Salud de los servidores y de sus contenedores, según la última observación.",
    },
    "/espacio/solicitudes": {
        space: "Informática",
        description: "Peticiones de acceso y de cuentas nuevas por revisar.",
    },
    "/espacio/organizacion": {
        space: "Informática",
        description: "Empleados, equipos de trabajo y responsabilidades.",
    },
    "/espacio/accesos": {
        space: "Informática",
        description: "Perfil base, roles y permisos de cada colaborador.",
    },
    "/espacio/auditoria": {
        space: "Informática",
        description: "Quién hizo qué, sobre qué registro y con qué resultado.",
    },
    "/espacio/busqueda": {
        space: "Informática",
        description: "Encuentra cualquier registro del panel por su nombre.",
    },
    "/mi-perfil": { space: "Mi cuenta", description: "Tus datos, tu unidad y tus accesos." },
    "/notificaciones": { space: "Mi cuenta", description: "Avisos del panel y de tus solicitudes." },
    "/ayuda": { space: "Mi cuenta", description: "Cómo pedir ayuda a Informática." },
    "/ajustes": { space: "Mi cuenta", description: "Apariencia del panel y accesos a tu cuenta." },
};

export function spaceMeta(pathname: string, staff: boolean): SpaceMeta | null {
    const meta = SECTIONS[pathname];
    if (!meta) return null;
    // Para quien no es de Informática, sus herramientas se agrupan como «Herramientas».
    return meta.space === "Informática" && !staff ? { ...meta, space: "Herramientas" } : meta;
}
