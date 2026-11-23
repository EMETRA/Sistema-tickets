export type MetricsSelection = { from: string; to: string; team: string };
function day(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
        throw Error("Selecciona fechas válidas.");
    const date = new Date(value + "T00:00:00Z");
    if (!Number.isFinite(+date) || date.toISOString().slice(0, 10) !== value)
        throw Error("Selecciona fechas válidas.");
    return date;
}
export function metricsQuery(selection: MetricsSelection, offset = 0) {
    const start = day(selection.from),
        end = day(selection.to);
    if (+end < +start)
        throw Error("La fecha Hasta debe ser igual o posterior a Desde.");
    if (+end - +start >= 366 * 86400000)
        throw Error("Consulta un periodo de hasta 366 días.");
    if (!Number.isSafeInteger(offset) || offset < 0)
        throw Error("Página inválida.");
    end.setUTCDate(end.getUTCDate() + 1);
    const query = new URLSearchParams({
        desde: new Date(selection.from + "T00:00:00-06:00").toISOString(),
        hasta: new Date(
            end.toISOString().slice(0, 10) + "T00:00:00-06:00",
        ).toISOString(),
        offset: String(offset),
    });
    if (selection.team) query.set("equipoId", selection.team);
    return "/metrics?" + query;
}
const labels: Record<string, string> = {
    VEHICULO_SAT_CONSULTADO: "Consulta de vehículo SAT",
    REPORTE_VISA_NOMINA_GENERADO: "Reporte de visa nómina generado",
    REPORTE_RRHH_GENERADO: "Reporte de RRHH generado",
    REPORTE_RRHH_CONSULTADO: "Reporte de RRHH consultado",
    REPORTE_ANULADOS_GENERADO: "Reporte de anulados generado",
    REPORTE_ANULADOS_CONSULTADO: "Reporte de anulados consultado",
    REPORTE_SEMANAL_GENERADO: "Reporte semanal generado",
    REPORTE_SEMANAL_GUARDADO: "Reporte semanal guardado",
    FUNCIONES_CORPORATIVAS_CONSULTADAS: "Consulta de funciones corporativas",
    FUNCIONES_CORPORATIVAS_GUARDADAS: "Funciones corporativas guardadas",
    FUNCIONES_CORPORATIVAS_COPIADAS: "Funciones corporativas copiadas",
};
export const metricOperation = (code: string) =>
    labels[code] || code.replaceAll("_", " ");
