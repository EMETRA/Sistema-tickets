"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/client/atoms/Button";
import { PlatformError, platformFetch } from "@/platform/client";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import local from "./WorkerNotificationsWorkspace.module.scss";

const channels = {
    CORREO: "Multas",
    VIVI_PMT_CORREO: "Multas de Avísame",
    VIVI_DENUNCIA_CORREO: "Avisos VIVI",
    VIVI_NOTICIA_PUSH: "Noticias",
} as const;
type Channel = keyof typeof channels;
const outcomes = {
    SMTP: "Aceptados por SMTP",
    DSN_POSITIVO: "DSN positivo",
    ENTREGADO: "Entregados",
    REBOTADO: "Rebotados",
    BUZON_INEXISTENTE: "Buzón inexistente",
} as const;
type Outcome = keyof typeof outcomes;
type Section = "resumen" | "resultados" | "cola" | "multa";
type MailItem = Pick<QueueItem, "ciudad" | "serie" | "remision"> & {
    mensaje: string | null;
    smtpEn: string | null;
    destinoAcepto: boolean;
    entregado: boolean;
    rebotado: boolean;
    buzonInexistente: boolean;
};
type MailSummary = {
    canal: Channel;
    enviados: number;
    destinoAcepto: number;
    entregados: number;
    rebotados: number;
    buzonInexistente: number;
    sinCorreo: number;
};
type Summary = {
    correo: MailSummary[];
    noticias: { enviados: number; recibos: number; invalidos: number; inciertos: number };
    pendientes: { canal: Channel; total: number }[];
};
type QueueItem = {
    id: string;
    evento: string;
    canal: Channel;
    estado: string;
    intentos: number;
    ciudad: number | null;
    serie: string | null;
    remision: number | null;
    proximoIntento: string | null;
    completadoEn: string | null;
    codigo: string | null;
};
type Page<T> = { items: T[]; offset: number; hayMas: boolean };
type MailResults = Page<MailItem & { canal: Channel; caso: string | null }>;
type Fine = {
    hayMas: boolean;
    cola: QueueItem[];
    notificaciones: (MailItem & {
        id: string;
        canal: Channel;
        estado: string;
    })[];
};
const request = <T,>(path: string, values: Record<string, string>, signal?: AbortSignal) =>
    platformFetch<T>("/worker-notifications/" + path + "?" + new URLSearchParams(values), { signal });
const labels = new Intl.DateTimeFormat("es-GT", {
    timeZone: "America/Guatemala", dateStyle: "short", timeStyle: "short",
});
const civil = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Guatemala" });
const time = (value: string | null) => value && Number.isFinite(Date.parse(value)) ? labels.format(new Date(value)) : "—";
const count = new Intl.NumberFormat("es-GT");
const state = (value: string) => value.replaceAll("_", " ");
const fineKey = (row: Pick<QueueItem, "ciudad" | "serie" | "remision">) =>
    row.serie && row.remision ? [row.ciudad, row.serie, row.remision].filter(Boolean).join("-") : "—";
const dsnStatus = (row: MailItem) => row.buzonInexistente
    ? "Buzón inexistente"
    : row.rebotado ? "Rebotado" : row.entregado ? "Entregado"
    : row.destinoAcepto ? "Aceptado por destino" : "Sin respuesta DSN registrada";
const errorText = (e: unknown) =>
    (e instanceof Error ? e.message : "No se pudo cargar la consulta.") +
    (e instanceof PlatformError && e.reference ? " Referencia " + e.reference : "");

function QueueTable({ rows, inspect }: { rows: QueueItem[]; inspect?: (q: string) => void }) {
    if (!rows.length) return <p className={styles.muted}>No hay resultados para esta búsqueda.</p>;
    return (
        <div className={styles.tableRegion}>
            <table className={styles.table} aria-label="Procesamientos en la cola">
                <thead><tr><th>Evento</th><th>Canal</th><th>Multa</th><th>Estado</th><th>Intentos</th><th>Próximo intento</th><th>Completado</th><th>Último código</th></tr></thead>
                <tbody>{rows.map((row) => {
                    const key = fineKey(row);
                    return <tr key={row.id}>
                        <td>{row.evento}</td><td>{channels[row.canal]}</td>
                        <td>{inspect && key !== "—" ? <button className={local.link} type="button" onClick={() => inspect(key)}>{key}</button> : key}</td>
                        <td>{state(row.estado)}</td><td>{row.intentos}</td>
                        <td>{time(row.proximoIntento)}</td><td>{time(row.completadoEn)}</td><td>{row.codigo || "—"}</td>
                    </tr>;
                })}</tbody>
            </table>
        </div>
    );
}

function Pages({ offset, hayMas, onChange }: { offset: number; hayMas: boolean; onChange: (offset: number) => void }) {
    if (!offset && !hayMas) return null;
    return <div className={local.tabs}>
        {offset > 0 && <Button type="button" variant="outlined" onClick={() => onChange(Math.max(0, offset - 30))}>Anterior</Button>}
        {hayMas && <Button type="button" variant="outlined" onClick={() => onChange(offset + 30)}>Siguiente</Button>}
    </div>;
}

export function WorkerNotificationsWorkspace() {
    const [tab, setTab] = useState<Section>("resumen");
    const [period, setPeriod] = useState(() => ({
        desde: civil.format(new Date(Date.now() - 6 * 86400000)),
        hasta: civil.format(new Date()),
    }));
    const [summaryPeriod, applyPeriod] = useState(period);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [resultChannel, setResultChannel] = useState<Channel>("CORREO");
    const [outcome, setOutcome] = useState<Outcome>("DSN_POSITIVO");
    const [resultQuery, applyResult] = useState({ ...period, canal: resultChannel, resultado: outcome, offset: "0" });
    const [mailResults, setMailResults] = useState<MailResults | null>(null);
    const [filters, setFilters] = useState({ q: "", canal: "", estado: "" });
    const [queueQuery, applyQueue] = useState({ ...filters, offset: "0" });
    const [queue, setQueue] = useState<Page<QueueItem> | null>(null);
    const [fineInput, setFineInput] = useState("");
    const [fineQuery, setFineQuery] = useState<{ q: string } | null>(null);
    const [fine, setFine] = useState<Fine | null>(null);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");
    useEffect(() => {
        const controller = new AbortController();
        let current = true;
        const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(45000)]);
        if (tab === "multa" && !fineQuery) {
            setPending(false);
            setError("");
            return;
        }
        setPending(true);
        setError("");
        const read = async () => {
            try {
                if (tab === "resumen") {
                    const result = await request<Summary>("summary", summaryPeriod, signal);
                    if (current) setSummary(result);
                } else if (tab === "cola") {
                    const result = await request<Page<QueueItem>>("pending", queueQuery, signal);
                    if (current) setQueue(result);
                } else if (tab === "resultados") {
                    const result = await request<MailResults>("results", resultQuery, signal);
                    if (current) setMailResults(result);
                } else if (fineQuery) {
                    const result = await request<Fine>("fine", fineQuery, signal);
                    if (current) setFine(result);
                }
            } catch (e) {
                if (current) setError(errorText(e));
            } finally {
                if (current) setPending(false);
            }
        };
        void read();
        return () => { current = false; controller.abort(); };
    }, [tab, summaryPeriod, queueQuery, fineQuery, resultQuery]);
    function inspect(key: string) {
        setFineInput(key);
        setFineQuery({ q: key });
        setFine(null);
        setTab("multa");
    }
    function inspectResults(canal: Channel, resultado: Outcome) {
        setResultChannel(canal);
        setOutcome(resultado);
        setMailResults(null);
        applyResult({ ...summaryPeriod, canal, resultado, offset: "0" });
        setTab("resultados");
    }
    function onSearch(event: FormEvent) {
        event.preventDefault();
        if (tab === "resumen") { setSummary(null); applyPeriod({ ...period }); }
        if (tab === "cola") { setQueue(null); applyQueue({ ...filters, offset: "0" }); }
        if (tab === "resultados") inspectResults(resultChannel, outcome);
        if (tab === "multa" && fineInput.trim()) inspect(fineInput.trim());
    }
    const next = (offset: number) => {
        setQueue(null);
        applyQueue({ ...queueQuery, offset: String(offset) });
    };
    return (
        <section className={styles.page}>
            <nav aria-label="Vistas del reporte" className={local.tabs}>
                {([["resumen", "Resumen"], ["resultados", "Resultados de correo"], ["cola", "Cola pendiente"], ["multa", "Buscar multa"]] as const).map(([key, label]) =>
                    <Button key={key} type="button" variant={tab === key ? "contained" : "outlined"}
                        aria-pressed={tab === key} onClick={() => key === "resultados" ? inspectResults(resultChannel, outcome) : setTab(key)}>{label}</Button>,
                )}
            </nav>
            <form className={local.filters} onSubmit={onSearch} aria-label="Filtros de notificaciones">
                {tab === "resumen" && <>
                    <label className={styles.field}>Desde<input required type="date" className={styles.control} value={period.desde} onChange={(e) => setPeriod({ ...period, desde: e.target.value })}/></label>
                    <label className={styles.field}>Hasta<input required type="date" min={period.desde} className={styles.control} value={period.hasta} onChange={(e) => setPeriod({ ...period, hasta: e.target.value })}/></label>
                </>}
                {tab === "cola" && <>
                    <label className={styles.field}>Multa o número de evento<input className={styles.control} placeholder="V-40" maxLength={24} value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })}/></label>
                    <label className={styles.field}>Canal<select className={styles.control} value={filters.canal} onChange={(e) => setFilters({ ...filters, canal: e.target.value })}>
                        <option value="">Todos</option>{Object.entries(channels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                    </select></label>
                    <label className={styles.field}>Estado<select className={styles.control} value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })}>
                        <option value="">Todos</option><option value="PENDIENTE">Pendiente</option><option value="REINTENTO">Reintento</option><option value="EN_PROCESO">En proceso</option>
                    </select></label>
                </>}
                {tab === "resultados" && <>
                    <label className={styles.field}>Canal<select className={styles.control} value={resultChannel} onChange={e => setResultChannel(e.target.value as Channel)}>
                        {Object.entries(channels).filter(([key]) => key !== "VIVI_NOTICIA_PUSH").map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select></label>
                    <label className={styles.field}>Resultado<select className={styles.control} value={outcome} onChange={e => setOutcome(e.target.value as Outcome)}>
                        {Object.entries(outcomes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select></label>
                </>}
                {tab === "multa" && <label className={styles.field}>Serie y número<input required className={styles.control} maxLength={24} placeholder="V-40 o 1-V-40" value={fineInput} onChange={(e) => setFineInput(e.target.value)}/></label>}
                <Button type="submit" state={pending ? "disabled" : "default"}>{tab === "resumen" ? "Actualizar" : "Buscar"}</Button>
            </form>
            {error && <p role="alert" className={styles.error}>{error}</p>}
            {pending && <p role="status" className={styles.muted}>Consultando…</p>}
            {tab === "resumen" && summary && !error && (
                <div className={local.sections}>
                    <section className={styles.card}>
                        <h3>Correo · {summaryPeriod.desde} a {summaryPeriod.hasta}</h3>
                        <p className={styles.muted}>Los envíos se cuentan cuando SMTP los acepta. Los resultados DSN se actualizan al recibir respuesta. Un buzón inexistente también cuenta como rebote.</p>
                        <div className={styles.tableRegion}><table className={styles.table}>
                            <thead><tr><th>Canal</th><th>Aceptados por SMTP</th><th>DSN positivo</th><th>Entregados</th><th>Rebotados</th><th>Buzón inexistente</th><th>Sin correo registrado</th></tr></thead>
                            <tbody>{summary.correo.map((row) => <tr key={row.canal}><th scope="row">{channels[row.canal]}</th>
                                {([
                                    ["SMTP", row.enviados], ["DSN_POSITIVO", row.destinoAcepto], ["ENTREGADO", row.entregados],
                                    ["REBOTADO", row.rebotados], ["BUZON_INEXISTENTE", row.buzonInexistente],
                                ] as const).map(([resultado, total]) => <td key={resultado}>{total ? <button type="button" className={local.link}
                                    aria-label={outcomes[resultado] + " · " + channels[row.canal] + " · " + count.format(total)}
                                    onClick={() => inspectResults(row.canal, resultado)}>{count.format(total)}</button> : "0"}</td>)}
                                <td>{count.format(row.sinCorreo)}</td></tr>)}</tbody>
                        </table></div>
                    </section>
                    <section className={styles.card}>
                        <h3>Noticias push</h3>
                        <p className={styles.muted}>Según la última actualización del envío en el período. El recibo de Expo confirma el procesamiento por el proveedor.</p>
                        <dl className={local.metrics}>
                            <div><dt>Aceptados por Expo</dt><dd>{count.format(summary.noticias.enviados)}</dd></div>
                            <div><dt>Recibos confirmados</dt><dd>{count.format(summary.noticias.recibos)}</dd></div>
                            <div><dt>Rechazados</dt><dd>{count.format(summary.noticias.invalidos)}</dd></div>
                            <div><dt>Resultado incierto</dt><dd>{count.format(summary.noticias.inciertos)}</dd></div>
                        </dl>
                    </section>
                    <section className={styles.card}>
                        <h3>Cola actual</h3>
                        <dl className={local.metrics}>{summary.pendientes.map(({ canal, total }) => <div key={canal}><dt>{channels[canal]}</dt><dd>{count.format(total)}</dd></div>)}</dl>
                        <Button type="button" variant="outlined" onClick={() => setTab("cola")}>Ver cola pendiente</Button>
                    </section>
                </div>
            )}
            {tab === "cola" && queue && !error && <section className={styles.card}>
                <QueueTable rows={queue.items} inspect={inspect}/>
                <Pages {...queue} onChange={next}/>
            </section>}
            {tab === "resultados" && mailResults && !error && <section className={styles.card}>
                <h3>{outcomes[resultQuery.resultado]} · {channels[resultQuery.canal]}</h3>
                <p className={styles.muted}>{resultQuery.desde} a {resultQuery.hasta}</p>
                {!mailResults.items.length ? <p className={styles.muted}>No hay mensajes con ese resultado.</p> :
                    <div className={styles.tableRegion}><table className={styles.table} aria-label="Resultados de correo">
                        <thead><tr><th>Mensaje</th><th>Multa o aviso</th><th>Aceptado SMTP</th><th>Resultado DSN</th></tr></thead>
                        <tbody>{mailResults.items.map(row => {
                            const key = fineKey(row);
                            return <tr key={row.mensaje}>
                                <td>{row.mensaje}</td>
                                <td>{key === "—" ? (row.caso ? "Aviso " + row.caso : "—") : <button type="button" className={local.link} onClick={() => inspect(key)}>{key}</button>}</td>
                                <td>{time(row.smtpEn)}</td><td>{dsnStatus(row)}</td>
                            </tr>;
                        })}</tbody>
                    </table></div>}
                <Pages {...mailResults} onChange={(offset) => { setMailResults(null); applyResult({ ...resultQuery, offset: String(offset) }); }}/>
            </section>}
            {tab === "multa" && fine && !error && <div className={local.sections}>
                <section className={styles.card}>
                    <h3>Notificaciones de {fineQuery?.q}</h3>
                    {!fine.notificaciones.length ? <p className={styles.muted}>La multa no tiene una notificación de correo registrada.</p> :
                        <div className={styles.tableRegion}><table className={styles.table}>
                            <thead><tr><th>Multa</th><th>Canal</th><th>Notificación</th><th>Estado</th><th>Aceptado SMTP</th><th>Resultado DSN</th></tr></thead>
                            <tbody>{fine.notificaciones.map((row) => <tr key={[row.id, row.mensaje].join("-")}>
                                <td>{fineKey(row)}</td><td>{channels[row.canal]}</td><td>{row.id}</td><td>{state(row.estado)}</td>
                                <td>{time(row.smtpEn)}</td><td>{dsnStatus(row)}</td>
                            </tr>)}</tbody>
                        </table></div>}
                    {fine.hayMas && <p className={styles.muted}>Se muestran hasta 30 resultados de cada tipo. Incluye la ciudad para precisar la búsqueda.</p>}
                </section>
                <section className={styles.card}><h3>Estado en la cola</h3><QueueTable rows={fine.cola}/></section>
            </div>}
        </section>
    );
}
