import { AppsGridProps } from "./types";
import { AppCard } from "../../molecules/AppCard";
import styles from "./AppsGrid.module.scss";
import classNames from "classnames";

export const AppsGrid = ({ title, apps, description, showHeading = true, className }: AppsGridProps) => (
    <section className={classNames(styles.container, className)} aria-label={title}>
        {(showHeading || description) && (
            <header className={styles.header}>
                {showHeading && <h1>{title}</h1>}
                {description && <p>{description}</p>}
            </header>
        )}
        {apps.length === 0 ? (
            <div className={styles.empty}>
                <h2>No hay aplicaciones disponibles</h2>
                <p>Los accesos aparecerán aquí cuando se asignen permisos a tu perfil.</p>
            </div>
        ) : (
            <div className={styles.grid}>
                {apps.map((app) => (
                    <AppCard
                        key={app.title + app.iconLabel}
                        {...app}
                        title={areaName(app.title)}
                        className={styles.card}
                    />
                ))}
            </div>
        )}
    </section>
);
/** "Aplicaciones de Informática" → "Informática": el área se lee desde su primera palabra. */
function areaName(title: string) {
    return title.replace(/^aplicaciones\s+(de\s+(la\s+|los\s+|las\s+)?)?/i, "") || title;
}
export default AppsGrid;
