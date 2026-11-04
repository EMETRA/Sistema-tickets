export type Field = {
    key: string;
    label: string;
    type:
        | "text"
        | "textarea"
        | "number"
        | "boolean"
        | "date"
        | "datetime"
        | "select"
        | "ref"
        | "user"
        | "url"
        | "list";
    required?: boolean;
    options?: string[];
    resource?: string;
    lookupPath?: string;
    min?: number;
    max?: number;
};
export type Definition = {
    title: string;
    states?: string[];
    singular: string;
    permission: string;
    group: string;
    fields: Field[];
    immutable?: boolean;
    actions: Record<string, boolean>;
};
export type PlatformContextData = {
    enabled: boolean;
    inventoryConnected?: boolean;
    defaultTicketTeamId?: string;
    actor: { id: number; nombre: string; admin: boolean; mode: string };
    definitions: Record<string, Definition>;
    teams: { id: string; nombre: string }[];
    memberships: { equipoId: string; funcion: string }[];
    capabilities: {
        assign: boolean;
        attend: boolean;
        audit: boolean;
        logs: boolean;
        teamMetrics: boolean;
    };
    timezone: string;
};
export type PlatformRecord = {
    id: string;
    nombre: string;
    equipoId: string | null;
    usuarioId: number;
    visibilidad: string;
    estado: string;
    version: number;
    creadoEn: string;
    actualizadoEn: string;
    datos: Record<string, unknown>;
};
export type PageResult<T> = {
    items: T[];
    total: number;
    offset: number;
    limit: number;
};
