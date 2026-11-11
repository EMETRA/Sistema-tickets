"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    HomeOverview,
    type HomeMetric,
    type HomeShortcut,
} from "@/components/client/templates/HomeOverview/HomeOverview";
import {
    RecentActions,
    type RecentAction,
} from "@/components/client/organisms/RecentActions/RecentActions";
import { AgendaPreview } from "@/components/client/organisms/AgendaPreview/AgendaPreview";
import { TicketDetail } from "@/components/client/organisms/TicketDetail";
import { useWorkspaceView } from "@/platform/presentation-context";
import { platformSections } from "@/platform/navigation";
import { platformFetch } from "@/platform/client";
import type { PageResult, PlatformRecord } from "@/platform/types";
import { guatemalaDay } from "@/platform/dates";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import homeStyles from "./HomeWorkspace.module.scss";
type Summary = {
    tickets: {
        total: number;
        resueltos: number;
        enTrabajo: number;
        asignados: number;
        pendientesRespuesta?: number;
        sinAsignar?: number;
        sinPrimeraAtencion?: number;
    };
    registros: {
        id: string;
        operacion: string;
        recurso: string;
        fecha: string;
        cantidad: number;
        aplicacionNombre?: string;
    }[];
    actividadTickets?: { id: string; codigo: string; fecha: string }[];
};
type Ticket = {
    id: number;
    codigo: string;
    titulo: string;
    estado: number;
    alerta: string | null;
};
const views: Record<string, [string, string, string]> = {
    USUARIO: [
        "Usuario",
        "Tus solicitudes y aplicaciones",
        "Accesos y trabajo según tu perfil y permisos.",
    ],
    ADMINISTRADOR: [
        "Admin · Informática",
        "Control de Informática",
        "Tickets de la Dirección de Informática y accesos según tu alcance.",
    ],
    ASIGNACION: [
        "Asignación · Informática",
        "Primero, los tickets por asignar",
        "Asigna las solicitudes y da seguimiento a los tickets sin primera atención.",
    ],
    JEFATURA: [
        "Jefatura de unidad",
        "Tu unidad, en un solo lugar",
        "Consulta las solicitudes y métricas de los equipos que tienes autorizados.",
    ],
    TECNICO: [
        "Técnico · Informática",
        "Tu atención y tus instalaciones",
        "Accesos y trabajo según tu perfil y permisos.",
    ],
    DESARROLLADOR: [
        "Desarrollador",
        "Tus sistemas y tus pendientes",
        "Accesos y trabajo según tu perfil y permisos.",
    ],
    DEVOPS: [
        "Operación de infraestructura",
        "Tus servicios y tus pendientes",
        "Supervisa los servicios y registros que tienes autorizados.",
    ],
};
export function HomeWorkspace() {
    const { data, active: presentationActive } = useWorkspaceView();
    const [summary, setSummary] = useState<Summary | null>(null),
        [tickets, setTickets] = useState<PageResult<Ticket> | null>(null);
    const [activities, setActivities] = useState<PlatformRecord[]>([]),
        [errors, setErrors] = useState<Record<string, string>>({});
    const [pending, setPending] = useState({
        metrics: true,
        tickets: true,
        calendar: true,
    });
    const [revision, setRevision] = useState(0),
        [ticketId, setTicket] = useState<number | null>(null);
    const mode = data!.actor.mode,
        personal = mode === "USUARIO";
    const head = data!.memberships.find((m) => m.funcion === "JEFATURA");
    const headTeam = head?.equipoId || (presentationActive && mode === "JEFATURA"
        ? data!.defaultTicketTeamId || data!.teams[0]?.id : undefined);
    const team = data!.capabilities.teamMetrics
        ? data!.actor.admin
            ? data!.defaultTicketTeamId
            : headTeam
        : undefined;
    const scope = data!.capabilities.assign
        ? "cola"
        : data!.capabilities.attend
          ? "asignados"
          : headTeam
            ? "equipo"
            : "creados";
    useEffect(() => {
        const c = new AbortController();
        const fail = (key: string) => {
            if (!c.signal.aborted)
                setErrors((e) => ({
                    ...e,
                    [key]: "No fue posible cargar esta información.",
                }));
        };
        const finish = (key: string) => {
            if (!c.signal.aborted) setPending((p) => ({ ...p, [key]: false }));
        };
        platformFetch<Summary>(
            "/metrics?inicio=true" +
                (team ? "&equipoId=" + team : "") +
                (personal ? "&scope=creados" : ""),
            { signal: c.signal },
        )
            .then((s) => {
                if (!c.signal.aborted) setSummary(s);
            })
            .catch(() => fail("metrics"))
            .finally(() => finish("metrics"));
        if (!personal)
            platformFetch<PageResult<Ticket>>(
                "/tickets?scope=" +
                    scope +
                    (scope === "equipo" ? "&equipoId=" + headTeam : "") +
                    "&limit=3",
                { signal: c.signal },
            )
                .then((t) => {
                    if (!c.signal.aborted) setTickets(t);
                })
                .catch(() => fail("tickets"))
                .finally(() => finish("tickets"));
        const start = new Date(guatemalaDay() + "T00:00:00-06:00"),
            end = new Date(+start + 7 * 86400000);
        platformFetch<PageResult<PlatformRecord>>(
            "/records/actividades?limit=2&desde=" +
                encodeURIComponent(start.toISOString()) +
                "&hasta=" +
                encodeURIComponent(end.toISOString()),
            { signal: c.signal },
        )
            .then((a) => {
                if (!c.signal.aborted) setActivities(a.items);
            })
            .catch(() => fail("calendar"))
            .finally(() => finish("calendar"));
        return () => c.abort();
    }, [team, scope, headTeam, revision, personal]);
    const retry = () => {
        setPending({ metrics: true, tickets: !personal, calendar: true });
        setErrors({});
        setRevision((n) => n + 1);
    };
    const metrics: HomeMetric[] = personal
        ? [
              { label: "Mis solicitudes", value: summary?.tickets.total },
              { label: "En atención", value: summary?.tickets.enTrabajo },
              { label: "Resueltas", value: summary?.tickets.resueltos },
              {
                  label: "Pendientes de respuesta",
                  value: summary?.tickets.pendientesRespuesta,
              },
          ]
        : data!.capabilities.assign
          ? [
                { label: "Sin asignar", value: summary?.tickets.sinAsignar },
                {
                    label: "Sin primera atención",
                    value: summary?.tickets.sinPrimeraAtencion,
                },
                { label: "En atención", value: summary?.tickets.enTrabajo },
                { label: "Resueltos", value: summary?.tickets.resueltos },
            ]
          : [
                {
                    label:
                        scope === "equipo"
                            ? "De mi equipo"
                            : "Mis tickets del periodo",
                    value: summary?.tickets.total,
                },
                { label: "En atención", value: summary?.tickets.enTrabajo },
                { label: "Asignados", value: summary?.tickets.asignados },
                { label: "Resueltos", value: summary?.tickets.resueltos },
            ];
    metrics.forEach((m) => {
        m.caption = pending.metrics
            ? "Consultando…"
            : m.value === undefined
              ? "Sin dato disponible"
              : "Últimos 30 días";
    });
    const quick: HomeShortcut[] = [
        {
            label: "Aplicaciones autorizadas",
            href: "/aplicaciones",
            icon: "table-cells-large-solid",
        },
        {
            label: "Crear ticket",
            href: "/tickets-creation",
            icon: "ticket-solid",
        },
        {
            label: "Mis métricas",
            href: "/espacio/metricas",
            icon: "chart-pie-solid",
        },
    ];
    const priorities: Record<string, string[]> = {
        ADMINISTRADOR: ["accesos", "auditoria"],
        JEFATURA: ["solicitudes", "organizacion"],
        TECNICO: ["inventario", "red"],
        DESARROLLADOR: ["sistemas", "infraestructura"],
        DEVOPS: ["infraestructura", "sistemas"],
    };
    const labels: Record<string, string> = {
        accesos: "Personas y accesos",
        inventario: "Equipos y mantenimiento",
        red: "Sedes y cableado",
        solicitudes: "Solicitar acceso",
        organizacion: "Mi equipo",
        sistemas: "Sistemas a cargo",
    };
    const sections = platformSections(data!);
    const extra = (priorities[mode] || []).flatMap((id) => {
        const s = sections.find((s) => s.id === id);
        return s
            ? [
                  {
                      label: labels[id] || s.label,
                      href: "/espacio/" + id,
                      icon: s.iconName,
                  },
              ]
            : [];
    });
    const shortcuts = [...extra, ...quick]
        .filter((s, i, all) => all.findIndex((x) => x.href === s.href) === i)
        .slice(0, 3);
    const recent: RecentAction[] = (summary?.registros || []).map((a) => {
        const verbs: Record<string, string> = {
            RECIBO_GRABADO: "Grabaste el recibo",
            RECIBO_REVISADO: "Revisaste el recibo",
            RECIBO_ANULADO: "Anulaste el recibo",
        };
        const action =
            verbs[a.operacion] ||
            a.operacion.toLowerCase().replaceAll("_", " ");
        return {
            id: "app-" + a.id,
            title:
                action.charAt(0).toUpperCase() +
                action.slice(1) +
                " " +
                a.recurso,
            detail:
                (a.aplicacionNombre || "Aplicación autorizada") +
                " · Operación confirmada" +
                (a.cantidad > 1 ? " · Cantidad: " + a.cantidad : ""),
            date: a.fecha,
            icon: a.operacion.includes("REVIS") ? "check-solid" : "file",
        };
    });
    for (const t of summary?.actividadTickets || [])
        recent.push({
            id: "ticket-" + t.id,
            title: "Registraste el ticket " + (t.codigo || "#" + t.id),
            detail: "Informática · Solicitud recibida",
            date: t.fecha,
            icon: "ticket-solid",
            ticketId: Number(t.id),
        });
    recent.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    const primary = personal ? (
        <RecentActions
            items={recent}
            loading={pending.metrics}
            error={errors.metrics}
            onRetry={retry}
            onOpenTicket={setTicket}
        />
    ) : (
        <section
            className={homeStyles.tickets}
            aria-labelledby="inicio-tickets"
        >
            <header>
                <h2 id="inicio-tickets">
                    {scope === "cola"
                        ? "Tickets recientes"
                        : scope === "equipo"
                          ? "Tickets de mi equipo"
                          : "Mis tickets asignados"}
                </h2>
                <p>
                    {scope === "cola"
                        ? "Bandeja de Informática"
                        : "Solicitudes dentro de tu alcance"}
                </p>
            </header>
            {pending.tickets && <p role="status">Consultando tickets…</p>}
            {errors.tickets && (
                <p role="alert">
                    {errors.tickets}{" "}
                    <button onClick={retry}>Reintentar bandeja</button>
                </p>
            )}
            <div className={homeStyles.tableRegion}>
                <table>
                    <thead>
                        <tr>
                            <th>Ticket</th>
                            <th>Solicitud</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets?.items.map((t) => (
                            <tr key={t.id}>
                                <td>
                                    <button
                                        className={homeStyles.recordLink}
                                        onClick={() => setTicket(t.id)}
                                    >
                                        {t.codigo || "#" + t.id}
                                    </button>
                                </td>
                                <td>
                                    {t.titulo}
                                    {t.alerta && (
                                        <p className={styles.error}>
                                            Sin primera atención: superó el
                                            umbral del equipo.
                                        </p>
                                    )}
                                </td>
                                <td>
                                    <span
                                        className={homeStyles.state}
                                        data-state={t.estado}
                                    >
                                        {(
                                            {
                                                1: "Sin asignar",
                                                2: "Asignado",
                                                3: "En atención",
                                                4: "Cancelado",
                                                5: "Resuelto",
                                            } as Record<number, string>
                                        )[t.estado] || "Registrado"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {tickets && !tickets.items.length && (
                <p className={homeStyles.empty}>
                    No hay tickets en esta bandeja.
                </p>
            )}
            <footer>
                <span>
                    {tickets ? tickets.total + " tickets en tu alcance" : ""}
                </span>
                <Link href="/espacio/asignacion">
                    Abrir bandeja <span aria-hidden="true">→</span>
                </Link>
            </footer>
        </section>
    );
    const [eyebrow, title, description] = views[mode] || views.USUARIO;
    return (
        <>
            <HomeOverview
                eyebrow={eyebrow}
                title={title}
                description={description}
                metrics={metrics}
                primary={primary}
                notice={
                    !personal && errors.metrics ? (
                        <p role="alert" className={styles.error}>
                            {errors.metrics}{" "}
                            <button onClick={retry}>
                                Reintentar indicadores
                            </button>
                        </p>
                    ) : undefined
                }
                calendar={
                    <AgendaPreview
                        items={activities}
                        loading={pending.calendar}
                        error={errors.calendar}
                        onRetry={retry}
                    />
                }
                shortcuts={shortcuts}
            />
            <TicketDetail
                isOpen={ticketId !== null}
                ticketId={String(ticketId || "")}
                onClose={() => setTicket(null)}
                onTicketUpdated={retry}
            />
        </>
    );
}
