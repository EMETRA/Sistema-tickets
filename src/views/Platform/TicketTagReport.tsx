"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/client/atoms/Button";
import { MetricCard } from "@/components/client/molecules/MetricCard";
import { platformFetch, PlatformError } from "@/platform/client";
import { guatemalaDay } from "@/platform/dates";
import { displayDate } from "@/components/client/organisms/ResourceWorkspace/RecordDetail";
import {
    ticketReportCsv,
    ticketReportQuery,
    type TicketLabelReport,
    type TicketReportSelection,
} from "@/platform/ticket-reports";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import local from "./TicketTagReport.module.scss";

export function TicketTagReport() {
    const [selection, setSelection] = useState<TicketReportSelection>({
        from: guatemalaDay(new Date(Date.now() - 30 * 86400000)),
        to: guatemalaDay(),
        tecnicoId: "",
        etiqueta: "",
    });
    const [applied, setApplied] = useState<TicketReportSelection | null>(null),
        [result, setResult] = useState<TicketLabelReport | null>(null),
        [loading, setLoading] = useState(false),
        [error, setError] = useState(""),
        [reference, setReference] = useState<string>(),
        [groupPage, setGroupPage] = useState(0);
    const request = useRef<AbortController | null>(null);
    async function load(offset = 0, filters = selection) {
        let path: string;
        try {
            path = ticketReportQuery(filters, offset);
        } catch (failure) {
            setError(
                failure instanceof Error
                    ? failure.message
                    : "Revisa los filtros.",
            );
            return;
        }
        request.current?.abort();
        const controller = new AbortController();
        request.current = controller;
        setLoading(true);
        setError("");
        setReference(undefined);
        try {
            const report = await platformFetch<TicketLabelReport>(path, {
                signal: AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(45000),
                ]),
            });
            if (
                !report.resumen ||
                !Array.isArray(report.grupos) ||
                !Array.isArray(report.items) ||
                !report.opciones ||
                !Array.isArray(report.opciones.tecnicos) ||
                !Array.isArray(report.opciones.etiquetas) ||
                report.criterio !== "RESUELTOS_POR_FECHA_CIERRE"
            )
                throw Error("No se pudo interpretar el reporte de tickets.");
            if (controller.signal.aborted) return;
            setResult(report);
            setApplied({ ...filters });
            if (offset === 0) setGroupPage(0);
        } catch (failure) {
            if (!controller.signal.aborted) {
                setError(
                    failure instanceof Error
                        ? failure.message
                        : "No se pudo consultar el reporte.",
                );
                setReference(
                    failure instanceof PlatformError
                        ? failure.reference
                        : undefined,
                );
            }
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    }
    useEffect(() => {
        void load();
        return () => request.current?.abort();
        // Los filtros se aplican al pulsar Consultar, no mientras se editan.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    function exportCsv() {
        if (!result || !applied || !result.grupos.length) return;
        const url = URL.createObjectURL(
            new Blob([ticketReportCsv(result, applied)], {
                type: "text/csv;charset=utf-8",
            }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = `tickets-por-etiqueta-${applied.from}-${applied.to}.csv`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
    const field = (key: keyof TicketReportSelection, value: string) =>
        setSelection((current) => ({ ...current, [key]: value }));
    return (
        <div className={local.report}>
            <div>
                <h2>Tickets resueltos por técnico y etiqueta</h2>
                <p className={styles.muted}>
                    Cuenta los tickets resueltos por su fecha de cierre, con la
                    clasificación guardada en ese momento.
                </p>
            </div>
            <form
                className={styles.toolbar}
                onSubmit={(event) => {
                    event.preventDefault();
                    void load();
                }}
            >
                <div className={styles.actions}>
                    <label className={styles.field}>
                        Desde
                        <input
                            className={styles.control}
                            type="date"
                            required
                            max={selection.to}
                            value={selection.from}
                            onChange={(event) =>
                                field("from", event.target.value)
                            }
                        />
                    </label>
                    <label className={styles.field}>
                        Hasta
                        <input
                            className={styles.control}
                            type="date"
                            required
                            min={selection.from}
                            value={selection.to}
                            onChange={(event) =>
                                field("to", event.target.value)
                            }
                        />
                    </label>
                    <label className={styles.field}>
                        Técnico
                        <select
                            className={styles.control}
                            aria-label="Técnico"
                            value={selection.tecnicoId}
                            onChange={(event) =>
                                field("tecnicoId", event.target.value)
                            }
                        >
                            <option value="">Todos los técnicos</option>
                            {selection.tecnicoId &&
                                !result?.opciones.tecnicos.some(
                                    (item) =>
                                        String(item.id) === selection.tecnicoId,
                                ) && (
                                    <option value={selection.tecnicoId}>
                                        Técnico #{selection.tecnicoId}
                                    </option>
                                )}
                            {result?.opciones.tecnicos.map((item) => (
                                <option key={item.id} value={String(item.id)}>
                                    {item.nombre}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className={styles.field}>
                        Etiqueta
                        <select
                            className={styles.control}
                            aria-label="Etiqueta"
                            value={selection.etiqueta}
                            onChange={(event) =>
                                field("etiqueta", event.target.value)
                            }
                        >
                            <option value="">Todas las etiquetas</option>
                            {result?.opciones.etiquetas.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nombre}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <Button type="submit" state={loading ? "loading" : "default"}>
                    Consultar reporte
                </Button>
            </form>
            {loading && <p role="status">Consultando tickets resueltos…</p>}
            {error && (
                <div role="alert" className={styles.error}>
                    <p>
                        {error}
                        {result
                            ? " Se conservan los resultados de la última consulta."
                            : ""}
                    </p>
                    {reference && <p>Referencia: {reference}</p>}
                </div>
            )}
            {result && applied && (
                <>
                    <p className={styles.muted}>
                        Resultados del {applied.from} al {applied.to}
                        {applied.tecnicoId
                            ? ` · ${result.opciones.tecnicos.find((item) => String(item.id) === applied.tecnicoId)?.nombre || "Técnico seleccionado"}`
                            : " · Todos los técnicos"}
                        {applied.etiqueta
                            ? ` · ${result.opciones.etiquetas.find((item) => item.id === applied.etiqueta)?.nombre || "Etiqueta seleccionada"}`
                            : ""}{" "}
                        · Hora de Guatemala.
                    </p>
                    <div className={styles.metrics}>
                        <MetricCard
                            label="Tickets resueltos únicos"
                            value={result.resumen.tickets}
                        />
                        <MetricCard
                            label="Técnicos identificados"
                            value={result.resumen.tecnicos}
                        />
                        <MetricCard
                            label="Sin clasificación histórica"
                            value={result.resumen.sinClasificacionHistorica}
                        />
                    </div>
                    <section className={styles.card}>
                        <div className={styles.toolbar}>
                            <div>
                                <h3>Resumen por técnico y etiqueta</h3>
                                <p className={styles.muted}>
                                    Un ticket con varias etiquetas cuenta en
                                    cada una. El total general cuenta tickets
                                    únicos.
                                </p>
                            </div>
                            <Button
                                variant="outlined"
                                state={
                                    loading || !result.grupos.length
                                        ? "disabled"
                                        : "default"
                                }
                                onClick={exportCsv}
                            >
                                Descargar resumen CSV
                            </Button>
                        </div>
                        {result.resumen.sinClasificacionHistorica > 0 && (
                            <p className={styles.muted}>
                                Los cierres anteriores sin clasificación
                                guardada se identifican como «Sin clasificación
                                histórica».
                            </p>
                        )}
                        {!result.grupos.length ? (
                            <p className={local.empty}>
                                No hay tickets resueltos para los filtros
                                aplicados.
                            </p>
                        ) : (
                            <>
                                <div className={styles.tableWrap}>
                                    <table className={styles.table}>
                                        <caption className={local.srOnly}>
                                            Tickets resueltos agrupados por
                                            técnico y etiqueta
                                        </caption>
                                        <thead>
                                            <tr>
                                                <th scope="col">Técnico</th>
                                                <th scope="col">Etiqueta</th>
                                                <th scope="col">
                                                    Tickets resueltos
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.grupos
                                                .slice(
                                                    groupPage * 50,
                                                    (groupPage + 1) * 50,
                                                )
                                                .map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.tecnico}</td>
                                                        <td>{item.etiqueta}</td>
                                                        <td>{item.tickets}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                                {result.grupos.length > 50 && (
                                    <nav
                                        aria-label="Páginas del resumen"
                                        className={styles.toolbar}
                                    >
                                        <span>
                                            {result.grupos.length} combinaciones
                                            · Página {groupPage + 1}
                                        </span>
                                        <div className={styles.actions}>
                                            <Button
                                                variant="outlined"
                                                state={
                                                    groupPage === 0
                                                        ? "disabled"
                                                        : "default"
                                                }
                                                onClick={() =>
                                                    setGroupPage(
                                                        (value) => value - 1,
                                                    )
                                                }
                                            >
                                                Resumen anterior
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                state={
                                                    (groupPage + 1) * 50 >=
                                                    result.grupos.length
                                                        ? "disabled"
                                                        : "default"
                                                }
                                                onClick={() =>
                                                    setGroupPage(
                                                        (value) => value + 1,
                                                    )
                                                }
                                            >
                                                Resumen siguiente
                                            </Button>
                                        </div>
                                    </nav>
                                )}
                            </>
                        )}
                    </section>
                    <section className={styles.card}>
                        <h3>Tickets que forman el reporte</h3>
                        {!result.items.length ? (
                            <p className={local.empty}>
                                No hay tickets en esta página.
                            </p>
                        ) : (
                            <div className={styles.tableWrap}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th scope="col">Ticket</th>
                                            <th scope="col">Técnico</th>
                                            <th scope="col">
                                                Etiquetas al cierre
                                            </th>
                                            <th scope="col">Resuelto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.items.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <Link
                                                        href={`/mis-tickets/${item.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Abrir ficha en otra pestaña"
                                                    >
                                                        {item.codigo?.trim() &&
                                                        !/^(null|undefined)$/i.test(
                                                            item.codigo.trim(),
                                                        )
                                                            ? item.codigo
                                                            : "#" +
                                                              item.id}{" "}
                                                        · {item.titulo}
                                                    </Link>
                                                </td>
                                                <td>{item.tecnico}</td>
                                                <td>{item.etiquetas}</td>
                                                <td>
                                                    {displayDate(
                                                        item.resueltoEn,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <nav
                            aria-label="Páginas de tickets del reporte"
                            className={styles.toolbar}
                        >
                            <p className={styles.muted}>
                                {result.total} tickets · Hasta {result.limit}{" "}
                                por página
                            </p>
                            <div className={styles.actions}>
                                <Button
                                    variant="outlined"
                                    state={
                                        loading || result.offset === 0
                                            ? "disabled"
                                            : "default"
                                    }
                                    onClick={() =>
                                        void load(
                                            Math.max(
                                                0,
                                                result.offset - result.limit,
                                            ),
                                            applied,
                                        )
                                    }
                                >
                                    Tickets anteriores
                                </Button>
                                <Button
                                    variant="outlined"
                                    state={
                                        loading ||
                                        result.offset + result.limit >=
                                            result.total
                                            ? "disabled"
                                            : "default"
                                    }
                                    onClick={() =>
                                        void load(
                                            result.offset + result.limit,
                                            applied,
                                        )
                                    }
                                >
                                    Tickets siguientes
                                </Button>
                            </div>
                        </nav>
                    </section>
                </>
            )}
        </div>
    );
}
