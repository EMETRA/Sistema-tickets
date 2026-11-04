"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { PlatformField } from "@/components/client/molecules/PlatformField/PlatformField";
import { TicketDetail } from "@/components/client/organisms/TicketDetail";
import { usePlatform } from "@/platform/context";
import { platformCommand, platformFetch } from "@/platform/client";
import type { PageResult } from "@/platform/types";
import { displayDate } from "@/components/client/organisms/ResourceWorkspace/RecordDetail";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
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
export function AssignmentsWorkspace() {
    const { data } = usePlatform(),
        [scope, setScope] = useState(
            data!.capabilities.assign
                ? "cola"
                : data!.capabilities.attend
                  ? "asignados"
                  : "creados",
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
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        platformFetch<PageResult<Ticket>>(
            "/tickets?scope=" +
                scope +
                "&estado=" +
                (scope === "cola" ? filter : "") +
                "&offset=" +
                offset,
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
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudo aplicar el cambio.",
            );
        } finally {
            setBusy(false);
        }
    }
    return (
        <section className={styles.page}>
            <div className={styles.toolbar}>
                <div>
                    <h2>Atención de tickets</h2>
                    <p className={styles.muted}>
                        Asignaciones, primera atención e historial de
                        seguimiento.
                    </p>
                </div>
                <Button
                    variant="outlined"
                    onClick={() => setRevision((n) => n + 1)}
                >
                    Actualizar
                </Button>
            </div>
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
                        aria-current={
                            scope === "asignados" ? "page" : undefined
                        }
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
            {scope === "cola" && (
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
                        <option value="sin-atencion">
                            Asignados sin primera atención
                        </option>
                        <option value="todos">Todos</option>
                    </select>
                </label>
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
                <section className={styles.card}>
                    <h3>Asignar {assigning.codigo}</h3>
                    <p>{assigning.titulo}</p>
                    <PlatformField
                        field={{
                            key: "usuarioId",
                            label: "Responsable",
                            lookupPath:
                                "/tickets/" + assigning.id + "/assignees",
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
                            state={
                                busy ? "loading" : user ? "default" : "disabled"
                            }
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
                                <tr key={row.id}>
                                    <td>
                                        <button
                                            className={styles.link}
                                            onClick={() => setDetail(row)}
                                        >
                                            {row.codigo || "#" + row.id} ·{" "}
                                            {row.titulo}
                                        </button>
                                        <p className={styles.muted}>
                                            {(
                                                {
                                                    1: "Sin asignar",
                                                    2: "Asignado",
                                                    3: "En atención",
                                                    4: "Cancelado",
                                                    5: "Resuelto",
                                                } as Record<number, string>
                                            )[row.estado] ||
                                                "Estado registrado"}
                                        </p>
                                    </td>
                                    <td>{row.creador}</td>
                                    <td>{row.asignado || "Sin asignar"}</td>
                                    <td>
                                        {row.alerta ? (
                                            <span className={styles.error}>
                                                Sin primera atención · Umbral{" "}
                                                {row.minutosAlerta} min
                                            </span>
                                        ) : row.atendidoEn ? (
                                            "Atendido: " +
                                            displayDate(row.atendidoEn)
                                        ) : row.asignadoEn ? (
                                            "Asignado: " +
                                            displayDate(row.asignadoEn)
                                        ) : row.asignado ? (
                                            "Asignación histórica sin fecha confirmada"
                                        ) : (
                                            "Pendiente de asignación"
                                        )}
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            {scope === "cola" &&
                                                ![4, 5].includes(
                                                    row.estado,
                                                ) && (
                                                    <button
                                                        className={styles.link}
                                                        onClick={() => {
                                                            setAssigning(row);
                                                            setUser(
                                                                row.asignadoId ||
                                                                    "",
                                                            );
                                                        }}
                                                    >
                                                        Asignar
                                                    </button>
                                                )}
                                            {row.asignadoId ===
                                                data!.actor.id &&
                                                row.estado === 2 && (
                                                    <button
                                                        className={styles.link}
                                                        disabled={busy}
                                                        onClick={() =>
                                                            void act(
                                                                row,
                                                                "start",
                                                            )
                                                        }
                                                    >
                                                        Iniciar atención
                                                    </button>
                                                )}
                                            {row.asignadoId ===
                                                data!.actor.id &&
                                                row.estado === 3 && (
                                                    <button
                                                        className={styles.link}
                                                        disabled={busy}
                                                        onClick={() =>
                                                            void act(
                                                                row,
                                                                "resolve",
                                                            )
                                                        }
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
                        <p className={styles.card}>
                            No hay tickets en esta bandeja.
                        </p>
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
                        state={
                            offset + 50 < result.total ? "default" : "disabled"
                        }
                        onClick={() => setOffset(offset + 50)}
                    >
                        Siguiente
                    </Button>
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
