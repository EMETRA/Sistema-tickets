/** Fechas de negocio en Guatemala, independientes de la zona del navegador. */
export function guatemalaDay(date = new Date()): string {
    return new Intl.DateTimeFormat("fr-CA", {
        timeZone: "America/Guatemala",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}
