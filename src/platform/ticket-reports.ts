import { metricsQuery } from "./metrics";
export type TicketReportSelection = {
    from: string;
    to: string;
    tecnicoId: string;
    etiqueta: string;
};
export type TicketLabelReport = {
    desde: string;
    hasta: string;
    tecnicoId: number | null;
    etiqueta: string | null;
    criterio: string;
    resumen: {
        tickets: number;
        tecnicos: number;
        sinClasificacionHistorica: number;
    };
    grupos: {
        tecnicoId: number | null;
        tecnico: string;
        etiquetaId: string;
        etiqueta: string;
        tickets: number;
    }[];
    opciones: {
        tecnicos: { id: number; nombre: string }[];
        etiquetas: { id: string; nombre: string }[];
    };
    items: {
        id: number;
        codigo: string | null;
        titulo: string;
        resueltoEn: string;
        tecnicoId: number | null;
        tecnico: string;
        etiquetas: string;
    }[];
    total: number;
    offset: number;
    limit: number;
};
export function ticketReportQuery(
    selection: TicketReportSelection,
    offset = 0,
) {
    const params = new URLSearchParams(
        metricsQuery(
            { from: selection.from, to: selection.to, team: "" },
            offset,
        ).split("?")[1],
    );
    if (selection.tecnicoId) {
        if (!/^[1-9]\d*$/.test(selection.tecnicoId))
            throw Error("Selecciona un técnico válido.");
        params.set("tecnicoId", selection.tecnicoId);
    }
    if (selection.etiqueta) {
        if (
            !/^(?:[1-9]\d*|sin-historico|sin-etiquetas)$/.test(
                selection.etiqueta,
            )
        )
            throw Error("Selecciona una etiqueta válida.");
        params.set("etiqueta", selection.etiqueta);
    }
    return "/tickets/reports/labels?" + params;
}
export function ticketReportCsv(
    report: TicketLabelReport,
    applied: TicketReportSelection,
) {
    const cell = (value: string | number | null) => {
        const text = String(value ?? "");
        const safe = /^[\s\u0000-\u001f\u200b-\u200f]*[=+@-]/.test(text)
            ? "'" + text
            : text;
        return '"' + safe.replaceAll('"', '""') + '"';
    };
    const rows: (string | number | null)[][] = [
        [
            "Desde",
            "Hasta",
            "Técnico ID",
            "Técnico",
            "Etiqueta ID",
            "Etiqueta",
            "Tickets resueltos",
        ],
    ];
    for (const group of report.grupos)
        rows.push([
            applied.from,
            applied.to,
            group.tecnicoId,
            group.tecnico,
            group.etiquetaId,
            group.etiqueta,
            group.tickets,
        ]);
    return (
        "\ufeff" +
        rows.map((row) => row.map(cell).join(";")).join("\r\n") +
        "\r\n"
    );
}
