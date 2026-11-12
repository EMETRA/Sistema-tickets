import type { ActividadEditorialNoticia } from "@/api/graphql/COM03/types";
import styles from "./NewsActivity.module.scss";

const dateFormatter = new Intl.DateTimeFormat("es-GT", {
    timeZone: "America/Guatemala",
    dateStyle: "short",
    timeStyle: "short",
});

export default function NewsActivity({
    activity,
    compact = false,
}: {
    activity?: ActividadEditorialNoticia;
    compact?: boolean;
}) {
    const rows = [
        {
            label: "Creada por",
            actor: activity?.creadoPor,
            date: activity?.creadoEn,
        },
        {
            label: "Última actualización",
            actor: activity?.actualizadoPor,
            date: activity?.actualizadoEn,
        },
    ];
    const content = (
        <dl className={compact ? styles.compact : styles.details}>
            {rows.map(({ label, actor, date }) => (
                <div key={label}>
                    <dt>{label}</dt>
                    <dd>
                        <span>
                            {actor?.nombre?.trim() ||
                                (actor
                                    ? `Usuario #${actor.id}`
                                    : "Sin registro")}
                        </span>
                        {date && Number.isFinite(Date.parse(date)) && (
                            <time dateTime={date}>
                                {dateFormatter.format(new Date(date))}
                            </time>
                        )}
                    </dd>
                </div>
            ))}
        </dl>
    );
    return compact ? (
        content
    ) : (
        <section className={styles.card} aria-label="Responsables del registro">
            <h2>Responsables del registro</h2>
            {content}
        </section>
    );
}
