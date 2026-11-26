"use client";
import { statusLabel, statusTone } from "@/helpers/statusTone";
import { guatemalaDay } from "@/platform/dates";
import { displayDate } from "@/helpers/displayDate";
import common from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import styles from "./AuditFeed.module.scss";

export type AuditEntry = {
    id: string;
    actor: string;
    tipo: string;
    registroId: string;
    accion: string;
    resultado: string;
    fecha: string;
    antes: unknown;
    despues: unknown;
    solicitudId: string;
    revisadoEn: string | null;
    confirmadoEn: string | null;
};

const VERBS: Record<string, string> = {
    CREAR: "creó",
    EDITAR: "editó",
    ELIMINAR: "eliminó",
    ASIGNAR: "asignó",
    APROBAR: "aprobó",
    RECHAZAR: "rechazó",
    INICIAR: "inició",
    RESOLVER: "resolvió",
    CANCELAR: "canceló",
    POSICION: "reubicó",
    COPIAR: "copió",
    CONSULTAR: "consultó",
};
const verb = (accion: string) => VERBS[accion] || statusLabel(accion).toLocaleLowerCase("es-GT");
const initials = (name: string) =>
    name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
const time = (iso: string) =>
    new Intl.DateTimeFormat("es-GT", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: "America/Guatemala",
    }).format(new Date(iso));
function dayTitle(day: string) {
    const label = new Intl.DateTimeFormat("es-GT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "UTC",
    }).format(new Date(day + "T12:00:00Z"));
    if (day === guatemalaDay()) return "Hoy · " + label;
    if (day === guatemalaDay(new Date(Date.now() - 86400000))) return "Ayer · " + label;
    return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Propuesta: la trazabilidad como historial por día; las excepciones resaltan solas. */
export function AuditFeed({ items }: { items: AuditEntry[] }) {
    const days = items.reduce<Record<string, AuditEntry[]>>((acc, item) => {
        const day = guatemalaDay(new Date(item.fecha));
        (acc[day] ||= []).push(item);
        return acc;
    }, {});
    if (!items.length) return <p className={styles.empty}>No hay movimientos con estos filtros.</p>;
    return (
        <div className={styles.feed}>
            {Object.entries(days).map(([day, entries]) => {
                const problems = entries.filter((e) => statusTone(e.resultado) === "danger").length;
                return (
                    <section key={day} className={styles.day} aria-label={dayTitle(day)}>
                        <header>
                            <h3>{dayTitle(day)}</h3>
                            <span>
                                {entries.length} {entries.length === 1 ? "movimiento" : "movimientos"}
                                {problems > 0 && (
                                    <strong>
                                        {" "}
                                        · {problems}{" "}
                                        {problems === 1 ? "denegado o fallido" : "denegados o fallidos"}
                                    </strong>
                                )}
                            </span>
                        </header>
                        <ol>
                            {entries.map((e) => {
                                const tone = statusTone(e.resultado);
                                return (
                                    <li key={e.id} data-tone={tone}>
                                        <span className={styles.time}>{time(e.fecha)}</span>
                                        <span className={styles.avatar} aria-hidden="true">
                                            {initials(e.actor)}
                                        </span>
                                        <div className={styles.body}>
                                            <p className={styles.sentence}>
                                                <strong>{e.actor}</strong> {verb(e.accion)}{" "}
                                                <span className={styles.resource}>{e.tipo}</span>{" "}
                                                <code>{e.registroId}</code>
                                            </p>
                                            <p className={styles.meta}>
                                                {e.revisadoEn && e.confirmadoEn
                                                    ? `Doble confirmación · ${displayDate(e.revisadoEn)} y ${displayDate(e.confirmadoEn)}`
                                                    : "Sin doble confirmación"}
                                            </p>
                                            <details className={common.inlineDetails}>
                                                <summary>Antes y después</summary>
                                                <div className={styles.diff}>
                                                    <pre className={common.log}>
                                                        {JSON.stringify(e.antes, null, 2)}
                                                    </pre>
                                                    <pre className={common.log}>
                                                        {JSON.stringify(e.despues, null, 2)}
                                                    </pre>
                                                </div>
                                                <small className={common.muted}>
                                                    Solicitud: {e.solicitudId}
                                                </small>
                                            </details>
                                        </div>
                                        <span className={common.chip} data-tone={tone}>
                                            {statusLabel(e.resultado)}
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>
                    </section>
                );
            })}
        </div>
    );
}
export default AuditFeed;
