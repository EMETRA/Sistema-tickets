export type TransitRule = {
    regla: string;
    articulo: string;
    numeral: string;
    descripcion: string;
    monto: number;
    descuento1: number;
    descuento2: number;
    total1: number;
    total2: number;
};
export type TransitSlip = {
    ciudad: 1;
    serie: "N";
    numero: string;
    fecha: string;
    tipoPlaca: string;
    placa: string;
    marca: string;
    color: string;
    modelo: string;
    chasis: string;
    vin: string;
    nombres: string;
    apellidos: string;
    tipoLicencia: string;
    licencia: string;
    lugar: string;
    observaciones: string;
    chapa: string;
    agente: string;
    saldoActual: number | null;
    reglas: TransitRule[];
    montoOriginal: number;
    fechaDescuento1: string;
    fechaDescuento2: string;
    consultaUrl: string;
};
export function transitSlipNumber(value: string): string {
    const match = /^(?:N[\s-]*)?([1-9]\d{0,14})$/i.exec(value.trim());
    if (!match)
        throw Error(
            "Ingresa el número de una boleta serie N, por ejemplo N-1234567.",
        );
    return match[1];
}
export function transitSlipPath(value: string, pdf = false) {
    return (
        "/transit-reprints/N/" + transitSlipNumber(value) + (pdf ? "/pdf" : "")
    );
}
export function validTransitSlip(value: unknown): value is TransitSlip {
    if (!value || typeof value !== "object") return false;
    const d = value as TransitSlip;
    const strings = [
        "numero",
        "fecha",
        "tipoPlaca",
        "placa",
        "marca",
        "color",
        "modelo",
        "chasis",
        "vin",
        "nombres",
        "apellidos",
        "tipoLicencia",
        "licencia",
        "lugar",
        "observaciones",
        "chapa",
        "agente",
        "fechaDescuento1",
        "fechaDescuento2",
        "consultaUrl",
    ] as const;
    return (
        d.ciudad === 1 &&
        d.serie === "N" &&
        strings.every((key) => typeof d[key] === "string") &&
        /^[1-9]\d{0,14}$/.test(d.numero) &&
        (d.saldoActual === null ||
            (typeof d.saldoActual === "number" &&
                Number.isFinite(d.saldoActual))) &&
        typeof d.montoOriginal === "number" &&
        Number.isFinite(d.montoOriginal) &&
        d.montoOriginal >= 0 &&
        Array.isArray(d.reglas) &&
        d.reglas.length > 0 &&
        d.reglas.every(
            (r) =>
                r &&
                ["regla", "articulo", "numeral", "descripcion"].every(
                    (key) => typeof r[key as keyof TransitRule] === "string",
                ) &&
                ["monto", "descuento1", "descuento2", "total1", "total2"].every(
                    (key) =>
                        typeof r[key as keyof TransitRule] === "number" &&
                        Number.isFinite(r[key as keyof TransitRule]) &&
                        Number(r[key as keyof TransitRule]) >= 0,
                ),
        )
    );
}
