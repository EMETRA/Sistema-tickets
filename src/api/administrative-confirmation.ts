import { getOperationAST, Kind, parse } from "graphql";

export type AdministrativeChange = {
    label: string;
    detail?: string;
    onReview?: () => Promise<void>;
    onConfirm?: () => Promise<void>;
};
type Handler = (change: AdministrativeChange) => Promise<boolean>;
let handler: Handler | undefined;

export class AdministrativeChangeCancelled extends Error {
    constructor() {
        super("Operación cancelada. No se aplicaron cambios.");
        this.name = "AdministrativeChangeCancelled";
    }
}
export function registerAdministrativeConfirmation(next: Handler) {
    handler = next;
    return () => {
        if (handler === next) handler = undefined;
    };
}

const labels: Record<string, string> = {
    createTicket: "Crear un ticket",
    updateTicket: "Actualizar un ticket",
    deleteTicket: "Eliminar un ticket",
    guardarNoticiaCms: "Guardar o publicar una noticia",
    createModule: "Crear un módulo",
    createRol: "Crear un rol",
    updateRol: "Actualizar un rol",
    guardarFuncionesPorUsuario: "Guardar las funciones de un usuario en una aplicación",
    copiarFuncionesPorUsuario: "Agregar al destino los permisos del usuario origen en todas sus aplicaciones",
    assignPermission: "Modificar permisos",
    saveWeeklyReport: "Guardar un reporte semanal",
    sendEmailNotification: "Enviar una notificación",
    addTagToTicket: "Agregar una etiqueta al ticket",
    removeTagFromTicket: "Quitar una etiqueta del ticket",
    sendTicketMessage: "Enviar un comentario al ticket",
};

export function describeGraphqlChange(
    query: string,
    variables?: Record<string, unknown>,
): AdministrativeChange | null {
    const operation = getOperationAST(parse(query));
    if (operation?.operation !== "mutation") return null;
    const field = operation.selectionSet.selections.find(
        (selection) =>
            selection.kind === Kind.FIELD &&
            !["login", "logout", "refreshToken", "refresh"].includes(
                selection.name.value,
            ),
    );
    const name = field?.kind === Kind.FIELD ? field.name.value : "";
    if (!name) return null;
    const input = variables?.input as Record<string, unknown> | undefined;
    const description = input?.titulo ?? input?.nombre;
    return {
        label:
            name === "updateTicket" && input?.estadoId === 4
                ? "Cancelar un ticket conservando su historial"
                : labels[name] || "Aplicar cambios en la aplicación",
        detail:
            typeof description === "string"
                ? description.trim().slice(0, 160)
                : undefined,
    };
}

/** A UX control, not authorization: the API still validates identity and permissions. */
export async function confirmAdministrativeChange(
    change: AdministrativeChange | null,
    required = false,
) {
    if (!change || typeof window === "undefined") return;
    const { useAuthStore } = await import("@/store/useAuthStore");
    const session = useAuthStore.getState();
    if ((!required && session.getRole() !== "ADMINISTRADOR") || !session.token)
        return;
    const token = session.token;
    if (!handler) throw new AdministrativeChangeCancelled();
    const confirmed = await handler(change);
    if (!confirmed || useAuthStore.getState().token !== token)
        throw new AdministrativeChangeCancelled();
}

export function describeRestChange(
    url: string,
    options?: RequestInit,
): AdministrativeChange | null {
    const method = (options?.method || "GET").toUpperCase();
    if (["GET", "HEAD", "OPTIONS"].includes(method)) return null;
    // MOD06 recibe los filtros de esta consulta de permisos en el cuerpo POST.
    if (url === "/api/MOD06/permisos" && method === "POST") return null;
    // Session operations and staging media are outside the final business action.
    if (
        /^\/api\/(?:auth(?:\/|$)|login(?:\/|$)|logout(?:\/|$)|refresh(?:\/|$))/.test(
            url,
        ) ||
        /\/(?:resources|recursos)(?:[/?]|$)/.test(url)
    )
        return null;
    if (url === "/api/graphql" && typeof options?.body === "string") {
        const body = JSON.parse(options.body) as {
            query: string;
            variables?: Record<string, unknown>;
        };
        return describeGraphqlChange(body.query, body.variables);
    }
    return {
        label:
            method === "DELETE"
                ? "Eliminar o cancelar un registro"
                : "Guardar los cambios de la aplicación",
    };
}
