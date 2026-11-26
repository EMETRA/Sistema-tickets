"use client";
import { statusTone } from "@/helpers/statusTone";
import { useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { PlatformField } from "@/components/client/molecules/PlatformField/PlatformField";
import { TicketDetail } from "@/components/client/organisms/TicketDetail";
import { usePlatform } from "@/platform/context";
import { platformCommand, platformFetch } from "@/platform/client";
import type { PageResult } from "@/platform/types";
import { displayDate } from "@/components/client/organisms/ResourceWorkspace/RecordDetail";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import queue from "./QueueSummary.module.scss";
type Ticket = {
    id: number;
    codigo: string;
    titulo: string;
    estado: number;
    creador: string;
    asignado: string | null;
    asignadoId: number | null;
    equipoId: string;
    version: number;
    alerta: string | null;
    asignadoEn: string | null;
    atendidoEn: string | null;
    minutosAlerta: number;
    fechaAsignacionConocida: boolean;
};
const STATE_LABEL: Record<number, string> = {
    1: "Sin asignar",
    2: "Asignado",
    3: "En atención",
    4: "Cancelado",
    5: "Resuelto",
};

export function AssignmentsWorkspace() {
    const { data } = usePlatform(),
        [scope, setScope] = useState(
            data!.capabilities.assign ? "cola" : data!.capabilities.attend ? "asignados" : "creados",
        ),
        [filter, setFilter] = useState("sin-asignar"),
        [result, setResult] = useState<PageResult<Ticket>>({
            items: [],
            total: 0,
            offset: 0,
            limit: 50,
        }),
        [offset, setOffset] = useState(0),
        [error, setError] = useState(""),
        [loading, setLoading] = useState(false),
        [revision, setRevision] = useState(0),
        [assigning, setAssigning] = useState<Ticket | null>(null),
        [user, setUser] = useState<unknown>(""),
        [busy, setBusy] = useState(false),
        [detail, setDetail] = useState<Ticket | null>(null),
        [message, setMessage] = useState("");
    const [counts, setCounts] = useState<{
        sinAsignar?: number;
        sinPrimeraAtencion?: number;
        enTrabajo?: number;
        resueltos?: number;
    } | null>(null);
    // Propuesta: los indicadores de la cola funcionan como filtros.
    useEffect(() => {
        if (!data!.capabilities.assign) return;
        const controller = new AbortController();
        const opts = { signal: controller.signal };
        // Los contadores de la cola usan la misma fuente que la bandeja, así siempre cuadran.
        const total = (estado: string) =>
            platformFetch<PageResult<Ticket>>(`/tickets?scope=cola&estado=${estado}&limit=1`, opts).then(
                (r) => r.total,
            );
        Promise.all([
            total("sin-asignar"),
            total("sin-atencion"),
            platformFetch<{ tickets: { enTrabajo?: number; resueltos?: number } }>(
                "/metrics?inicio=true",
                opts,
            ),
        ])
            .then(([sinAsignar, sinPrimeraAtencion, m]) => {
                if (!controller.signal.aborted)
                    setCounts({
                        sinAsignar,
                        sinPrimeraAtencion,
                        enTrabajo: m.tickets.enTrabajo,
                        resueltos: m.tickets.resueltos,
                    });
            })
            .catch(() => undefined);
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [revision]);
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        platformFetch<PageResult<Ticket>>(
            "/tickets?scope=" + scope + "&estado=" + (scope === "cola" ? filter : "") + "&offset=" + offset,
            { signal: controller.signal },
        )
            .then(setResult)
            .catch((e) => {
                if (!controller.signal.aborted) setError(e.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [scope, filter, offset, revision]);
    async function act(row: Ticket, action: string) {
        setBusy(true);
        setError("");
        try {
            await platformCommand(
                "/tickets/" + row.id + "/" + action,
                "POST",
                {
                    version: row.version,
                    ...(action === "assign" ? { usuarioId: user } : {}),
                },
                data!.actor.admin,
                action === "assign"
                    ? "Asignar " + row.codigo
                    : action === "start"
                      ? "Iniciar atención de " + row.codigo
                      : "Resolver " + row.codigo,
            );
            setAssigning(null);
            setRevision((n) => n + 1);
            setMessage("El cambio del ticket quedó registrado.");
        } catch (e) {
            setError(e instanceof Error ? e.message : "No se pudo aplicar el cambio.");
        } finally {
            setBusy(false);
        }
    }
    return (
        <section className={styles.page}>
            <div className={styles.toolbar}>
                <p className={styles.muted}>{""}</p>
                <Button variant="outlined" onClick={() => setRevision((n) => n + 1)}>
                    Actualizar
                </Button>
            </div>
            {data!.capabilities.assign && (
                <div className={queue.strip} role="group" aria-label="Indicadores de la cola">
                    {[
                        {
                            id: "sin-asignar",
                            label: "Sin asignar",
                            value: counts?.sinAsignar,
                            tone: "neutral",
                            hint: "Esperan responsable",
                        },
                        {
                            id: "sin-atencion",
                            label: "Sin primera atención",
                            value: counts?.sinPrimeraAtencion,
                            tone: (counts?.sinPrimeraAtencion || 0) > 0 ? "danger" : "neutral",
                            hint: "Superaron el umbral del equipo",
                        },
                        {
                            id: "todos",
                            label: "Todos los activos",
                            value: undefined,
                            tone: "info",
                            hint: "Toda la bandeja",
                        },
                    ].map((tile) => (
                        <button
                            key={tile.id}
                            type="button"
                            className={queue.tile}
                            data-tone={tile.tone}
                            aria-pressed={scope === "cola" && filter === tile.id}
                            onClick={() => {
                                setScope("cola");
                                setFilter(tile.id);
                                setOffset(0);
                            }}
                        >
                            <span className={queue.label}>{tile.label}</span>
                            <strong>{tile.value ?? (tile.id === "todos" ? "→" : "—")}</strong>
                            <small>{tile.hint}</small>
                        </button>
                    ))}
                    <div className={queue.tile} data-tone="success" aria-label="Resueltos en 30 días">
                        <span className={queue.label}>Resueltos · 30 días</span>
                        <strong>{counts?.resueltos ?? "—"}</strong>
                        <small>{counts?.enTrabajo ?? 0} en atención ahora</small>
                    </div>
                </div>
            )}
            <div className={styles.listPanel}>
                <nav className={styles.tabs} aria-label="Bandejas de tickets">
                    {data!.capabilities.assign && (
                        <button
                            aria-current={scope === "cola" ? "page" : undefined}
                            onClick={() => {
                                setScope("cola");
                                setOffset(0);
                            }}
                        >
                            Bandeja de asignación
                        </button>
                    )}
                    {data!.capabilities.attend && (
                        <button
                            aria-current={scope === "asignados" ? "page" : undefined}
                            onClick={() => {
                                setScope("asignados");
                                setOffset(0);
                            }}
                        >
                            Mis asignados
                        </button>
                    )}
                    <button
                        aria-current={scope === "creados" ? "page" : undefined}
                        onClick={() => {
                            setScope("creados");
                            setOffset(0);
                        }}
                    >
                        Mis solicitudes
                    </button>
                </nav>
                {false && (
                    <div className={styles.toolbar}>
                        <label className={styles.field}>
                            Mostrar
                            <select
                                className={styles.control}
                                value={filter}
                                onChange={(e) => {
                                    setFilter(e.target.value);
                                    setOffset(0);
                                }}
                            >
                                <option value="sin-asignar">Sin asignar</option>
                                <option value="sin-atencion">Asignados sin primera atención</option>
                                <option value="todos">Todos</option>
                            </select>
                        </label>
                    </div>
                )}
                {message && (
                    <p role="status" className={styles.success}>
                        {message}
                    </p>
                )}
                {error && (
                    <p role="alert" className={styles.error}>
                        {error}
                    </p>
                )}
                {assigning && (
                    <section className={styles.card + " " + styles.focusCard}>
                        <h3>Asignar {assigning.codigo}</h3>
                        <p className={styles.muted}>{assigning.titulo}</p>
                        <PlatformField
                            field={{
                                key: "usuarioId",
                                label: "Responsable",
                                lookupPath: "/tickets/" + assigning.id + "/assignees",
                                type: "user",
                                required: true,
                            }}
                            value={user}
                            onChange={setUser}
                            disabled={busy}
                        />
                        <div className={styles.actions}>
                            <Button
                                variant="outlined"
                                onClick={() => setAssigning(null)}
                                state={busy ? "disabled" : "default"}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={() => void act(assigning, "assign")}
                                state={busy ? "loading" : user ? "default" : "disabled"}
                            >
                                Asignar ticket
                            </Button>
                        </div>
                    </section>
                )}
                {loading ? (
                    <p role="status" className={styles.muted}>
                        Consultando la bandeja…
                    </p>
                ) : (
                    <div className={styles.tableRegion}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Ticket</th>
                                    <th>Solicitante</th>
                                    <th>Responsable</th>
                                    <th>Seguimiento</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.items.map((row) => (
                                    <tr key={row.id} className={row.alerta ? styles.rowAlert : undefined}>
                                        <td>
                                            <button className={styles.link} onClick={() => setDetail(row)}>
                                                {row.codigo || "#" + row.id} · {row.titulo}
                                            </button>
                                            <div>
                                                <span
                                                    className={styles.chip}
                                                    data-tone={statusTone(STATE_LABEL[row.estado])}
                                                >
                                                    {STATE_LABEL[row.estado] || "Estado registrado"}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{row.creador}</td>
                                        <td>{row.asignado || "Sin asignar"}</td>
                                        <td>
                                            {row.alerta ? (
                                                <span className={styles.flag}>
                                                    Sin primera atención · Umbral {row.minutosAlerta} min
                                                </span>
                                            ) : row.atendidoEn ? (
                                                "Atendido: " + displayDate(row.atendidoEn)
                                            ) : row.asignadoEn ? (
                                                "Asignado: " + displayDate(row.asignadoEn)
                                            ) : row.asignado ? (
                                                "Asignación histórica sin fecha confirmada"
                                            ) : (
                                                "Pendiente de asignación"
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                {scope === "cola" && ![4, 5].includes(row.estado) && (
                                                    <button
                                                        className={styles.link}
                                                        onClick={() => {
                                                            setAssigning(row);
                                                            setUser(row.asignadoId || "");
                                                        }}
                                                    >
                                                        Asignar
                                                    </button>
                                                )}
                                                {row.asignadoId === data!.actor.id && row.estado === 2 && (
                                                    <button
                                                        className={styles.link}
                                                        disabled={busy}
                                                        onClick={() => void act(row, "start")}
                                                    >
                                                        Iniciar atención
                                                    </button>
                                                )}
                                                {row.asignadoId === data!.actor.id && row.estado === 3 && (
                                                    <button
                                                        className={styles.link}
                                                        disabled={busy}
                                                        onClick={() => void act(row, "resolve")}
                                                    >
                                                        Resolver
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!result.items.length && (
                            <p className={styles.card}>No hay tickets en esta bandeja.</p>
                        )}
                    </div>
                )}
                <div className={styles.toolbar}>
                    <p className={styles.muted}>{result.total} tickets</p>
                    <div className={styles.actions}>
                        <Button
                            variant="outlined"
                            state={offset ? "default" : "disabled"}
                            onClick={() => setOffset(Math.max(0, offset - 50))}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outlined"
                            state={offset + 50 < result.total ? "default" : "disabled"}
                            onClick={() => setOffset(offset + 50)}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            </div>
            <TicketDetail
                isOpen={!!detail}
                ticketId={String(detail?.id || "")}
                onClose={() => setDetail(null)}
                onTicketUpdated={() => setRevision((n) => n + 1)}
            />
        </section>
    );
}
