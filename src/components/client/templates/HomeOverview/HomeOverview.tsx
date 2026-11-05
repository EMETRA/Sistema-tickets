import Link from "next/link";
import type { ReactNode } from "react";
import { MetricCard } from "../../molecules/MetricCard";
import { WorkspaceIcon } from "../../atoms/WorkspaceIcon/WorkspaceIcon";
import styles from "./HomeOverview.module.scss";
export type HomeShortcut = { label: string; href: string; icon: string };
export type HomeMetric = {
    label: string;
    value?: number | string;
    caption?: string;
};

/** Composición P04–P06/P63–P65; los adaptadores aportan datos y alcance reales. */
export function HomeOverview({
    eyebrow,
    title,
    description,
    metrics,
    primary,
    calendar,
    shortcuts,
    notice,
}: {
    eyebrow: string;
    title: string;
    description: string;
    metrics: HomeMetric[];
    primary: ReactNode;
    calendar: ReactNode;
    shortcuts: HomeShortcut[];
    notice?: ReactNode;
}) {
    return (
        <div className={styles.page}>
            <header className={styles.hero}>
                <p className={styles.eyebrow}>{eyebrow}</p>
                <h1>{title}</h1>
                <p className={styles.description}>{description}</p>
            </header>
            {notice}
            <div
                className={styles.metrics}
                role="group"
                aria-label="Indicadores de tickets"
            >
                {metrics.map((m) => (
                    <MetricCard key={m.label} {...m} value={m.value} />
                ))}
            </div>
            <div className={styles.content}>
                {primary}
                {calendar}
            </div>
            <nav
                className={styles.shortcuts}
                aria-label="Accesos de mi espacio"
            >
                {shortcuts.map((s) => (
                    <Link
                        className={styles.shortcut}
                        key={s.href}
                        href={s.href}
                    >
                        <span className={styles.shortcutIcon}>
                            <WorkspaceIcon name={s.icon} size={26} />
                        </span>
                        <h2>{s.label}</h2>
                        <span className={styles.shortcutAction}>
                            Ingresar <span aria-hidden="true">→</span>
                        </span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
