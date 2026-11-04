"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { MetricCard } from "@/components/client/molecules/MetricCard";
import { TicketDetail } from "@/components/client/organisms/TicketDetail";
import { usePlatform } from "@/platform/context";
import { useAppsCatalogContext } from "@/context/AppsCatalogContext";
import { platformSections } from "@/platform/navigation";
import { platformFetch } from "@/platform/client";
import type { PageResult, PlatformRecord } from "@/platform/types";
import { displayDate } from "@/components/client/organisms/ResourceWorkspace/RecordDetail";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
type Summary = {
    tickets: {
        total: number;
        resueltos: number;
        enTrabajo: number;
        asignados: number;
    };
    registros: {
        id: string;
        operacion: string;
        recurso: string;
        fecha: string;
        cantidad: number;
    }[];
};
type Ticket = {
    id: number;
    codigo: string;
    titulo: string;
    estado: number;
    alerta: string | null;
};
export function HomeWorkspace() {
    const { data } = usePlatform(),
        { catalog } = useAppsCatalogContext(),
        [summary, setSummary] = useState<Summary | null>(null),
        [tickets, setTickets] = useState<PageResult<Ticket> | null>(null),
        [activities, setActivities] = useState<PlatformRecord[]>([]),
        [error, setError] = useState(""),
        [revision, setRevision] = useState(0),
        [ticketId, setTicket] = useState<number | null>(null);
    const head = data!.memberships.find((m) => m.funcion === "JEFATURA"),
        team = data!.capabilities.teamMetrics
            ? data!.actor.admin
                ? data!.defaultTicketTeamId
                : head?.equipoId
            : undefined,
        scope = data!.capabilities.assign
            ? "cola"
            : data!.capabilities.attend
              ? "asignados"
              : head
                ? "equipo"
                : "creados";
    useEffect(() => {
        const c = new AbortController(),
            from = new Date(),
            to = new Date(Date.now() + 7 * 86400000);
        Promise.all([
            platformFetch<Summary>(
                "/metrics" + (team ? "?equipoId=" + team : ""),
                { signal: c.signal },
            ),
            platformFetch<PageResult<Ticket>>(
                "/tickets?scope=" +
                    scope +
                    (scope === "equipo" ? "&equipoId=" + head?.equipoId : "") +
                    "&limit=5",
                { signal: c.signal },
            ),
            platformFetch<PageResult<PlatformRecord>>(
                "/records/actividades?limit=5&desde=" +
                    encodeURIComponent(from.toISOString()) +
                    "&hasta=" +
                    encodeURIComponent(to.toISOString()),
                { signal: c.signal },
            ),
        ])
            .then(([s, t, a]) => {
                setSummary(s);
                setTickets(t);
                setActivities(a.items);
                setError("");
            })
            .catch((e) => {
                if (!c.signal.aborted) setError(e.message);
            });
        return () => c.abort();
    }, [team, scope, head?.equipoId, revision]);
    const modeLabels: Record<string, string> = {
        ADMINISTRADOR: "Administración de Informática",
        ASIGNACION: "Asignación de tickets",
        JEFATURA: "Jefatura de unidad",
        TECNICO: "Atención técnica",
        DESARROLLADOR: "Desarrollo de sistemas",
        DEVOPS: "Operación de infraestructura",
        USUARIO: "Mi espacio de trabajo",
    };
    const priorities = data!.actor.admin
        ? ["asignacion", "accesos", "infraestructura", "auditoria"]
        : data!.actor.mode === "ASIGNACION"
          ? ["asignacion", "calendario", "metricas", "solicitudes"]
          : data!.actor.mode === "JEFATURA"
            ? ["solicitudes", "metricas", "calendario", "asignacion"]
            : data!.actor.mode === "TECNICO"
              ? ["asignacion", "inventario", "red", "calendario"]
              : ["DESARROLLADOR", "DEVOPS"].includes(data!.actor.mode)
                ? ["sistemas", "infraestructura", "asignacion", "metricas"]
                : ["asignacion", "calendario", "metricas", "busqueda"];
    const links = platformSections(data!)
        .filter((s) => priorities.includes(s.id))
        .sort((a, b) => priorities.indexOf(a.id) - priorities.indexOf(b.id));
    return (
        <section className={`${styles.page} ${styles.homePage}`}>
            <div className={styles.toolbar}>
                <div>
                    <p className={styles.muted}>
                        {modeLabels[data!.actor.mode] ||
                            "Mi espacio de trabajo"}
                    </p>
                    <h1>Hola, {data!.actor.nombre.split(" ")[0]}</h1>
                    <p className={styles.muted}>
                        {team
                            ? "Indicadores de " +
                              (data!.teams.find((t) => t.id === team)?.nombre ||
                                  "tu equipo autorizado")
                            : "Tus indicadores personales"}{" "}
                        · Tickets creados en los últimos 30 días y su estado
                        actual.
                    </p>
                </div>
                <div className={styles.actions}>
                    <Button
                        variant="outlined"
                        onClick={() => setRevision((n) => n + 1)}
                    >
                        Actualizar
                    </Button>
                    <Link className={styles.link} href="/tickets-creation">
                        Crear ticket
                    </Link>
                </div>
            </div>
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                </p>
            )}
            {summary ? (
                <div className={styles.metrics}>
                    <MetricCard
                        label="Tickets del periodo"
                        value={summary.tickets.total}
                    />
                    <MetricCard
                        label="En atención"
                        value={summary.tickets.enTrabajo}
                    />
                    <MetricCard
                        label="Asignados"
                        value={summary.tickets.asignados}
                    />
                    <MetricCard
                        label="Resueltos"
                        value={summary.tickets.resueltos}
                    />
                </div>
            ) : (
                !error && <p role="status">Consultando indicadores…</p>
            )}
            <div className={styles.grid}>
                {links.map((s) => (
                    <Link
                        className={styles.card}
                        key={s.id}
                        href={"/espacio/" + s.id}
                    >
                        <h3>{s.label}</h3>
                        <span className={styles.muted}>
                            Abrir mi espacio autorizado →
                        </span>
                    </Link>
                ))}
            </div>
            <div className={styles.split}>
                <section className={styles.card}>
                    <div className={styles.toolbar}>
                        <h2>
                            {scope === "cola"
                                ? "Bandeja de Informática"
                                : scope === "asignados"
                                  ? "Tickets asignados a mí"
                                  : scope === "equipo"
                                    ? "Tickets de mi equipo"
                                    : "Mis solicitudes"}
                        </h2>
                        <Link
                            className={styles.link}
                            href="/espacio/asignacion"
                        >
                            Abrir bandeja
                        </Link>
                    </div>
                    <ul className={styles.timeline}>
                        {tickets?.items.map((t) => (
                            <li key={t.id}>
                                <button
                                    className={styles.link}
                                    onClick={() => setTicket(t.id)}
                                >
                                    {t.codigo || "#" + t.id} · {t.titulo}
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
                                    )[t.estado] || "Estado registrado"}
                                </p>
                                {t.alerta && (
                                    <p className={styles.error}>
                                        Asignado sin primera atención: superó el
                                        umbral del equipo.
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                    {tickets && !tickets.items.length && (
                        <p className={styles.muted}>
                            No hay tickets en esta bandeja.
                        </p>
                    )}
                    {tickets && (
                        <p className={styles.muted}>
                            {tickets.total} tickets en tu alcance. Se muestran
                            hasta cinco.
                        </p>
                    )}
                </section>
                <aside className={styles.card}>
                    <h2>Próximas actividades</h2>
                    <p className={styles.muted}>
                        Esta semana · Hora de Guatemala
                    </p>
                    <ul className={styles.timeline}>
                        {activities.map((a) => (
                            <li key={a.id}>
                                <Link
                                    className={styles.link}
                                    href={
                                        "/espacio/registro/actividades/" + a.id
                                    }
                                >
                                    {a.nombre}
                                </Link>
                                <p className={styles.muted}>
                                    {displayDate(a.datos.inicio)} ·{" "}
                                    {a.visibilidad === "EMPRESA"
                                        ? "General de la empresa"
                                        : a.visibilidad === "PRIVADA"
                                          ? "Privada"
                                          : "De equipo"}
                                </p>
                            </li>
                        ))}
                    </ul>
                    {summary && !activities.length && (
                        <p className={styles.muted}>
                            No hay actividades visibles programadas para estos
                            días.
                        </p>
                    )}
                    <Link className={styles.link} href="/espacio/calendario">
                        Abrir calendario
                    </Link>
                </aside>
            </div>
            <div className={styles.grid}>
                <section className={styles.card}>
                    <h2>Acciones recientes en aplicaciones</h2>
                    <ul className={styles.timeline}>
                        {summary?.registros.slice(0, 8).map((a) => (
                            <li key={a.id}>
                                <strong>
                                    {a.operacion.replaceAll("_", " ")}
                                </strong>
                                <p>
                                    {a.recurso} · {a.cantidad}
                                </p>
                                <p className={styles.muted}>
                                    {displayDate(a.fecha)}
                                </p>
                            </li>
                        ))}
                    </ul>
                    {summary && !summary.registros.length && (
                        <p className={styles.muted}>
                            Aún no hay operaciones confirmadas por tus
                            aplicaciones. Aquí aparecerán cuando sus servicios
                            registren los eventos.
                        </p>
                    )}
                    <Link className={styles.link} href="/espacio/metricas">
                        Consultar registros e indicadores
                    </Link>
                </section>
                <section className={styles.card}>
                    <h2>Aplicaciones autorizadas</h2>
                    <ul className={styles.timeline}>
                        {catalog &&
                            Object.values(catalog).map((app) => (
                                <li key={app.meta.id}>
                                    <Link
                                        className={styles.link}
                                        href={"/home/" + app.meta.id}
                                    >
                                        {app.meta.title}
                                    </Link>
                                </li>
                            ))}
                    </ul>
                    {catalog && !Object.keys(catalog).length && (
                        <p className={styles.muted}>
                            Tu perfil aún no tiene módulos de aplicaciones
                            asignados.
                        </p>
                    )}
                </section>
            </div>
            <TicketDetail
                isOpen={ticketId !== null}
                ticketId={String(ticketId || "")}
                onClose={() => setTicket(null)}
                onTicketUpdated={() => setRevision((n) => n + 1)}
            />
        </section>
    );
}
