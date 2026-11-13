"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { usePlatform } from "@/platform/context";
import { platformFetch, platformCommand } from "@/platform/client";
import {
    CCT_SOURCES,
    cctCsv,
    cctQuery,
    cctPdfBlob,
    type CctBootstrap,
    type CctPage,
    type CctRow,
} from "@/platform/cct";
import { CctData, CctPager, CctTable, cctError } from "./CctParts";
import { CctCepos } from "./CctCepos";
import { CctCepoReport } from "./CctCepoReport";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import local from "./CctWorkspace.module.scss";
function downloadCsv(rows: CctRow[]) {
    const url = URL.createObjectURL(
            new Blob([cctCsv(rows)], { type: "text/csv;charset=utf-8" }),
        ),
        a = document.createElement("a");
    a.href = url;
    a.download = "CCT-pagina.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}
function Notification({
    row,
    source,
    bootstrap,
    onDone,
    admin,
    plate,
}: {
    row: CctRow;
    source: string;
    bootstrap: CctBootstrap;
    onDone: () => void;
    admin: boolean;
    plate?: Record<string, string>;
}) {
    const [name, setName] = useState(""),
        [accepted, setAccepted] = useState(false),
        [busy, setBusy] = useState(false),
        [error, setError] = useState(""),
        [done, setDone] = useState(""),
        [preview, setPreview] = useState<{
            items: CctRow[];
            total: number;
            version: string;
        } | null>(null);
    const flight = useRef(false),
        active = useRef(true);
    useEffect(() => {
        active.current = true;
        return () => {
            active.current = false;
        };
    }, []);
    const availability = bootstrap.disponibilidad.notificar;
    if (source === "CEPO" || !bootstrap.acciones.notificar) return null;
    async function prepare() {
        setError("");
        setBusy(true);
        try {
            setPreview(
                await platformFetch(
                    "/cct/notificaciones/preview?" +
                        cctQuery({
                            fuente: source,
                            tipoPlaca: plate!.tipoPlaca,
                            placa: plate!.placa,
                        }),
                ),
            );
            setAccepted(false);
        } catch (e) {
            setError(cctError(e));
        } finally {
            setBusy(false);
        }
    }
    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (flight.current || !accepted) return;
        flight.current = true;
        setError("");
        setBusy(true);
        try {
            const payload = preview
                ? {
                      version: preview.version,
                      data: {
                          fuente: source,
                          tipoPlaca: plate!.tipoPlaca,
                          placa: plate!.placa,
                          nombre: name,
                      },
                  }
                : {
                      data: {
                          fuente: source,
                          serie: row.SERIE,
                          numero: row.REMISION,
                          nombre: name,
                      },
                  };
            await platformCommand(
                "/cct/notificaciones" + (preview ? "/placa" : ""),
                "POST",
                payload,
                admin,
                preview
                    ? "Registrar notificación de " +
                          preview.total +
                          " remisiones"
                    : "Registrar persona notificada",
            );
            if (active.current) {
                setDone("Notificación registrada.");
                onDone();
            }
        } catch (e) {
            setError(cctError(e));
        } finally {
            flight.current = false;
            setBusy(false);
        }
    }
    return (
        <section className={local.review} aria-label="Registrar notificación">
            <h3>Persona notificada</h3>
            {!availability.habilitado ? (
                <p>{availability.motivo}</p>
            ) : done ? (
                <p role="status" className={local.success}>
                    {done}
                </p>
            ) : (
                <>
                    <p className={local.hint}>
                        Registra la persona y la fecha de notificación. Los
                        registros que ya tienen notificación se conservan.
                    </p>
                    {plate && !preview && (
                        <Button
                            variant="outlined"
                            state={busy ? "disabled" : "default"}
                            onClick={() => void prepare()}
                        >
                            Preparar notificación de la placa
                        </Button>
                    )}
                    {preview && (
                        <>
                            <p>
                                {preview.total} remisiones sin notificar en esta
                                fuente para {plate!.tipoPlaca} {plate!.placa}.
                            </p>
                            <CctTable
                                label="Remisiones que se notificarán"
                                items={preview.items}
                            />
                            <Button
                                variant="outlined"
                                onClick={() => void prepare()}
                            >
                                Actualizar vista previa
                            </Button>
                        </>
                    )}
                    <form onSubmit={submit}>
                        <div className={styles.field}>
                            <label htmlFor="cct-notificado">
                                Nombre de la persona notificada *
                            </label>
                            <input
                                id="cct-notificado"
                                className={styles.control}
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setAccepted(false);
                                }}
                                maxLength={250}
                                required
                                disabled={busy}
                            />
                        </div>
                        <label className={local.check}>
                            <input
                                type="checkbox"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                required
                                disabled={busy}
                            />
                            {preview
                                ? "Confirmo la persona y las remisiones de la vista previa."
                                : "Confirmo la persona y la remisión seleccionada."}
                        </label>
                        <Button
                            type="submit"
                            state={
                                busy || !accepted || preview?.total === 0
                                    ? "disabled"
                                    : "default"
                            }
                        >
                            {busy
                                ? "Registrando…"
                                : preview
                                  ? "Notificar las remisiones revisadas"
                                  : "Registrar notificación individual"}
                        </Button>
                    </form>
                </>
            )}
            {error && (
                <p className={styles.error} role="alert">
                    {error} Conservamos los datos para reintentar.
                </p>
            )}
        </section>
    );
}
function Remisiones({
    bootstrap,
    report = false,
}: {
    bootstrap: CctBootstrap;
    report?: boolean;
}) {
    const { data: runtime } = usePlatform();
    const [form, setForm] = useState({
            tipo: "placa",
            tipoPlaca: "P",
            placa: "",
            serie: "",
            numero: "",
            agente: "",
            fuente: report ? "TODAS" : "TRANSITO",
            estado: "PENDIENTES",
        }),
        [result, setResult] = useState<CctPage | null>(null),
        [applied, setApplied] = useState<Record<string, string> | null>(null),
        [busy, setBusy] = useState(false),
        [error, setError] = useState(""),
        [selected, setSelected] = useState<CctRow | null>(null),
        [detail, setDetail] = useState<Record<string, unknown> | null>(null),
        [detailError, setDetailError] = useState(""),
        [detailBusy, setDetailBusy] = useState(false),
        [pdf, setPdf] = useState("");
    const request = useRef<AbortController | null>(null),
        detailRequest = useRef<AbortController | null>(null),
        dialog = useRef<HTMLDialogElement>(null),
        pdfUrl = useRef("");
    useEffect(
        () => () => {
            request.current?.abort();
            detailRequest.current?.abort();
            if (pdfUrl.current) URL.revokeObjectURL(pdfUrl.current);
        },
        [],
    );
    const set = (k: keyof typeof form, v: string) =>
        setForm((f) => ({
            ...f,
            [k]: v,
            ...(k === "tipo" && v !== "placa" && f.fuente === "TODAS"
                ? { fuente: "TRANSITO" }
                : {}),
        }));
    function current() {
        const q: Record<string, string> = {
            tipo: form.tipo,
            fuente: form.fuente,
            estado: form.estado,
        };
        if (form.tipo === "placa")
            Object.assign(q, { tipoPlaca: form.tipoPlaca, placa: form.placa });
        else if (form.tipo === "boleta")
            Object.assign(q, { serie: form.serie, numero: form.numero });
        else q.agente = form.agente;
        return q;
    }
    async function search(q: Record<string, string> = current(), offset = 0) {
        request.current?.abort();
        const ctl = new AbortController();
        request.current = ctl;
        setBusy(true);
        setError("");
        try {
            const r = await platformFetch<CctPage>(
                "/cct/" +
                    (report ? "reportes" : "remisiones") +
                    "?" +
                    cctQuery({ ...q, offset: String(offset) }),
                { signal: ctl.signal },
            );
            if (ctl.signal.aborted) return;
            setResult(r);
            setApplied({ ...q });
            setSelected(null);
            setDetail(null);
        } catch (e) {
            if (!ctl.signal.aborted) setError(cctError(e));
        } finally {
            if (!ctl.signal.aborted) setBusy(false);
        }
    }
    async function open(row: CctRow) {
        detailRequest.current?.abort();
        const ctl = new AbortController();
        detailRequest.current = ctl;
        setSelected(row);
        setDetail(null);
        setDetailBusy(true);
        setDetailError("");
        try {
            setDetail(
                await platformFetch(
                    "/cct/remisiones/detalle?" +
                        cctQuery({
                            fuente: applied!.fuente,
                            serie: row.SERIE!,
                            numero: row.REMISION!,
                        }),
                    { signal: ctl.signal },
                ),
            );
        } catch (e) {
            if (!ctl.signal.aborted) setDetailError(cctError(e));
        } finally {
            if (!ctl.signal.aborted) setDetailBusy(false);
        }
    }
    async function showPdf() {
        if (!applied) return;
        setBusy(true);
        setError("");
        try {
            const blob = await platformFetch<Blob>(
                "/cct/reportes/pdf?" + cctQuery(applied),
            );
            await cctPdfBlob(blob);
            if (pdfUrl.current) URL.revokeObjectURL(pdfUrl.current);
            const url = URL.createObjectURL(blob);
            pdfUrl.current = url;
            setPdf(url);
            dialog.current?.showModal();
        } catch (e) {
            setError(cctError(e));
        } finally {
            setBusy(false);
        }
    }
    const fields =
        form.tipo === "placa"
            ? [
                  ["tipoPlaca", "Tipo de placa", 3],
                  ["placa", "Placa", 20],
              ]
            : form.tipo === "boleta"
              ? [
                    ["serie", "Serie", 3],
                    [
                        "numero",
                        form.fuente === "CEPO"
                            ? "Número de aviso"
                            : "Número de remisión",
                        18,
                    ],
                ]
              : [["agente", "Chapa del agente", 18]];
    return (
        <>
            <section className={styles.card}>
                <h2>
                    {report
                        ? "Estado de cuenta por placa"
                        : "Remisiones y solvencias"}
                </h2>
                <p className={local.hint}>
                    {report
                        ? "Prepara un documento por placa, con el resumen de las fuentes seleccionadas para revisar, descargar e imprimir."
                        : "Consulta los registros de cada fuente y sus antecedentes por placa, boleta o agente."}
                </p>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        void search();
                    }}
                >
                    <div className={local.form}>
                        {!report && (
                            <div>
                                <label htmlFor="cct-busqueda">Buscar por</label>
                                <select
                                    id="cct-busqueda"
                                    className={styles.control}
                                    value={form.tipo}
                                    onChange={(e) =>
                                        set("tipo", e.target.value)
                                    }
                                >
                                    <option value="placa">Placa</option>
                                    <option value="boleta">
                                        Boleta / aviso
                                    </option>
                                    <option value="agente">Agente</option>
                                </select>
                            </div>
                        )}
                        {fields.map(([k, label, max]) => (
                            <div key={k}>
                                <label htmlFor={"cct-" + k}>{label} *</label>
                                <input
                                    id={"cct-" + k}
                                    className={styles.control}
                                    value={form[k as keyof typeof form]}
                                    onChange={(e) =>
                                        set(
                                            k as keyof typeof form,
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    maxLength={Number(max)}
                                    required
                                />
                            </div>
                        ))}
                        <div>
                            <label htmlFor="cct-fuente">Fuente</label>
                            <select
                                id="cct-fuente"
                                className={styles.control}
                                value={form.fuente}
                                onChange={(e) => set("fuente", e.target.value)}
                            >
                                {report && form.tipo === "placa" && (
                                    <option value="TODAS">
                                        Todas las fuentes
                                    </option>
                                )}
                                {Object.entries(CCT_SOURCES)
                                    .filter(
                                        ([k]) =>
                                            form.tipo !== "agente" ||
                                            k !== "EMPRESA",
                                    )
                                    .map(([k, label]) => (
                                        <option key={k} value={k}>
                                            {label}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="cct-alcance">Alcance</label>
                            <select
                                id="cct-alcance"
                                className={styles.control}
                                value={form.estado}
                                onChange={(e) => set("estado", e.target.value)}
                            >
                                <option value="PENDIENTES">Pendientes</option>
                                <option value="HISTORIAL">Historial</option>
                            </select>
                        </div>
                    </div>
                    <Button type="submit" state={busy ? "disabled" : "default"}>
                        {busy
                            ? "Consultando…"
                            : report
                              ? "Preparar estado de cuenta"
                              : "Consultar remisiones"}
                    </Button>
                </form>
            </section>
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                </p>
            )}
            {result && (
                <section
                    className={styles.card}
                    aria-label="Resultados de remisiones"
                >
                    <div className={styles.toolbar}>
                        <h2>
                            {report
                                ? "Resumen del estado de cuenta"
                                : "Resultados de la consulta"}
                        </h2>
                        <div className={local.buttons}>
                            {report && (
                                <Button
                                    variant="outlined"
                                    state={busy ? "disabled" : "default"}
                                    onClick={() => void showPdf()}
                                >
                                    Ver PDF del reporte completo
                                </Button>
                            )}
                            <Button
                                variant="outlined"
                                onClick={() =>
                                    downloadCsv(
                                        result.grupos
                                            ? result.grupos.flatMap((g) =>
                                                  g.items.map((r) => ({
                                                      ...r,
                                                      FUENTE: g.fuente!,
                                                  })),
                                              )
                                            : result.items,
                                    )
                                }
                            >
                                Exportar página CSV
                            </Button>
                        </div>
                    </div>
                    <p className={local.hint}>
                        {applied?.tipo === "placa"
                            ? "Placa " + applied.tipoPlaca + " " + applied.placa
                            : applied?.tipo === "agente"
                              ? "Agente " + applied.agente
                              : "Boleta " +
                                applied?.serie +
                                "-" +
                                applied?.numero}{" "}
                        ·{" "}
                        {applied?.estado === "HISTORIAL"
                            ? "Historial"
                            : "Pendientes"}
                    </p>
                    {result.grupos ? (
                        result.grupos.map((group) => (
                            <section key={group.fuente}>
                                <h3>
                                    {
                                        CCT_SOURCES[
                                            group.fuente as keyof typeof CCT_SOURCES
                                        ]
                                    }
                                </h3>
                                <p>
                                    {group.total} registros · Q{" "}
                                    {group.monto || "0"}
                                </p>
                                <CctTable
                                    label={"Remisiones de " + group.fuente}
                                    items={group.items}
                                />
                                {group.hayMas && (
                                    <Button
                                        variant="outlined"
                                        onClick={() =>
                                            void search({
                                                ...applied!,
                                                fuente: group.fuente!,
                                            })
                                        }
                                    >
                                        Consultar todas las páginas de esta
                                        fuente
                                    </Button>
                                )}
                            </section>
                        ))
                    ) : (
                        <>
                            <div className={local.summary}>
                                <div>
                                    Registros<strong>{result.total}</strong>
                                </div>
                                <div>
                                    Importe de la consulta
                                    <strong>Q {result.monto || "0"}</strong>
                                </div>
                            </div>
                            <CctTable
                                items={result.items}
                                onSelect={
                                    report ? undefined : (row) => void open(row)
                                }
                            />
                            <CctPager
                                data={result}
                                disabled={busy}
                                onPage={(offset) =>
                                    void search(applied!, offset)
                                }
                            />
                            {result.empalmes?.length ? (
                                <details>
                                    <summary>
                                        Placas vinculadas consultadas
                                    </summary>
                                    <CctTable items={result.empalmes} />
                                </details>
                            ) : null}
                        </>
                    )}
                </section>
            )}
            {selected && (
                <section
                    className={styles.card}
                    aria-label="Detalle de remisión"
                >
                    <div className={styles.toolbar}>
                        <h2>
                            {applied?.fuente} · {selected.SERIE}-
                            {selected.REMISION}
                        </h2>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                detailRequest.current?.abort();
                                setSelected(null);
                                setDetail(null);
                            }}
                        >
                            Cerrar detalle
                        </Button>
                    </div>
                    <CctData row={selected} />
                    {detailBusy && (
                        <p role="status">Cargando infracciones y pagos…</p>
                    )}
                    {detailError && (
                        <p role="alert" className={styles.error}>
                            {detailError}
                            <Button
                                variant="outlined"
                                onClick={() => void open(selected)}
                            >
                                Reintentar detalle
                            </Button>
                        </p>
                    )}
                    {detail &&
                        Object.entries(detail)
                            .filter(
                                ([key]) =>
                                    !["notificacion", "tarifas"].includes(key),
                            )
                            .map(([key, value]) =>
                                Array.isArray(value) ? (
                                    <section key={key}>
                                        <h3>
                                            {key === "pagos"
                                                ? "Pagos"
                                                : key === "infracciones"
                                                  ? "Infracciones"
                                                  : "Observaciones"}
                                        </h3>
                                        <CctTable
                                            label={key}
                                            items={value as CctRow[]}
                                        />
                                    </section>
                                ) : value && typeof value === "object" ? (
                                    <CctData key={key} row={value as CctRow} />
                                ) : null,
                            )}
                    {detail?.notificacion &&
                    (detail.notificacion as { disponible: boolean })
                        .disponible ? (
                        <Notification
                            key={
                                applied!.fuente +
                                selected.SERIE +
                                selected.REMISION
                            }
                            row={selected}
                            source={applied!.fuente}
                            bootstrap={bootstrap}
                            admin={Boolean(runtime?.actor.admin)}
                            plate={
                                applied?.tipo === "placa" ? applied : undefined
                            }
                            onDone={() => void open(selected)}
                        />
                    ) : detail?.notificacion ? (
                        <p className={local.hint}>
                            {(detail.notificacion as { motivo: string }).motivo}
                        </p>
                    ) : null}
                </section>
            )}
            <dialog ref={dialog} className={local.dialog}>
                <header>
                    <strong>Estado de cuenta CCT</strong>
                    <div className={local.buttons}>
                        {pdf && (
                            <a href={pdf} download="CCT-estado-cuenta.pdf">
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
                {pdf && <iframe src={pdf} title="Reporte CCT en PDF" />}
            </dialog>
        </>
    );
}
function Directory({ kind }: { kind: "vehiculos" | "pilotos" | "agentes" }) {
    const [mode, setMode] = useState(
            kind === "vehiculos"
                ? "placa"
                : kind === "pilotos"
                  ? "codigo"
                  : "chapa",
        ),
        [fields, setFields] = useState<Record<string, string>>({
            tipoPlaca: "P",
            tipoLicencia: "C",
        }),
        [result, setResult] = useState<CctPage | null>(null),
        [applied, setApplied] = useState<Record<string, string> | null>(null),
        [selected, setSelected] = useState<CctRow | null>(null),
        [detail, setDetail] = useState<Record<string, unknown> | null>(null),
        [busy, setBusy] = useState(false),
        [error, setError] = useState("");
    const ctl = useRef<AbortController | null>(null),
        pilotRequest = useRef<AbortController | null>(null);
    useEffect(
        () => () => {
            ctl.current?.abort();
            pilotRequest.current?.abort();
        },
        [],
    );
    const choices =
        kind === "vehiculos"
            ? { placa: "Placa", registro: "Registro" }
            : kind === "pilotos"
              ? {
                    codigo: "Código de piloto",
                    licencia: "Licencia",
                    nombre: "Nombre",
                }
              : { chapa: "Chapa", empleado: "Código de empleado" };
    const inputFields =
        kind === "vehiculos"
            ? mode === "placa"
                ? [
                      ["tipoPlaca", "Tipo de placa"],
                      ["placa", "Placa"],
                  ]
                : [["registro", "Número de registro"]]
            : kind === "pilotos"
              ? mode === "codigo"
                  ? [["codigo", "Código de piloto"]]
                  : mode === "nombre"
                    ? [["nombre", "Nombre del piloto"]]
                    : [
                          ["tipoLicencia", "Tipo de licencia"],
                          ["licencia", "Número de licencia"],
                      ]
              : [
                    [
                        "codigo",
                        mode === "empleado" ? "Código de empleado" : "Chapa",
                    ],
                ];
    function current() {
        return {
            tipo: mode,
            ...Object.fromEntries(
                inputFields.map(([key]) => [key, fields[key] || ""]),
            ),
        };
    }
    async function search(q: Record<string, string> = current(), offset = 0) {
        ctl.current?.abort();
        const c = new AbortController();
        ctl.current = c;
        setBusy(true);
        setError("");
        try {
            const r = await platformFetch<CctPage>(
                "/cct/" +
                    kind +
                    "?" +
                    cctQuery({ ...q, offset: String(offset) }),
                { signal: c.signal },
            );
            if (c.signal.aborted) return;
            setResult({
                ...r,
                items: r.items || [],
                total: r.total ?? r.items?.length ?? 0,
                offset: r.offset || 0,
                hayMas: r.hayMas || false,
            });
            setApplied(q);
            setSelected(null);
            setDetail(null);
        } catch (e) {
            if (!c.signal.aborted) setError(cctError(e));
        } finally {
            if (!c.signal.aborted) setBusy(false);
        }
    }
    async function open(row: CctRow) {
        pilotRequest.current?.abort();
        const c = new AbortController();
        pilotRequest.current = c;
        setSelected(row);
        setDetail(null);
        setError("");
        if (kind === "pilotos") {
            setBusy(true);
            try {
                const d = await platformFetch<Record<string, unknown>>(
                    "/cct/pilotos/" + encodeURIComponent(row.CODIGO_PILOTO!),
                    { signal: c.signal },
                );
                if (!c.signal.aborted) setDetail(d);
            } catch (e) {
                if (!c.signal.aborted) setError(cctError(e));
            } finally {
                if (!c.signal.aborted) setBusy(false);
            }
        }
    }
    return (
        <>
            <section className={styles.card}>
                <h2>
                    {kind === "vehiculos"
                        ? "Consulta de vehículos"
                        : kind === "pilotos"
                          ? "Consulta de pilotos"
                          : "Consulta de agentes"}
                </h2>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        void search();
                    }}
                >
                    <div className={local.form}>
                        <div>
                            <label htmlFor="cct-dir-mode">Buscar por</label>
                            <select
                                id="cct-dir-mode"
                                className={styles.control}
                                value={mode}
                                onChange={(e) => setMode(e.target.value)}
                            >
                                {Object.entries(choices).map(([key, label]) => (
                                    <option value={key} key={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {inputFields.map(([key, label]) => (
                            <div key={key}>
                                <label htmlFor={"cct-dir-" + key}>
                                    {label} *
                                </label>
                                <input
                                    id={"cct-dir-" + key}
                                    className={styles.control}
                                    value={fields[key] || ""}
                                    required
                                    maxLength={
                                        key === "nombre"
                                            ? 100
                                            : key === "placa"
                                              ? 20
                                              : 18
                                    }
                                    minLength={key === "nombre" ? 3 : 1}
                                    onChange={(e) =>
                                        setFields((f) => ({
                                            ...f,
                                            [key]: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        ))}
                    </div>
                    <Button type="submit" state={busy ? "disabled" : "default"}>
                        Consultar {kind}
                    </Button>
                </form>
            </section>
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                </p>
            )}
            {result && (
                <section
                    className={styles.card}
                    aria-label="Resultados del directorio"
                >
                    <CctTable
                        label="Coincidencias encontradas"
                        items={result.items}
                        onSelect={(row) => void open(row)}
                    />
                    <CctPager
                        data={result}
                        disabled={busy}
                        onPage={(offset) => void search(applied!, offset)}
                    />
                    {(
                        [
                            "empalmes",
                            "cuenta",
                            "expedientes",
                            "historialExpedientes",
                        ] as const
                    ).map((key) =>
                        result[key]?.length ? (
                            <details key={key}>
                                <summary>
                                    {key === "empalmes"
                                        ? "Empalmes de placas"
                                        : key === "cuenta"
                                          ? "Cuenta corriente"
                                          : key === "expedientes"
                                            ? "Expedientes"
                                            : "Historial de expedientes"}
                                </summary>
                                <CctTable items={result[key]!} />
                            </details>
                        ) : null,
                    )}
                </section>
            )}
            {selected && (
                <section className={styles.card}>
                    <div className={styles.toolbar}>
                        <h2>Ficha seleccionada</h2>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setSelected(null);
                                setDetail(null);
                            }}
                        >
                            Cerrar ficha
                        </Button>
                    </div>
                    <CctData row={selected} />
                    {detail &&
                        Object.entries(detail).map(([k, v]) =>
                            Array.isArray(v) ? (
                                <section key={k}>
                                    <h3>
                                        {k === "capacitaciones"
                                            ? "Capacitaciones"
                                            : "Tarjetones"}
                                    </h3>
                                    <CctTable items={v as CctRow[]} />
                                </section>
                            ) : null,
                        )}
                </section>
            )}
        </>
    );
}
function CctWorkspace({ module }: { module: string }) {
    const [bootstrap, setBootstrap] = useState<CctBootstrap | null>(null),
        [error, setError] = useState(""),
        [tab, setTab] = useState("remisiones"),
        [report, setReport] = useState("cepos");
    const request = useRef<AbortController | null>(null);
    async function load() {
        request.current?.abort();
        const ctl = new AbortController();
        request.current = ctl;
        setError("");
        try {
            setBootstrap(
                await platformFetch("/cct/bootstrap?modulo=" + module, {
                    signal: ctl.signal,
                }),
            );
        } catch (e) {
            if (!ctl.signal.aborted) setError(cctError(e));
        }
    }
    useEffect(() => {
        void load();
        return () => request.current?.abort();
    }, [module]);
    if (error)
        return (
            <section className={styles.card}>
                <h2>No se pudo abrir CCT</h2>
                <p role="alert" className={styles.error}>
                    {error}
                </p>
                <Button variant="outlined" onClick={() => void load()}>
                    Reintentar CCT
                </Button>
            </section>
        );
    if (!bootstrap) return <p role="status">Preparando CCT…</p>;
    return (
        <div className={styles.page}>
            {module === "cct-consultas" ? (
                <>
                    <div
                        className={local.tabs}
                        role="tablist"
                        aria-label="Consultas de CCT"
                    >
                        {[
                            ["remisiones", "Remisiones y solvencias"],
                            ["vehiculos", "Vehículos"],
                            ["pilotos", "Pilotos"],
                            ["agentes", "Agentes"],
                        ].map(([key, label]) => (
                            <button
                                role="tab"
                                aria-selected={tab === key}
                                key={key}
                                onClick={() => setTab(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    {tab === "remisiones" ? (
                        <Remisiones bootstrap={bootstrap} />
                    ) : (
                        <Directory
                            key={tab}
                            kind={tab as "vehiculos" | "pilotos" | "agentes"}
                        />
                    )}
                </>
            ) : module === "cct-reportes" ? (
                <>
                    <div
                        className={local.reportChoices}
                        aria-label="Reportes disponibles"
                    >
                        <button
                            aria-pressed={report === "cepos"}
                            onClick={() => setReport("cepos")}
                        >
                            <strong>Reporte operativo de cepos</strong>
                            <span>
                                Avisos por período, estado y agente. Pagos y
                                liberaciones registrados, resumen y exportación
                                completa.
                            </span>
                        </button>
                        <button
                            aria-pressed={report === "cuenta"}
                            onClick={() => setReport("cuenta")}
                        >
                            <strong>Estado de cuenta por placa</strong>
                            <span>
                                Documento de remisiones por fuente para revisar,
                                descargar e imprimir.
                            </span>
                        </button>
                    </div>
                    {report === "cepos" ? (
                        <CctCepoReport />
                    ) : (
                        <Remisiones bootstrap={bootstrap} report />
                    )}
                </>
            ) : (
                <CctCepos bootstrap={bootstrap} />
            )}
            <p className={local.hint}>
                <Link href="/aplicaciones">Volver a aplicaciones</Link>
            </p>
        </div>
    );
}
export function CctConsultas() {
    return <CctWorkspace module="cct-consultas" />;
}
export function CctFormularios() {
    return <CctWorkspace module="cct-cepos" />;
}
export function CctReportes() {
    return <CctWorkspace module="cct-reportes" />;
}
