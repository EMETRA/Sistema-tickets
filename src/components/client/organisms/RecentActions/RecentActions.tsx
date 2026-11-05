import Link from "next/link";
import { WorkspaceIcon } from "../../atoms/WorkspaceIcon/WorkspaceIcon";
import styles from "./RecentActions.module.scss";
export type RecentAction = {
    id: string;
    title: string;
    detail: string;
    date: string;
    icon: string;
    ticketId?: number;
};
export function RecentActions({
    items,
    loading,
    error,
    onRetry,
    onOpenTicket,
    activityHref = "/espacio/metricas#actividad",
}: {
    items: RecentAction[];
    loading?: boolean;
    error?: string;
    onRetry?: () => void;
    onOpenTicket?: (id: number) => void;
    activityHref?: string;
}) {
    return (
        <section className={styles.card} aria-labelledby="inicio-actividad">
            <header>
                <h2 id="inicio-actividad">Acciones recientes</h2>
                <p>Tu actividad en aplicaciones y tickets</p>
            </header>
            {loading && (
                <p role="status" className={styles.message}>
                    Consultando actividad…
                </p>
            )}
            {error && (
                <p role="alert" className={styles.message}>
                    {error}{" "}
                    {onRetry && (
                        <button onClick={onRetry}>Reintentar actividad</button>
                    )}
                </p>
            )}
            <ul className={styles.list}>
                {items.slice(0, 3).map((item) => (
                    <li key={item.id}>
                        <span className={styles.icon}>
                            <WorkspaceIcon name={item.icon} size={23} />
                        </span>
                        <div className={styles.body}>
                            {item.ticketId && onOpenTicket ? (
                                <button
                                    className={styles.action}
                                    onClick={() => onOpenTicket(item.ticketId!)}
                                >
                                    {item.title}
                                </button>
                            ) : (
                                <strong>{item.title}</strong>
                            )}
                            <p>{item.detail}</p>
                        </div>
                        <time
                            dateTime={item.date}
                            title={absoluteDate(item.date)}
                        >
                            {relativeDate(item.date)}
                        </time>
                    </li>
                ))}
            </ul>
            {!items.length && !loading && !error && (
                <p className={styles.message}>
                    Aún no hay actividad registrada. Aquí aparecerán tus
                    operaciones confirmadas y tus tickets.
                </p>
            )}
            <footer>
                <span>Solo tu actividad autorizada</span>
                <Link href={activityHref}>
                    Ver mi actividad <span aria-hidden="true">→</span>
                </Link>
            </footer>
        </section>
    );
}
function absoluteDate(value: string) {
    const date = new Date(value);
    return Number.isFinite(+date)
        ? date.toLocaleString("es-GT", { timeZone: "America/Guatemala" })
        : "Fecha no disponible";
}
function relativeDate(value: string) {
    const minutes = Math.floor((Date.now() - +new Date(value)) / 60000);
    if (!Number.isFinite(minutes) || minutes < 0) return absoluteDate(value);
    if (minutes < 1) return "Ahora";
    if (minutes < 60) return `Hace ${minutes} min`;
    if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)} h`;
    return `Hace ${Math.floor(minutes / 1440)} d`;
}
