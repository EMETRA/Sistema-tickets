import Link from "next/link";
import type { PlatformRecord } from "@/platform/types";
import styles from "./AgendaPreview.module.scss";
export function AgendaPreview({
    items,
    loading,
    error,
    onRetry,
    disabled,
}: {
    items: PlatformRecord[];
    loading?: boolean;
    error?: string;
    onRetry?: () => void;
    disabled?: boolean;
}) {
    const first = items[0];
    const date = first ? new Date(String(first.datos.inicio)) : new Date();
    const day = (d: Date) =>
        d.toLocaleDateString("es-GT", {
            timeZone: "America/Guatemala",
            day: "numeric",
            month: "long",
        });
    const valid = Number.isFinite(+date);
    const today = valid && day(date) === day(new Date());
    return (
        <aside className={styles.card} aria-labelledby="inicio-calendario">
            <header>
                <h2 id="inicio-calendario">Calendario</h2>
                <p>Mi equipo y actividades generales</p>
            </header>
            {!disabled && (
                <div className={styles.date}>
                    <strong>
                        {today ? "Hoy · " : ""}
                        {valid ? day(date) : "Próximas actividades"}
                    </strong>
                    <Link href="/espacio/calendario">Ver calendario</Link>
                </div>
            )}
            {loading && (
                <p role="status" className={styles.message}>
                    Consultando actividades…
                </p>
            )}
            {error && (
                <p role="alert" className={styles.message}>
                    {error}{" "}
                    {onRetry && (
                        <button onClick={onRetry}>Reintentar calendario</button>
                    )}
                </p>
            )}
            <ul>
                {items.slice(0, 2).map((a) => {
                    const d = new Date(String(a.datos.inicio));
                    const time = Number.isFinite(+d)
                        ? d.toLocaleTimeString("es-GT", {
                            timeZone: "America/Guatemala",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                        })
                        : "Hora por confirmar";
                    return (
                        <li key={a.id}>
                            <Link
                                href={"/espacio/registro/actividades/" + a.id}
                            >
                                <strong>
                                    {time} · {a.nombre}
                                </strong>
                                <p>
                                    {a.visibilidad === "EMPRESA"
                                        ? "General de la empresa"
                                        : a.visibilidad === "PRIVADA"
                                            ? "Actividad privada"
                                            : "Visible solo para tu equipo"}
                                    {valid &&
                                    Number.isFinite(+d) &&
                                    day(d) !== day(date)
                                        ? " · " + day(d)
                                        : ""}
                                </p>
                            </Link>
                        </li>
                    );
                })}
            </ul>
            {!items.length && !loading && !error && (
                <p className={styles.message}>
                    {disabled
                        ? "El calendario estará disponible cuando se habilite la plataforma para tu equipo."
                        : "No tienes actividades programadas para estos días."}
                </p>
            )}
        </aside>
    );
}
