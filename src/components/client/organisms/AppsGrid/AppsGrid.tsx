import { AppsGridProps } from "./types";
import { AppCard } from "../../molecules/AppCard";
import styles from "./AppsGrid.module.scss";
import classNames from "classnames";

export const AppsGrid = ({
    title,
    apps,
    description = "Accesos disponibles según tu perfil.",
    showHeading = true,
    className,
}: AppsGridProps) => (
    <section
        className={classNames(styles.container, className)}
        aria-label={title}
    >
        {(showHeading || description) && (
            <header className={styles.header}>
                {showHeading && <h1>{title}</h1>}
                {description && <p>{description}</p>}
            </header>
        )}
        {apps.length === 0 ? (
            <div className={styles.empty}>
                <h2>No hay aplicaciones disponibles</h2>
                <p>
                    Los accesos aparecerán aquí cuando se asignen permisos a tu
                    perfil.
                </p>
            </div>
        ) : (
            <div className={styles.grid}>
                {apps.map((app) => (
                    <AppCard
                        key={app.title + app.iconLabel}
                        {...app}
                        className={styles.card}
                    />
                ))}
            </div>
        )}
    </section>
);
export default AppsGrid;
