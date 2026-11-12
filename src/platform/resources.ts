import type { Definition, PlatformRecord } from "./types";
export type ResourceColumn = { key: string; label: string };
export const RESOURCE_PRESENTATION: Record<
    string,
    {
        title: string;
        singular: string;
        description: string;
        columns: ResourceColumn[];
    }
> = {
    activos: {
        title: "Fichas técnicas de bienes",
        singular: "Ficha técnica",
        description:
            "Características y responsable técnico registrados en Tickets. La asignación oficial se consulta en el inventario de Activos Fijos.",
        columns: [
            { key: "numeroInventario", label: "Inventario" },
            { key: "clase", label: "Tipo" },
            { key: "serie", label: "Serie" },
            { key: "instalacionId", label: "Ubicación" },
            { key: "responsableId", label: "Responsable técnico" },
        ],
    },
    instalaciones: {
        title: "Ubicaciones",
        singular: "Ubicación",
        description:
            "Sedes, edificios y niveles utilizados por los bienes, las visitas y la red.",
        columns: [
            { key: "direccion", label: "Dirección" },
            { key: "nivel", label: "Nivel" },
            { key: "responsableId", label: "Responsable" },
        ],
    },
    intervenciones: {
        title: "Mantenimientos y visitas",
        singular: "Mantenimiento o visita",
        description:
            "Trabajo realizado sobre un bien o una ubicación, su técnico y próxima revisión.",
        columns: [
            { key: "tipo", label: "Trabajo" },
            { key: "activoId", label: "Bien" },
            { key: "instalacionId", label: "Ubicación" },
            { key: "fecha", label: "Fecha" },
            { key: "responsableId", label: "Técnico" },
        ],
    },
    "movimientos-activos": {
        title: "Bitácora de movimientos",
        singular: "Movimiento",
        description:
            "Documenta salidas, traslados y bajas autorizadas. Este registro no modifica las tarjetas de Activos Fijos.",
        columns: [
            { key: "tipo", label: "Movimiento" },
            { key: "activoId", label: "Bien" },
            { key: "fecha", label: "Fecha" },
            { key: "destino", label: "Destino" },
            { key: "referencia", label: "Documento" },
        ],
    },
    dispositivos: {
        title: "Dispositivos de red",
        singular: "Dispositivo de red",
        description:
            "Switches, routers, puntos de acceso y equipos con ubicación y puertos configurados.",
        columns: [
            { key: "clase", label: "Tipo" },
            { key: "numeroInventario", label: "Inventario" },
            { key: "instalacionId", label: "Ubicación" },
            { key: "puertos", label: "Puertos" },
            { key: "direccion", label: "Administración" },
        ],
    },
    conexiones: {
        title: "Conexiones por puerto",
        singular: "Conexión",
        description:
            "Enlaces entre dos dispositivos y sus puertos. El mapa utiliza estos mismos registros.",
        columns: [
            { key: "origenId", label: "Origen" },
            { key: "puertoOrigen", label: "Puerto" },
            { key: "destinoId", label: "Destino" },
            { key: "puertoDestino", label: "Puerto" },
            { key: "medio", label: "Medio" },
        ],
    },
    equipos: {
        title: "Equipos de trabajo",
        singular: "Equipo de trabajo",
        description:
            "Unidades y grupos de personas que atienden solicitudes. Abre un equipo para revisar su alcance y bienes asignados.",
        columns: [
            { key: "unidadRh", label: "Unidad" },
            { key: "informatica", label: "Equipo de Informática" },
        ],
    },
    miembros: {
        title: "Responsabilidades",
        singular: "Responsabilidad",
        description:
            "Miembros con cuenta en Tickets y su función dentro de cada equipo. Una persona de RRHH sin cuenta no recibe accesos por aparecer en el directorio.",
        columns: [
            { key: "equipoId", label: "Equipo de trabajo" },
            { key: "funcion", label: "Función" },
        ],
    },
};
export function resourceDefinition(type: string, def: Definition): Definition {
    const copy = RESOURCE_PRESENTATION[type];
    return copy ? { ...def, title: copy.title, singular: copy.singular } : def;
}
export function resourceValue(
    row: PlatformRecord,
    key: string,
    teams: { id: string; nombre: string }[],
) {
    if (key === "equipoId")
        return (
            teams.find((t) => t.id === row.equipoId)?.nombre ||
            "Sin equipo asignado"
        );
    if (row.labels?.[key]) return row.labels[key];
    const value = row.datos[key];
    if (value == null || value === "") return "Sin dato";
    if (typeof value === "boolean") return value ? "Sí" : "No";
    if (
        typeof value === "string" &&
        /^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(value)
    )
        return "Consultar detalle";
    if (typeof value === "string" && ["fecha","proximaRevision","ultimaRevision"].includes(key)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.split('-').reverse().join('/');
        const date=new Date(value); if(Number.isFinite(+date)) return new Intl.DateTimeFormat('es-GT',{timeZone:'America/Guatemala',dateStyle:'short',timeStyle:'short'}).format(date);
    }
    return String(value).replaceAll("_", " ");
}
