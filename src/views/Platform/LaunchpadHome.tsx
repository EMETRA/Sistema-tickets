"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WorkspaceIcon } from "@/components/client/atoms/WorkspaceIcon/WorkspaceIcon";
import { TicketDetail } from "@/components/client/organisms/TicketDetail";
import { usePlatform } from "@/platform/context";
import { platformFetch } from "@/platform/client";
import { guatemalaDay } from "@/platform/dates";
import { readRecents, type RecentModule } from "@/platform/recents";
import { ServerFleet } from "@/components/client/organisms/ServerFleet";
import type { PageResult, PlatformRecord } from "@/platform/types";
import { useAppsCatalogContext } from "@/context/AppsCatalogContext";
import { buildModulePath } from "@/config/apps-catalog";
import { areaAccent, areaName } from "@/config/app-areas";
import { useCreateTicketDialog } from "@/store/useCreateTicketDialog";
import { useCommandPalette } from "@/store/useCommandPalette";
import styles from "./LaunchpadHome.module.scss";

type Summary = {
    tickets: {
        total: number;
        resueltos: number;
        enTrabajo: number;
        asignados: number;
        sinAsignar?: number;
        sinPrimeraAtencion?: number;
        pendientesRespuesta?: number;
    };
};
type Ticket = {
    id: number;
    codigo: string;
    titulo: string;
    estado: number;
    alerta: string | null;
    creadoEn?: string;
};

const STATE: Record<number, [string, string]> = {
    1: ["Sin asignar", "neutral"],
    2: ["Asignado", "warning"],
    3: ["En atención", "info"],
    4: ["Cancelado", "neutral"],
    5: ["Resuelto", "success"],
};

function greeting() {
    const hour = Number(
        new Intl.DateTimeFormat("es-GT", {
            hour: "numeric",
            hour12: false,
            timeZone: "America/Guatemala",
        }).format(new Date()),
    );
    return hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
}
const today = () =>
    new Intl.DateTimeFormat("es-GT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "America/Guatemala",
    }).format(new Date());
const time = (iso: string) =>
    new Intl.DateTimeFormat("es-GT", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: "America/Guatemala",
    }).format(new Date(iso));
const dayLabel = (iso: string) => {
    const d = guatemalaDay(new Date(iso));
    if (d === guatemalaDay()) return "Hoy";
    if (d === guatemalaDay(new Date(Date.now() + 86400000))) return "Mañana";
    return new Intl.DateTimeFormat("es-GT", {
        weekday: "short",
        day: "numeric",
        timeZone: "America/Guatemala",
    }).format(new Date(iso));
};

/** Inicio de la propuesta «Panel institucional»: un lanzador según el rol. */
export function LaunchpadHome() {
    const { data } = usePlatform();
    const { catalog } = useAppsCatalogContext();
    const showCreate = useCreateTicketDialog((s) => s.show);
    const createdVersion = useCreateTicketDialog((s) => s.createdVersion);
    const showPalette = useCommandPalette((s) => s.show);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [tickets, setTickets] = useState<Ticket[] | null>(null);
    const [activities, setActivities] = useState<PlatformRecord[] | null>(null);
    const [recents, setRecents] = useState<RecentModule[]>([]);
    const [ticketId, setTicketId] = useState<string | null>(null);
    const [revision, setRevision] = useState(0);

    const actor = data!.actor;
    const staff = actor.admin || actor.mode !== "USUARIO";
    const queue = data!.capabilities.assign;
    const scope = queue ? "cola" : data!.capabilities.attend ? "asignados" : "creados";
    const monitor =
        !!data!.definitions.servidores && (actor.admin || ["DEVOPS", "DESARROLLADOR"].includes(actor.mode));
    const firstName = actor.nombre.split(" ")[0];

    useEffect(() => {
        // Recientes: guardados por este navegador al abrir módulos.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRecents(readRecents());
    }, []);

    useEffect(() => {
        const c = new AbortController();
        const opts = { signal: c.signal };
        const ok =
            <T,>(set: (v: T) => void) =>
            (v: T) =>
                !c.signal.aborted && set(v);
        platformFetch<Summary>("/metrics?inicio=true" + (scope === "creados" ? "&scope=creados" : ""), opts)
            .then(async (m) => {
                // La cola se cuenta con la misma fuente que la bandeja (sin ventana de 30 días).
                if (scope === "cola") {
                    const total = (estado: string) =>
                        platformFetch<PageResult<Ticket>>(
                            `/tickets?scope=cola&estado=${estado}&limit=1`,
                            opts,
                        ).then((r) => r.total);
                    const [sinAsignar, sinPrimeraAtencion] = await Promise.all([
                        total("sin-asignar"),
                        total("sin-atencion"),
                    ]);
                    m = { ...m, tickets: { ...m.tickets, sinAsignar, sinPrimeraAtencion } };
                }
                if (!c.signal.aborted) setSummary(m);
            })
            .catch(() => undefined);
        platformFetch<PageResult<Ticket>>(`/tickets?scope=${scope}&limit=5`, opts)
            .then(ok((r: PageResult<Ticket>) => setTickets(r.items)))
            .catch(() => !c.signal.aborted && setTickets([]));
        const start = new Date(guatemalaDay() + "T00:00:00-06:00");
        const end = new Date(+start + 7 * 86400000);
        platformFetch<PageResult<PlatformRecord>>(
            `/records/actividades?limit=4&desde=${encodeURIComponent(start.toISOString())}&hasta=${encodeURIComponent(end.toISOString())}`,
            opts,
        )
            .then(ok((r: PageResult<PlatformRecord>) => setActivities(r.items)))
            .catch(() => !c.signal.aborted && setActivities([]));
        return () => c.abort();
    }, [scope, revision, createdVersion]);

    const apps = catalog ? Object.values(catalog) : [];
    const t = summary?.tickets;
    const stats = queue
        ? [
              { label: "Sin asignar", value: t?.sinAsignar, tone: "neutral" },
              {
                  label: "Sin primera atención",
                  value: t?.sinPrimeraAtencion,
                  tone: (t?.sinPrimeraAtencion || 0) > 0 ? "danger" : "neutral",
              },
              { label: "En atención", value: t?.enTrabajo, tone: "info" },
              { label: "Resueltos · 30 días", value: t?.resueltos, tone: "success" },
          ]
        : [
              { label: "Abiertas", value: t ? t.total - t.resueltos : undefined, tone: "neutral" },
              { label: "En atención", value: t?.enTrabajo, tone: "info" },
              {
                  label: staff ? "Asignados" : "Esperan tu respuesta",
                  value: staff ? t?.asignados : t?.pendientesRespuesta,
                  tone: "warning",
              },
              { label: "Resueltas · 30 días", value: t?.resueltos, tone: "success" },
          ];

    return (
        <div className={styles.page}>
            <header className={styles.hero}>
                <div className={styles.heroText}>
                    <p className={styles.date}>{today()}</p>
                    <h1>
                        {greeting()}, {firstName}
                    </h1>
                    <p className={styles.lead}>
                        {staff
                            ? "Tu mesa de servicio, las aplicaciones institucionales y la plataforma, en un solo panel."
                            : "Tus aplicaciones institucionales y tus solicitudes a Informática, en un solo lugar."}
                    </p>
                </div>
                <button type="button" className={styles.ask} onClick={showPalette}>
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path
                            d="m20 20-3.5-3.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                    <span>¿Qué necesitas hoy? Busca una aplicación, un módulo o un ticket</span>
                    <kbd>⌘K</kbd>
                </button>
                <nav className={styles.quick} aria-label="Acciones rápidas">
                    <button type="button" className={styles.primaryAction} onClick={showCreate}>
                        <span aria-hidden="true">+</span> Crear ticket
                    </button>
                    {queue && (
                        <Link href="/espacio/asignacion">
                            <WorkspaceIcon name="ticket-solid" size={16} /> Mesa de servicio
                        </Link>
                    )}
                    <Link href="/mis-tickets">
                        <WorkspaceIcon name="file-lines-regular" size={16} /> Mis solicitudes
                    </Link>
                    <Link href="/espacio/calendario">
                        <WorkspaceIcon name="calendar-week-solid" size={16} /> Calendario
                    </Link>
                    {monitor && (
                        <Link href="/espacio/infraestructura">
                            <WorkspaceIcon name="layer-group-solid" size={16} /> Servidores
                        </Link>
                    )}
                </nav>
            </header>

            <section className={styles.block} aria-labelledby="lp-apps">
                <div className={styles.blockHeader}>
                    <div>
                        <h2 id="lp-apps">Tus aplicaciones</h2>
                        <p>Los sistemas institucionales que tienes autorizados, ahora dentro del panel.</p>
                    </div>
                    <Link href="/aplicaciones" className={styles.more}>
                        Ver todas <span aria-hidden="true">→</span>
                    </Link>
                </div>
                {recents.length > 0 && (
                    <div className={styles.recents}>
                        <span>Recientes</span>
                        {recents.slice(0, 4).map((r) => (
                            <Link key={r.path} href={r.path}>
                                {r.title}
                                <small>{r.area.split(" › ")[0]}</small>
                            </Link>
                        ))}
                    </div>
                )}
                {apps.length ? (
                    <div className={styles.apps}>
                        {apps.map((app) => {
                            const sections = Object.values(app.sections);
                            const modules = sections.flatMap((s) =>
                                s.modules.map((m) => ({ ...m, section: s.meta.id })),
                            );
                            return (
                                <article
                                    key={app.meta.id}
                                    className={styles.app}
                                    style={{ "--accent": areaAccent(app.meta.id) } as React.CSSProperties}
                                >
                                    <Link href={`/home/${app.meta.id}`} className={styles.appHead}>
                                        <span className={styles.appIcon}>
                                            <WorkspaceIcon name={app.meta.iconName} size={20} />
                                        </span>
                                        <span>
                                            <strong>{areaName(app.meta.title)}</strong>
                                            <small>
                                                {sections.length}{" "}
                                                {sections.length === 1 ? "sección" : "secciones"} ·{" "}
                                                {modules.length} {modules.length === 1 ? "módulo" : "módulos"}
                                            </small>
                                        </span>
                                    </Link>
                                    <ul>
                                        {modules.slice(0, 3).map((m) => (
                                            <li key={m.section + m.id}>
                                                <Link href={buildModulePath(app.meta.id, m.section, m.id)}>
                                                    {m.title}
                                                </Link>
                                            </li>
                                        ))}
                                        {modules.length > 3 && (
                                            <li className={styles.moreModules}>
                                                <Link href={`/home/${app.meta.id}`}>
                                                    +{modules.length - 3} más
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.emptyApps}>
                        <strong>Aún no tienes aplicaciones asignadas</strong>
                        <p>
                            Cuando Informática habilite Financiero, Recaudación, Juzgado u otros sistemas para
                            tu perfil, aparecerán aquí.
                        </p>
                        <button type="button" onClick={showCreate}>
                            Solicitar acceso a una aplicación
                        </button>
                    </div>
                )}
            </section>

            <div className={styles.columns}>
                <section className={styles.panel} aria-labelledby="lp-work">
                    <div className={styles.blockHeader}>
                        <div>
                            <h2 id="lp-work">
                                {queue
                                    ? "Mesa de servicio"
                                    : staff
                                      ? "Tu trabajo asignado"
                                      : "Tus solicitudes"}
                            </h2>
                            <p>
                                {queue
                                    ? "Tickets por asignar y su primera atención."
                                    : "Estado de tus tickets."}
                            </p>
                        </div>
                        <Link
                            href={queue || staff ? "/espacio/asignacion" : "/mis-tickets"}
                            className={styles.more}
                        >
                            Abrir <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                    <dl className={styles.stats}>
                        {stats.map((s) => (
                            <div key={s.label} data-tone={s.tone}>
                                <dt>{s.label}</dt>
                                <dd>{s.value ?? "—"}</dd>
                            </div>
                        ))}
                    </dl>
                    <ul className={styles.tickets}>
                        {tickets === null && <li className={styles.muted}>Consultando…</li>}
                        {tickets?.length === 0 && (
                            <li className={styles.muted}>No hay tickets en esta bandeja. ¡Todo al día!</li>
                        )}
                        {tickets?.map((ticket) => {
                            const [label, tone] = STATE[ticket.estado] || ["Registrado", "neutral"];
                            return (
                                <li key={ticket.id} data-alert={!!ticket.alerta || undefined}>
                                    <button type="button" onClick={() => setTicketId(String(ticket.id))}>
                                        <span className={styles.code}>
                                            {ticket.codigo || "#" + ticket.id}
                                        </span>
                                        <span className={styles.title}>
                                            {ticket.titulo}
                                            {ticket.alerta && (
                                                <small>Sin primera atención · superó el umbral</small>
                                            )}
                                        </span>
                                        <span className={styles.state} data-tone={tone}>
                                            {label}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <section className={styles.panel} aria-labelledby="lp-agenda">
                    <div className={styles.blockHeader}>
                        <div>
                            <h2 id="lp-agenda">Próximos 7 días</h2>
                            <p>Actividades de tu equipo y generales.</p>
                        </div>
                        <Link href="/espacio/calendario" className={styles.more}>
                            Calendario <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                    <ol className={styles.agenda}>
                        {activities === null && <li className={styles.muted}>Consultando…</li>}
                        {activities?.length === 0 && (
                            <li className={styles.muted}>Sin actividades programadas.</li>
                        )}
                        {activities?.map((a) => (
                            <li key={a.id}>
                                <span className={styles.when}>
                                    <strong>{dayLabel(String(a.datos.inicio))}</strong>
                                    <small>{time(String(a.datos.inicio))}</small>
                                </span>
                                <span className={styles.what}>
                                    {a.nombre}
                                    <small>
                                        {a.equipoId
                                            ? data!.teams.find((tm) => tm.id === a.equipoId)?.nombre ||
                                              "Equipo"
                                            : "General"}
                                    </small>
                                </span>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>

            {monitor && (
                <section className={styles.block} aria-labelledby="lp-platform">
                    <div className={styles.blockHeader}>
                        <div>
                            <h2 id="lp-platform">Estado de la plataforma</h2>
                            <p>Última observación de los servidores que supervisas.</p>
                        </div>
                        <button
                            type="button"
                            className={styles.more}
                            onClick={() => setRevision((r) => r + 1)}
                        >
                            Actualizar
                        </button>
                    </div>
                    <ServerFleet limit={4} revision={revision} />
                </section>
            )}
            <TicketDetail
                isOpen={!!ticketId}
                ticketId={ticketId || ""}
                onClose={() => setTicketId(null)}
                onTicketUpdated={() => setRevision((r) => r + 1)}
            />
        </div>
    );
}
export default LaunchpadHome;
