"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { usePlatform } from "@/platform/context";
import {
    platformCommand,
    platformFetch,
    PlatformError,
} from "@/platform/client";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import local from "./ViviPmtWorkspace.module.scss";
type Caso = {
    ID: string;
    CODIGO_CASO: string;
    USO_PLACA: string;
    PLACA: string;
    REGLA: number;
    ESTADO: string;
    VERSION: number;
    FECHA_HECHO: string;
    REGISTRADA_EN: string;
    REFERENCIA_LUGAR: string;
    LATITUD: number;
    LONGITUD: number;
    OBSERVACIONES?: string;
    RESERVADA_HASTA?: string;
    VIGENTE: number;
    mia: boolean;
    FUNDAMENTO?: string;
    NUMERO_REMISION?: string;
    SERIE_REMISION?: string;
    USO_PLACA_CONFIRMADO?: string;
    PLACA_CONFIRMADA?: string;
    REGLA_CONFIRMADA?: number;
};
type Archivo = { ID: string; MIME: string; BYTES: string; ESTADO: string };
type Detail = {
    caso: Caso;
    evidencias: Archivo[];
    reglas: { REGLA: number; NOMBRE: string }[];
};
type Config = {
    acciones: { revisar: boolean; imponer: boolean };
    permiteCorrecciones: boolean;
    emisionConfigurada: boolean;
    reservaMinutos: number;
};
const estados: Record<string, string> = {
    PENDIENTE: "Pendientes",
    EN_REVISION: "En revisión",
    MULTADA: "Con multa",
    DESCARTADA: "Descartados",
};
const fecha = (value?: string) =>
    value
        ? new Date(value).toLocaleString("es-GT", {
              timeZone: "America/Guatemala",
              dateStyle: "medium",
              timeStyle: "short",
          })
        : "—";
const errorText = (e: unknown) =>
    (e instanceof Error ? e.message : "No se pudo consultar el reporte.") +
    (e instanceof PlatformError && e.reference
        ? " Referencia: " + e.reference
        : "");
function Evidencia({
    archivo,
    caso,
    checked,
    onCheck,
}: {
    archivo: Archivo;
    caso: string;
    checked: boolean;
    onCheck: (yes: boolean) => void;
}) {
    const [attempt, setAttempt] = useState(0),
        [url, setUrl] = useState(""),
        [error, setError] = useState(""),
        [ready, setReady] = useState(false);
    useEffect(() => {
        const controller = new AbortController();
        let objectUrl = "";
        setUrl("");
        setError("");
        setReady(false);
        onCheck(false);
        platformFetch<Blob>(
            `/vivi-pmt/casos/${caso}/evidencias/${archivo.ID}`,
            { signal: controller.signal },
        )
            .then((blob) => {
                if (controller.signal.aborted) return;
                objectUrl = URL.createObjectURL(blob);
                setUrl(objectUrl);
            })
            .catch((e) => {
                if (!controller.signal.aborted) setError(errorText(e));
            });
        return () => {
            controller.abort();
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [caso, archivo.ID, attempt]);
    return (
        <article className={local.evidence}>
            <strong>
                {archivo.MIME.startsWith("video/") ? "Video" : "Fotografía"}{" "}
                {archivo.ID}
            </strong>
            {error ? (
                <div role="alert">
                    <p>{error}</p>
                    <Button
                        variant="outlined"
                        onClick={() => setAttempt((x) => x + 1)}
                    >
                        Reintentar evidencia
                    </Button>
                </div>
            ) : !url ? (
                <p role="status">Cargando evidencia…</p>
            ) : archivo.MIME.startsWith("video/") ? (
                <video
                    controls
                    preload="metadata"
                    src={url}
                    onLoadedMetadata={() => setReady(true)}
                    onError={() => {
                        setReady(false);
                        setError("No se pudo reproducir el video.");
                    }}
                />
            ) : (
                <a href={url} target="_blank" rel="noreferrer">
                    <img
                        src={url}
                        alt={`Evidencia ${archivo.ID} del reporte`}
                        onLoad={() => setReady(true)}
                        onError={() => {
                            setReady(false);
                            setError("No se pudo mostrar la fotografía.");
                        }}
                    />
                </a>
            )}
            <label>
                <input
                    type="checkbox"
                    disabled={!ready}
                    checked={checked}
                    onChange={(e) => onCheck(e.target.checked)}
                />{" "}
                Revisé esta evidencia
            </label>
        </article>
    );
}
export function ViviPmtWorkspace() {
    const { data } = usePlatform();
    const [config, setConfig] = useState<Config | null>(null),
        [estado, setEstado] = useState("PENDIENTE"),
        [q, setQ] = useState("");
    const [list, setList] = useState<{
            items: Caso[];
            hasMore: boolean;
            offset: number;
        } | null>(null),
        [detail, setDetail] = useState<Detail | null>(null);
    const [busy, setBusy] = useState(false),
        [error, setError] = useState(""),
        [message, setMessage] = useState(""),
        [uncertain, setUncertain] = useState(false);
    const [checked, setChecked] = useState<string[]>([]),
        [fundamento, setFundamento] = useState(""),
        [uso, setUso] = useState(""),
        [placa, setPlaca] = useState(""),
        [regla, setRegla] = useState("");
    const [clock, setClock] = useState(Date.now());
    const request = useRef<AbortController | null>(null);
    const active = detail?.caso;
    const mine =
        !!active?.mia &&
        !!active.RESERVADA_HASTA &&
        Date.parse(active.RESERVADA_HASTA) > clock;
    async function load(offset = 0, targetEstado = estado) {
        request.current?.abort();
        const controller = new AbortController();
        request.current = controller;
        setBusy(true);
        setError("");
        setList(null);
        try {
            if (q.trim() && q.trim().length < 3)
                throw Error(
                    "Escribe al menos tres caracteres del código o la placa completa.",
                );
            const cfg = await platformFetch<Config>("/vivi-pmt/bootstrap", {
                signal: controller.signal,
            });
            const result = await platformFetch<NonNullable<typeof list>>(
                "/vivi-pmt/casos?" +
                    new URLSearchParams({
                        estado: targetEstado,
                        q: q.trim(),
                        offset: String(offset),
                    }),
                { signal: controller.signal },
            );
            if (
                !result ||
                !Array.isArray(result.items) ||
                typeof result.hasMore !== "boolean" ||
                !Number.isSafeInteger(result.offset)
            )
                throw Error("La respuesta de la cola PMT no es válida.");
            if (!controller.signal.aborted) {
                setConfig(cfg);
                setList(result);
            }
        } catch (e) {
            if (!controller.signal.aborted) setError(errorText(e));
        } finally {
            if (!controller.signal.aborted) setBusy(false);
        }
    }
    useEffect(() => {
        void load();
        const timer = setInterval(() => setClock(Date.now()), 15000);
        return () => {
            request.current?.abort();
            clearInterval(timer);
        };
    }, []);
    async function open(id: string, preserve = false) {
        request.current?.abort();
        const controller = new AbortController();
        request.current = controller;
        setBusy(true);
        setError("");
        setMessage("");
        try {
            const next = await platformFetch<Detail>(`/vivi-pmt/casos/${id}`, {
                signal: controller.signal,
            });
            if (
                !next?.caso ||
                !Array.isArray(next.evidencias) ||
                !Array.isArray(next.reglas)
            )
                throw Error("La respuesta del expediente no es válida.");
            if (controller.signal.aborted) return;
            setDetail(next);
            setUncertain(false);
            setClock(Date.now());
            if (!preserve) {
                setChecked([]);
                setFundamento("");
                setUso(next.caso.USO_PLACA);
                setPlaca(next.caso.PLACA);
                setRegla(String(next.caso.REGLA));
            }
        } catch (e) {
            if (!controller.signal.aborted) setError(errorText(e));
        } finally {
            if (!controller.signal.aborted) setBusy(false);
        }
    }
    async function change(
        action: "reservar" | "liberar" | "decidir",
        decision?: "IMPONER" | "DESCARTAR",
    ) {
        if (!active || busy || !data) return;
        if (
            decision &&
            !window.confirm(
                decision === "IMPONER"
                    ? "¿Confirmas la infracción y la placa? Se emitirá una multa y entrará al proceso de notificación."
                    : "¿Confirmas descartar este reporte con el fundamento indicado?",
            )
        )
            return;
        setBusy(true);
        setError("");
        setMessage("");
        try {
            const payload: Record<string, unknown> = {
                version: active.VERSION,
            };
            if (decision)
                Object.assign(payload, {
                    decision,
                    fundamento,
                    evidenciasRevisadas: checked,
                    ...(config?.permiteCorrecciones
                        ? { usoPlaca: uso, placa, regla: Number(regla) }
                        : {}),
                });
            const row = await platformCommand<Caso>(
                `/vivi-pmt/casos/${active.ID}/${action}`,
                "POST",
                { version: 2, data: payload },
                !!data.actor.admin,
                decision === "IMPONER"
                    ? "Imponer multa del reporte Avísame"
                    : decision === "DESCARTAR"
                      ? "Descartar reporte Avísame"
                      : "Actualizar reserva de revisión",
            );
            setDetail((previous) =>
                previous ? { ...previous, caso: row } : null,
            );
            setUncertain(false);
            setClock(Date.now());
            setMessage(
                action === "reservar"
                    ? "Caso reservado por 15 minutos. Puedes renovar la reserva mientras revisas."
                    : action === "liberar"
                      ? "Reporte devuelto a la cola de pendientes."
                      : decision === "IMPONER"
                        ? "Multa emitida. La notificación incluirá las evidencias del reporte."
                        : "Reporte descartado y fundamentado.",
            );
        } catch (e) {
            setError(errorText(e));
            setUncertain(true);
        } finally {
            setBusy(false);
        }
    }
    const reviewed =
        !!detail?.evidencias.length &&
        detail.evidencias.every(
            (f) => checked.includes(f.ID) && f.ESTADO === "DISPONIBLE",
        );
    const canDecide =
        mine &&
        reviewed &&
        fundamento.trim().length >= 10 &&
        !busy &&
        !uncertain;
    return (
        <div className={styles.page}>
            <div className={styles.toolbar}>
                <div>
                    <h2>Bandeja de reportes</h2>
                    <p className={styles.muted}>
                        Revisa el lugar, la placa y las evidencias antes de
                        decidir si corresponde imponer una multa.
                    </p>
                </div>
                {active && (
                    <Button
                        variant="outlined"
                        state={busy ? "disabled" : "default"}
                        onClick={() => {
                            setDetail(null);
                            setMessage("");
                            setError("");
                            void load();
                        }}
                    >
                        Volver a reportes
                    </Button>
                )}
            </div>
            {error && (
                <div role="alert" className={styles.error}>
                    {error}
                    {uncertain && (
                        <p>
                            Consulta el estado del caso antes de repetir la
                            acción. Se conserva tu fundamento.
                        </p>
                    )}
                </div>
            )}
            {message && (
                <div role="status" className={styles.success}>
                    {message}
                </div>
            )}
            {!active ? (
                <section
                    className={styles.listPanel}
                    aria-label="Cola de reportes"
                >
                    <form
                        className={local.filters}
                        onSubmit={(e) => {
                            e.preventDefault();
                            void load();
                        }}
                    >
                        <label className={styles.field}>
                            Estado
                            <select
                                className={styles.control}
                                value={estado}
                                disabled={busy}
                                onChange={(e) => {
                                    setEstado(e.target.value);
                                    void load(0, e.target.value);
                                }}
                            >
                                {Object.entries(estados).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className={styles.field}>
                            Código del caso o placa
                            <input
                                className={styles.control}
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Primeros 3 caracteres, código completo o placa"
                                maxLength={40}
                            />
                        </label>
                        <Button
                            type="submit"
                            state={busy ? "disabled" : "default"}
                        >
                            Consultar reportes
                        </Button>
                    </form>
                    {busy && <p role="status">Consultando reportes…</p>}
                    {!config && error && (
                        <Button variant="outlined" onClick={() => void load()}>
                            Reintentar consulta
                        </Button>
                    )}
                    {list && (
                        <>
                            <div className={styles.tableRegion}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Placa</th>
                                            <th>Caso</th>
                                            <th>Hecho</th>
                                            <th>Recepción</th>
                                            <th>Revisión</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {list.items.map((row) => (
                                            <tr key={row.ID}>
                                                <td>
                                                    <strong>
                                                        {row.USO_PLACA} ·{" "}
                                                        {row.PLACA}
                                                    </strong>
                                                </td>
                                                <td className={local.code}>
                                                    {row.CODIGO_CASO}
                                                </td>
                                                <td>
                                                    {fecha(row.FECHA_HECHO)}
                                                </td>
                                                <td>
                                                    {fecha(row.REGISTRADA_EN)}
                                                </td>
                                                <td>
                                                    {row.mia
                                                        ? "Tu reserva"
                                                        : row.ESTADO ===
                                                            "EN_REVISION"
                                                          ? Number(row.VIGENTE)
                                                              ? "Reservado por otro agente"
                                                              : "Reserva vencida"
                                                          : estados[row.ESTADO]}
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="outlined"
                                                        state={
                                                            busy
                                                                ? "disabled"
                                                                : "default"
                                                        }
                                                        onClick={() =>
                                                            void open(row.ID)
                                                        }
                                                    >
                                                        Abrir reporte
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {!list.items.length && (
                                    <p>No hay reportes en este estado.</p>
                                )}
                            </div>
                            <div className={styles.actions}>
                                <Button
                                    variant="outlined"
                                    state={
                                        busy || list.offset === 0
                                            ? "disabled"
                                            : "default"
                                    }
                                    onClick={() =>
                                        void load(Math.max(0, list.offset - 30))
                                    }
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outlined"
                                    state={
                                        busy || !list.hasMore
                                            ? "disabled"
                                            : "default"
                                    }
                                    onClick={() => void load(list.offset + 30)}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </>
                    )}
                </section>
            ) : (
                <>
                    <section className={styles.listPanel}>
                        <div className={styles.toolbar}>
                            <div>
                                <h3>
                                    {active.USO_PLACA} · {active.PLACA}
                                </h3>
                                <span className={local.code}>
                                    {active.CODIGO_CASO}
                                </span>
                            </div>
                            <Button
                                variant="outlined"
                                state={busy ? "disabled" : "default"}
                                onClick={() => void open(active.ID, true)}
                            >
                                Consultar estado actual
                            </Button>
                        </div>
                        <dl className={local.facts}>
                            <div>
                                <dt>Fecha del hecho declarada</dt>
                                <dd>{fecha(active.FECHA_HECHO)}</dd>
                            </div>
                            <div>
                                <dt>Recibido</dt>
                                <dd>{fecha(active.REGISTRADA_EN)}</dd>
                            </div>
                            <div>
                                <dt>Falta reportada</dt>
                                <dd>
                                    {detail?.reglas.find(
                                        (r) =>
                                            Number(r.REGLA) ===
                                            Number(active.REGLA),
                                    )?.NOMBRE || active.REGLA}
                                </dd>
                            </div>
                            <div>
                                <dt>Lugar declarado</dt>
                                <dd>
                                    {active.REFERENCIA_LUGAR}
                                    <br />
                                    {active.LATITUD}, {active.LONGITUD} ·{" "}
                                    <a
                                        target="_blank"
                                        rel="noreferrer"
                                        href={`https://www.openstreetmap.org/?mlat=${active.LATITUD}&mlon=${active.LONGITUD}#map=18/${active.LATITUD}/${active.LONGITUD}`}
                                    >
                                        Abrir mapa
                                    </a>
                                </dd>
                            </div>
                        </dl>
                        {active.OBSERVACIONES && <p>{active.OBSERVACIONES}</p>}
                        <p className={styles.muted}>
                            La fecha y ubicación fueron indicadas por el
                            ciudadano. No provienen del GPS de las evidencias.
                        </p>
                        {["PENDIENTE", "EN_REVISION"].includes(active.ESTADO) &&
                            config?.acciones.revisar && (
                                <div className={styles.actions}>
                                    <Button
                                        state={
                                            busy ||
                                            (!mine &&
                                                Number(active.VIGENTE) === 1)
                                                ? "disabled"
                                                : "default"
                                        }
                                        onClick={() => void change("reservar")}
                                    >
                                        {mine
                                            ? "Renovar reserva"
                                            : "Tomar caso para revisión"}
                                    </Button>
                                    {mine && (
                                        <Button
                                            variant="outlined"
                                            state={
                                                busy ? "disabled" : "default"
                                            }
                                            onClick={() =>
                                                void change("liberar")
                                            }
                                        >
                                            Devolver a pendientes
                                        </Button>
                                    )}
                                    <span>
                                        {mine
                                            ? "Tu reserva vence: " +
                                              fecha(active.RESERVADA_HASTA)
                                            : "Toma el caso para registrar una decisión."}
                                    </span>
                                </div>
                            )}
                        {active.NUMERO_REMISION && (
                            <p>
                                <strong>
                                    Multa: {active.SERIE_REMISION} ·{" "}
                                    {active.NUMERO_REMISION}
                                </strong>{" "}
                                · {active.USO_PLACA_CONFIRMADO}{" "}
                                {active.PLACA_CONFIRMADA}
                            </p>
                        )}
                        {active.FUNDAMENTO && (
                            <p>
                                <strong>Fundamento registrado:</strong>{" "}
                                {active.FUNDAMENTO}
                            </p>
                        )}
                    </section>
                    <section className={styles.listPanel}>
                        <h3>Evidencias del reporte</h3>
                        <div className={local.evidences}>
                            {detail?.evidencias.map((file) => (
                                <Evidencia
                                    key={active.ID + "-" + file.ID}
                                    caso={active.ID}
                                    archivo={file}
                                    checked={checked.includes(file.ID)}
                                    onCheck={(yes) =>
                                        setChecked((prev) =>
                                            yes
                                                ? [
                                                      ...new Set([
                                                          ...prev,
                                                          file.ID,
                                                      ]),
                                                  ]
                                                : prev.filter(
                                                      (x) => x !== file.ID,
                                                  ),
                                        )
                                    }
                                />
                            ))}
                        </div>
                    </section>
                    {["PENDIENTE", "EN_REVISION"].includes(active.ESTADO) &&
                        config?.acciones.revisar && (
                            <section className={styles.listPanel}>
                                <h3>Decisión del agente</h3>
                                {config.permiteCorrecciones && (
                                    <>
                                        <p className={styles.muted}>
                                            Verifica los datos para la multa. Se
                                            conserva la placa y la falta
                                            originales del reporte.
                                        </p>
                                        <div className={local.decisionGrid}>
                                            <label className={styles.field}>
                                                Tipo de placa
                                                <input
                                                    className={styles.control}
                                                    value={uso}
                                                    maxLength={3}
                                                    disabled={!mine || busy}
                                                    onChange={(e) =>
                                                        setUso(
                                                            e.target.value.toUpperCase(),
                                                        )
                                                    }
                                                />
                                            </label>
                                            <label className={styles.field}>
                                                Placa verificada
                                                <input
                                                    className={styles.control}
                                                    value={placa}
                                                    maxLength={6}
                                                    disabled={!mine || busy}
                                                    onChange={(e) =>
                                                        setPlaca(
                                                            e.target.value.toUpperCase(),
                                                        )
                                                    }
                                                />
                                            </label>
                                            <label className={styles.field}>
                                                Infracción verificada
                                                <select
                                                    className={styles.control}
                                                    value={regla}
                                                    disabled={!mine || busy}
                                                    onChange={(e) =>
                                                        setRegla(e.target.value)
                                                    }
                                                >
                                                    {detail?.reglas.map((r) => (
                                                        <option
                                                            key={r.REGLA}
                                                            value={r.REGLA}
                                                        >
                                                            {r.NOMBRE}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>
                                    </>
                                )}
                                <label className={styles.field}>
                                    Fundamento de la decisión
                                    <textarea
                                        className={styles.control}
                                        rows={4}
                                        value={fundamento}
                                        disabled={!mine || busy}
                                        maxLength={2000}
                                        onChange={(e) =>
                                            setFundamento(e.target.value)
                                        }
                                        placeholder="Explica por qué corresponde imponer la multa o descartar el reporte."
                                    />
                                </label>
                                <p className={styles.muted}>
                                    Confirma cada evidencia y escribe al menos
                                    10 caracteres. La multa se notificará por el
                                    procedimiento de multas nuevas.
                                </p>
                                {!config.emisionConfigurada && (
                                    <p className={styles.error}>
                                        Falta configurar el emisor legal para
                                        imponer multas.
                                    </p>
                                )}
                                <div className={styles.actions}>
                                    <Button
                                        state={
                                            !canDecide ||
                                            !config.acciones.imponer ||
                                            !config.emisionConfigurada
                                                ? "disabled"
                                                : "default"
                                        }
                                        onClick={() =>
                                            void change("decidir", "IMPONER")
                                        }
                                    >
                                        Imponer multa
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        state={
                                            !canDecide ? "disabled" : "default"
                                        }
                                        onClick={() =>
                                            void change("decidir", "DESCARTAR")
                                        }
                                    >
                                        Descartar reporte
                                    </Button>
                                </div>
                            </section>
                        )}
                </>
            )}
        </div>
    );
}
