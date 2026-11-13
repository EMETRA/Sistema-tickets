export type CctRow = Record<string, string | null>;
export type CctPage = {
    items: CctRow[];
    total: number;
    offset: number;
    hayMas: boolean;
    monto?: string;
    fuente?: string;
    empalmes?: CctRow[];
    cuenta?: CctRow[];
    expedientes?: CctRow[];
    historialExpedientes?: CctRow[];
    grupos?: CctPage[];
};
export type CctBootstrap = {
    enabled: boolean;
    acciones: Record<string, boolean>;
    operador: boolean;
    escrituras: boolean;
    numeracionLista: boolean;
    disponibilidad: Record<
        string,
        { habilitado: boolean; motivo: string | null }
    >;
};
export type CctCepo = {
    datos: CctRow;
    version: string;
    vehiculo: CctRow | null;
    vehiculoPendiente: boolean;
    tarifas: { DANIO: string; ROBO: string; regla: string };
};
export const CCT_SOURCES = {
    TRANSITO: "Tránsito",
    EMPRESA: "Empresa",
    INSTITUCIONES: "Instituciones",
    CEPO: "Cepos",
};
export const CCT_STATES: Record<string, string> = {
    C: "Colocado",
    P: "Pago registrado",
    L: "Liberado",
    D: "Dañado",
    R: "Robado",
    A: "Anulado",
    N: "No aplica",
    S: "Suspendido",
    G: "Gestión",
    T: "Traslado",
};
export const CCT_LABELS: Record<string, string> = {
    SERIE: "Serie",
    REMISION: "Remisión",
    FECHA: "Fecha",
    MONTO: "Importe",
    CONDUCTOR: "Conductor",
    NOMBRE_NOTIFICA: "Persona notificada",
    VECINO_NOTIFICA: "Persona notificada",
    FECHA_NOTIFICA: "Notificada el",
    DIAS: "Días",
    LUGAR: "Lugar",
    OBSERVACIONES: "Observaciones",
    OBSERVACION: "Observación",
    TPLACA: "Tipo de placa",
    NPLACA: "Placa",
    TIPO_PLACA: "Tipo de placa",
    PLACA: "Placa",
    NOMBRE_PROPIETARIO: "Propietario",
    NOMBRE_ASOCIACION: "Asociación",
    CODIGO_PILOTO: "Código de piloto",
    LICENCIA: "Licencia",
    PNOMBRE: "Primer nombre",
    SNOMBRE: "Segundo nombre",
    TNOMBRE: "Tercer nombre",
    PAPELLIDO: "Primer apellido",
    SAPELLIDO: "Segundo apellido",
    TAPELLIDO: "Apellido de casada",
    CHAPA: "Chapa",
    NOMBRE: "Nombre",
    TIPO_AGENTE: "Tipo de agente",
    ESTATUS: "Estado",
    AVISO: "Aviso",
    CEPO_FISICO: "Cepo físico",
    VEHICULO: "Vehículo",
    NUMERO_VEHICULO: "Número de vehículo",
    TIPO_VEHICULO: "Tipo de vehículo",
    CRUCERO: "Crucero",
    MOTIVO: "Motivo",
    DELEGACION: "Delegación",
    ORIGEN_PAGO: "Origen de pago",
    BOLETA: "Boleta de pago",
    HORA_LIBERACION: "Liberación",
    LIBERO: "Chapa que libera",
    USUARIO_GRABA: "Registró",
    USUARIO_LIBERA: "Liberó",
    MARCA: "Marca",
    COLOR: "Color",
    MODELO: "Modelo",
    MODELO_MOTOR: "Modelo",
    FECPAGO: "Fecha de pago",
    RECEPTOR: "Receptor",
    RECIBO: "Recibo",
    ARTICULO: "Artículo",
    NUMERAL: "Numeral",
    ESPECIFICACION: "Infracción",
};
export function cctLabel(key: string) {
    return (
        CCT_LABELS[key] ||
        key
            .toLowerCase()
            .replaceAll("_", " ")
            .replace(/^./, (s) => s.toUpperCase())
    );
}
export function cctQuery(data: Record<string, string>) {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(data)) if (v !== "") p.set(k, v);
    return p.toString();
}
export function cctCsv(rows: CctRow[]) {
    const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))],
        cell = (v: unknown) => {
            let s = String(v ?? "");
            if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
            return '"' + s.replaceAll('"', '""') + '"';
        };
    return (
        "\ufeff" +
        [keys.map(cctLabel), ...rows.map((r) => keys.map((k) => r[k]))]
            .map((r) => r.map(cell).join(","))
            .join("\r\n")
    );
}
export function cctCivilNow() {
    return new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 16);
}
