import styles from "./MetricCard.module.scss";
export function MetricCard({
    label,
    value,
    caption,
}: {
  label: string;
  value: number | string | undefined;
  caption?: string;
}) {
    return (
        <article className={styles.card}>
            <span className={styles.label}>{label}</span>
            <strong>{value ?? "—"}</strong>
            {caption && <span className={styles.caption}>{caption}</span>}
        </article>
    );
}
