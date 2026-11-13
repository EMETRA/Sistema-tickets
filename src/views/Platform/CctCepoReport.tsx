"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { platformFetch } from "@/platform/client";
import {
    CCT_REPORT_DATE_LABELS,
    CCT_STATES,
    cctCivilNow,
    cctCsv,
    cctPdfBlob,
    cctQuery,
    type CctCepoReport as Report,
    type CctCepoReportFilters,
} from "@/platform/cct";
import { CctPager, CctTable, cctError } from "./CctParts";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import local from "./CctWorkspace.module.scss";
const day = (s: string) =>
    s.slice(8, 10) + "/" + s.slice(5, 7) + "/" + s.slice(0, 4);
function defaults(): CctCepoReportFilters {
    const hasta = cctCivilNow().slice(0, 10),
        desde = new Date(Date.parse(hasta + "T00:00:00Z") - 29 * 86400000)
            .toISOString()
            .slice(0, 10);
    return {
        desde,
        hasta,
        fechaBase: "COLOCACION",
        estado: "",
        tipoAgente: "",
        agente: "",
    };
}
export function CctCepoReport() {
    const [form, setForm] = useState<CctCepoReportFilters>(defaults),
        [result, setResult] = useState<Report | null>(null),
        [applied, setApplied] = useState<CctCepoReportFilters | null>(null),
        [busy, setBusy] = useState(false),
        [exporting, setExporting] = useState(false),
        [error, setError] = useState(""),
        [pdf, setPdf] = useState("");
    const request = useRef<AbortController | null>(null),
        exportRequest = useRef<AbortController | null>(null),
        dialog = useRef<HTMLDialogElement>(null),
        pdfUrl = useRef("");
    useEffect(
        () => () => {
            request.current?.abort();
            exportRequest.current?.abort();
            if (pdfUrl.current) URL.revokeObjectURL(pdfUrl.current);
        },
        [],
    );
    const set = (key: keyof CctCepoReportFilters, value: string) =>
        setForm((previous) => ({ ...previous, [key]: value }));
    async function search(q = form, offset = 0) {
        request.current?.abort();
        exportRequest.current?.abort();
        const ctl = new AbortController();
        request.current = ctl;
        setBusy(true);
        setExporting(false);
        setError("");
        try {
            const data = await platformFetch<Report>(
                "/cct/reportes/cepos?" +
                    cctQuery({ ...q, offset: String(offset) }),
                { signal: ctl.signal },
            );
            if (ctl.signal.aborted) return;
            setResult(data);
            setApplied({ ...q });
        } catch (e) {
            if (!ctl.signal.aborted) setError(cctError(e));
        } finally {
            if (!ctl.signal.aborted) setBusy(false);
        }
    }
    async function exportReport(kind: "pdf" | "csv") {
        if (!applied) return;
        exportRequest.current?.abort();
        const ctl = new AbortController();
        exportRequest.current = ctl;
        setExporting(true);
        setError("");
        try {
            if (kind === "pdf") {
                const blob = await cctPdfBlob(
                    await platformFetch<Blob>(
                        "/cct/reportes/cepos/pdf?" + cctQuery(applied),
                        { signal: ctl.signal },
                    ),
                );
                if (ctl.signal.aborted) return;
                if (pdfUrl.current) URL.revokeObjectURL(pdfUrl.current);
                const url = URL.createObjectURL(blob);
                pdfUrl.current = url;
                setPdf(url);
                dialog.current?.showModal();
            } else {
                const data = await platformFetch<Report>(
                    "/cct/reportes/cepos/exportar?" + cctQuery(applied),
                    { signal: ctl.signal },
                );
                if (ctl.signal.aborted) return;
                const url = URL.createObjectURL(
                        new Blob([cctCsv(data.items)], {
                            type: "text/csv;charset=utf-8",
                        }),
                    ),
                    a = document.createElement("a");
                a.href = url;
                a.download =
                    "CCT-cepos-" + applied.desde + "-" + applied.hasta + ".csv";
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 10000);
            }
        } catch (e) {
            if (!ctl.signal.aborted) setError(cctError(e));
        } finally {
            if (!ctl.signal.aborted) setExporting(false);
        }
    }
    function closePdf() {
        if (pdfUrl.current) URL.revokeObjectURL(pdfUrl.current);
        pdfUrl.current = "";
        setPdf("");
    }
    return (
        <>
            <section
                className={styles.card}
                aria-label="Filtros del reporte de cepos"
            >
                <h2>Reporte operativo de cepos</h2>
                <p className={local.hint}>
                    Revisa avisos registrados por período, estado y agente, con
                    sus comprobantes de pago y fechas de liberación.
                </p>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        void search();
                    }}
                >
                    <div className={local.form}>
                        <div>
                            <label htmlFor="cct-report-fechaBase">
                                Fecha a considerar
                            </label>
                            <select
                                id="cct-report-fechaBase"
                                className={styles.control}
                                value={form.fechaBase}
                                onChange={(e) =>
                                    set("fechaBase", e.target.value)
                                }
                            >
                                {Object.entries(CCT_REPORT_DATE_LABELS).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="cct-report-desde">Desde *</label>
                            <input
                                id="cct-report-desde"
                                className={styles.control}
                                type="date"
                                required
                                value={form.desde}
                                onChange={(e) => set("desde", e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="cct-report-hasta">Hasta *</label>
                            <input
                                id="cct-report-hasta"
                                className={styles.control}
                                type="date"
                                required
                                min={form.desde}
                                value={form.hasta}
                                onChange={(e) => set("hasta", e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="cct-report-estado">
                                Estado actual
                            </label>
                            <select
                                id="cct-report-estado"
                                className={styles.control}
                                value={form.estado}
                                onChange={(e) => set("estado", e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                {Object.entries(CCT_STATES).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="cct-report-tipoAgente">
                                Tipo de agente (código, opcional)
                            </label>
                            <input
                                id="cct-report-tipoAgente"
                                className={styles.control}
                                inputMode="numeric"
                                pattern="[1-9][0-9]{0,17}"
                                maxLength={18}
                                value={form.tipoAgente}
                                onChange={(e) =>
                                    set("tipoAgente", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label htmlFor="cct-report-agente">
                                Chapa del agente colocador (opcional)
                            </label>
                            <input
                                id="cct-report-agente"
                                className={styles.control}
                                inputMode="numeric"
                                pattern="[1-9][0-9]{0,17}"
                                maxLength={18}
                                value={form.agente}
                                onChange={(e) => set("agente", e.target.value)}
                            />
                        </div>
                    </div>
                    <Button type="submit" state={busy ? "disabled" : "default"}>
                        {busy ? "Preparando…" : "Generar reporte de cepos"}
                    </Button>
                    <p className={local.hint}>
                        El período usa la fecha elegida y la hora de Guatemala.
                        El estado corresponde al registro actual del aviso. Sin
                        un tipo de agente, la chapa incluye todos los tipos.
                    </p>
                </form>
            </section>
            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}
            {result && applied && (
                <section
                    className={styles.card}
                    aria-label="Resultados del reporte de cepos"
                >
                    <div className={styles.toolbar}>
                        <h2>Avisos del período</h2>
                        <div className={local.buttons}>
                            <Button
                                variant="outlined"
                                state={
                                    busy || exporting ? "disabled" : "default"
                                }
                                onClick={() => void exportReport("pdf")}
                            >
                                Ver PDF de cepos
                            </Button>
                            <Button
                                variant="outlined"
                                state={
                                    busy || exporting ? "disabled" : "default"
                                }
                                onClick={() => void exportReport("csv")}
                            >
                                Exportar reporte CSV
                            </Button>
                        </div>
                    </div>
                    <p className={local.hint}>
                        {CCT_REPORT_DATE_LABELS[applied.fechaBase]} ·{" "}
                        {day(applied.desde)} al {day(applied.hasta)} ·{" "}
                        {CCT_STATES[applied.estado] || "Todos los estados"} ·
                        Tipo de agente: {applied.tipoAgente || "Todos"} · Chapa:{" "}
                        {applied.agente || "Todas"}
                    </p>
                    <div
                        className={local.summary}
                        aria-label="Resumen del período"
                    >
                        <div>
                            Avisos<strong>{result.resumen.total}</strong>
                        </div>
                        {[
                            ["C", "Colocados"],
                            ["P", "Pago registrado"],
                            ["L", "Liberados"],
                            ["D", "Dañados"],
                            ["R", "Robados"],
                        ].map(([code, label]) => (
                            <div key={code}>
                                {label}
                                <strong>
                                    {result.resumen.estados[code] || 0}
                                </strong>
                            </div>
                        ))}
                    </div>
                    <p className={local.hint}>
                        Resumen de todos los resultados filtrados. Las
                        exportaciones incluyen el reporte completo hasta 2000
                        avisos; si se supera ese límite, se solicitará
                        delimitarlo.
                        {" "}Desplaza la tabla horizontalmente para consultar todas las columnas.
                    </p>
                    <CctTable
                        wide
                        label="Cepos por período"
                        items={result.items}
                        columns={[
                            "AVISO",
                            "FECHA",
                            "TPLACA",
                            "NPLACA",
                            "CEPO_FISICO",
                            "ESTATUS",
                            "TIPO_AGENTE",
                            "AGENTE",
                            "LUGAR",
                            "ORIGEN_PAGO",
                            "BOLETA",
                            "FECHA_DEPOSITO",
                            "HORA_LIBERACION",
                        ]}
                    />
                    <CctPager
                        data={result}
                        disabled={busy}
                        onPage={(offset) => void search(applied, offset)}
                    />
                </section>
            )}
            <dialog
                ref={dialog}
                className={local.dialog}
                aria-label="Reporte operativo de cepos en PDF"
                onClose={closePdf}
            >
                <header>
                    <strong>Reporte operativo de cepos</strong>
                    <div className={local.buttons}>
                        {pdf && (
                            <a href={pdf} download="CCT-reporte-cepos.pdf">
                                Descargar PDF
                            </a>
                        )}
                        <Button
                            variant="outlined"
                            onClick={() => dialog.current?.close()}
                        >
                            Cerrar
                        </Button>
                    </div>
                </header>
                {pdf && (
                    <iframe
                        src={pdf}
                        title="Reporte operativo de cepos en PDF"
                    />
                )}
            </dialog>
        </>
    );
}
