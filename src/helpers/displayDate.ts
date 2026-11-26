/** Fecha y hora legibles en hora de Guatemala («25 nov 2026, 3:00 p. m.»); «aaaa-mm-dd» → «dd/mm/aaaa». */
export function displayDate(value: unknown) {
    if (!value) return "No disponible";
    const text = String(value);
    if (/^\d{4}-\d\d-\d\d$/.test(text)) return text.split("-").reverse().join("/");
    const d = new Date(text);
    return Number.isFinite(+d)
        ? new Intl.DateTimeFormat("es-GT", {
              timeZone: "America/Guatemala",
              dateStyle: "medium",
              timeStyle: "short",
          }).format(d)
        : text;
}
