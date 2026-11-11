export type ViviUser = {
    id: string;
    nombres: string;
    apellidos: string;
    correo: string;
    telefono: string;
    activo: boolean;
    registradoEn: string;
    avisos: number;
    reportes: number;
};
export type ViviUserDetail = ViviUser & {
    dpi: string | null;
    nit: string | null;
    fechaNacimiento: string | null;
    sexo: string | null;
    etnia: string | null;
    pais: string | null;
    departamento: number | null;
    municipio: number | null;
    zona: number | null;
    direccion: string | null;
    tipoPlacaDeclarada: string | null;
    placaDeclarada: string | null;
};
export type ViviActivity = {
    id: string;
    tipo: "AVISO" | "REPORTE";
    usuarioId: string | null;
    usuario: string | null;
    codigoCaso: string | null;
    usoPlaca: string | null;
    placa: string | null;
    motivo: string;
    estado: string;
    registradoEn: string;
    fechaEvento: string | null;
};
export type ViviUsersReport = {
    resumen: {
        total: number;
        activos: number;
        inactivos: number;
        conActividad: number;
        sinActividad: number;
    };
    items: ViviUser[];
    offset: number;
    limite: number;
    hayMas: boolean;
};
export type ViviActivityReport = {
    resumen: {
        total: number;
        avisos: number;
        reportes: number;
        estados: { tipo: string; estado: string; cantidad: number }[];
    };
    items: ViviActivity[];
    offset: number;
    limite: number;
    hayMas: boolean;
};
export type ViviUsersFilters = {
    q: string;
    estado: string;
    actividad: string;
    desde: string;
    hasta: string;
};
export type ViviActivityFilters = {
    usuarioId: string;
    tipo: string;
    estado: string;
    desde: string;
    hasta: string;
};
export const emptyViviUsers: ViviUsersFilters = {
    q: "",
    estado: "",
    actividad: "",
    desde: "",
    hasta: "",
};
export const emptyViviActivity: ViviActivityFilters = {
    usuarioId: "",
    tipo: "",
    estado: "",
    desde: "",
    hasta: "",
};
export const viviNoticeStates = [
    "REGISTRADA",
    "PENDIENTE_CORREO",
    "NOTIFICADA",
    "DEFENSA_WEB",
    "EN_JUZGADO",
    "REMISION_EMITIDA",
    "ARCHIVADA",
];
export const viviReportStates = ["PUBLICADO", "NO_PUBLICADO"];
const stateLabels: Record<string, string> = {
    REGISTRADA: "Registrado",
    PENDIENTE_CORREO: "Pendiente de correo",
    NOTIFICADA: "Notificado",
    DEFENSA_WEB: "Defensa presentada",
    EN_JUZGADO: "En juzgado",
    REMISION_EMITIDA: "Remisión emitida",
    ARCHIVADA: "Archivado",
    PUBLICADO: "Publicado",
    NO_PUBLICADO: "No publicado",
};
export const viviStateLabel = (state: string) => stateLabels[state] || state;
export function viviReportQuery(
    kind: "users" | "activity",
    filters: ViviUsersFilters | ViviActivityFilters,
    offset = 0,
) {
    if (!Number.isInteger(offset) || offset < 0 || offset > 1000000)
        throw Error("Página inválida.");
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
        const text = value.trim();
        if (text) params.set(key, text);
    }
    for (const key of ["desde", "hasta"]) {
        const value = params.get(key);
        if (!value) continue;
        const date = new Date(value + "T00:00:00Z");
        if (
            !/^(19|20|21)\d{2}-\d{2}-\d{2}$/.test(value) ||
            !Number.isFinite(date.getTime()) ||
            date.toISOString().slice(0, 10) !== value
        )
            throw Error("Revisa las fechas del reporte.");
    }
    if (
        params.has("desde") &&
        params.has("hasta") &&
        params.get("desde")! > params.get("hasta")!
    )
        throw Error("Desde debe ser anterior o igual a Hasta.");
    if ((params.get("q") || "").length > 100)
        throw Error("La búsqueda admite hasta 100 caracteres.");
    if (
        params.has("usuarioId") &&
        !/^[1-9][0-9]{0,18}$/.test(params.get("usuarioId")!)
    )
        throw Error("El ID de usuario VIVI debe ser un número positivo.");
    params.set("offset", String(offset));
    return "/vivi-reports/" + kind + "?" + params;
}
export function viviReportCsv(
    report: ViviUsersReport | ViviActivityReport,
    kind: "users" | "activity",
) {
    const cell = (value: unknown) => {
        const text = String(value ?? "");
        const safe = /^[\s\u0000-\u001f\u200b-\u200f]*[=+@-]/.test(text)
            ? "'" + text
            : text;
        return '"' + safe.replaceAll('"', '""') + '"';
    };
    const rows: unknown[][] =
        kind === "users"
            ? [
                  [
                      "Usuario VIVI ID",
                      "Nombres",
                      "Apellidos",
                      "Correo",
                      "Teléfono",
                      "Cuenta",
                      "Inscripción UTC",
                      "Avisos",
                      "Reportes",
                  ],
                  ...(report as ViviUsersReport).items.map((u) => [
                      u.id,
                      u.nombres,
                      u.apellidos,
                      u.correo,
                      u.telefono,
                      u.activo ? "Activa" : "Inactiva",
                      u.registradoEn,
                      u.avisos,
                      u.reportes,
                  ]),
              ]
            : [
                  [
                      "Tipo",
                      "ID",
                      "Usuario VIVI ID",
                      "Usuario",
                      "Caso",
                      "Uso de placa",
                      "Placa",
                      "Motivo",
                      "Estado",
                      "Registro UTC",
                  ],
                  ...(report as ViviActivityReport).items.map((e) => [
                      e.tipo,
                      e.id,
                      e.usuarioId,
                      e.usuario,
                      e.codigoCaso,
                      e.usoPlaca,
                      e.placa,
                      e.motivo,
                      viviStateLabel(e.estado),
                      e.registradoEn,
                  ]),
              ];
    return (
        "\ufeff" +
        rows.map((row) => row.map(cell).join(";")).join("\r\n") +
        "\r\n"
    );
}
