export type HrField = {
    codigo: string;
    etiqueta: string;
    grupo: string;
    tipo: "texto" | "numero" | "fecha" | "archivo";
    maximo: number;
    permiteNulo: boolean;
    editable: boolean;
};
export type HrSelection = {
    codigo: string;
    modo: "EDITAR" | "CONFIRMAR";
    obligatorio: boolean;
};
export type HrAnswer = {
    valor?: string | null;
    confirmacion?: "CORRECTO" | "CORREGIR";
    observacion?: string;
};
export type HrCampaign = {
    id: string;
    nombre: string;
    descripcion: string;
    modo: "CON_REVISION" | "AL_ENVIAR";
    inicio: string;
    fin: string;
    ventana: "ABIERTA" | "PROGRAMADA" | "CERRADA";
    campos: HrSelection[];
    version: number;
};
export type HrNotice = Omit<HrCampaign, "campos"> & {
    estado: string;
    pendiente: boolean;
};
export type HrProfile = {
    vinculado: boolean;
    motivo: string | null;
    mensaje: string | null;
    empresa: number | null;
    empleado: number | null;
    campos: HrField[];
    datos: Record<string, string | null>;
    huella: string | null;
    campanas: HrNotice[];
    habilitado: boolean;
};
export type HrDelivery = {
    id: string;
    revision: number;
    empresa: number;
    empleado: number;
    original: Record<string, string | null>;
    respuestas: Record<string, HrAnswer>;
    observacion: string;
    revisiones: {
        decision: string;
        observacion: string;
        actorId: number;
        actor: string;
        fecha: string;
    }[];
    enviadoEn: string;
    aplicadoEn: string | null;
    revisadoEn: string | null;
    revisadoPor: number | null;
};
export type HrMine = {
    campana: HrCampaign;
    estado: string;
    version: number;
    perfil: HrProfile;
    entrega: HrDelivery | null;
};
export function hrDraft(
    data: HrMine,
    prior: Record<string, HrAnswer> = {},
): Record<string, HrAnswer> {
    const returned = data.estado === "DEVUELTA" ? data.entrega?.respuestas : null;
    return Object.fromEntries(
        data.campana.campos.map((field) => {
            const local = prior[field.codigo];
            const previous = returned?.[field.codigo];
            if (field.modo === "CONFIRMAR")
                return [
                    field.codigo,
                    {
                        observacion:
                            local?.observacion ?? previous?.observacion ?? "",
                    },
                ];
            const source =
                local && Object.hasOwn(local, "valor")
                    ? local
                    : previous && Object.hasOwn(previous, "valor")
                      ? previous
                      : { valor: data.perfil.datos[field.codigo] };
            return [field.codigo, { valor: source.valor ?? "" }];
        }),
    );
}
export type HrReview = {
    contacto?: { telefono: string | null; correo: string | null } | null;
    campana: HrCampaign;
    estado: string;
    version: number;
    usuarioId: number;
    nombre: string;
    entrega: HrDelivery | null;
    campos: HrField[];
};
export type HrReport = {
    campana: HrCampaign;
    resumen: {
        total: number;
        enviadas: number;
        porcentaje: number;
        aplicadas: number;
        revisadas: number;
        contacto: number;
        devueltas: number;
        pendientes: number;
    };
    items: {
        usuarioId: number;
        nombre: string;
        empresa: number | null;
        empleado: number | null;
        estado: string;
        version: number;
        revision: number;
        enviadoEn: string | null;
    }[];
    offset: number;
    hayMas: boolean;
};
export const HR_STATES: Record<string, string> = {
    PENDIENTE: "Pendiente de envío",
    DEVUELTA: "Correcciones solicitadas",
    ENVIADA: "Pendiente de aprobación",
    APLICADA: "Aplicada al enviar",
    CONTACTO: "RRHH debe contactar",
    REVISADA: "Revisada por RRHH",
    ANTERIOR: "Envío anterior",
};
export const hrDate = (value: string | null) =>
    value
        ? new Intl.DateTimeFormat("es-GT", {
              timeZone: "America/Guatemala",
              dateStyle: "medium",
              timeStyle: "short",
          }).format(new Date(value))
        : "Sin fecha";
export function hrLocalIso(value: string) {
    if (
        !/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(value) ||
        !Number.isFinite(Date.parse(value + "-06:00")) ||
        new Date(value.slice(0, 10) + "T00:00:00Z")
            .toISOString()
            .slice(0, 10) !== value.slice(0, 10)
    )
        throw Error("Revisa la fecha y hora de Guatemala.");
    return new Date(value + "-06:00").toISOString();
}
export function hrLocalInput(date: Date) {
    return new Date(date.getTime() - 6 * 3600000).toISOString().slice(0, 16);
}
export function hrDeadline(start: Date, period: string) {
    const result = new Date(
        start.getTime() - (period === "mes" ? 6 * 3600000 : 0),
    );
    if (period === "mes") {
        const day = result.getUTCDate();
        result.setUTCDate(1);
        result.setUTCMonth(result.getUTCMonth() + 1);
        const last = new Date(
            Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
        ).getUTCDate();
        result.setUTCDate(Math.min(day, last));
    } else {
        if (!["1", "3", "7"].includes(period)) throw Error("Periodo inválido.");
        result.setUTCDate(result.getUTCDate() + Number(period));
    }
    return period === "mes" ? new Date(result.getTime() + 6 * 3600000) : result;
}
