import type { ReactNode } from "react";
import { WorkspaceIcon } from "../../atoms/WorkspaceIcon/WorkspaceIcon";
import styles from "./SpaceHeader.module.scss";

/** Encabezado de pantalla de la propuesta: espacio, título, propósito y acciones. */
export function SpaceHeader({
    space,
    title,
    description,
    iconName,
    actions,
}: {
    space: string;
    title: string;
    description?: string;
    iconName?: string;
    actions?: ReactNode;
}) {
    return (
        <header className={styles.header}>
            {iconName && (
                <span className={styles.icon} aria-hidden="true">
                    <WorkspaceIcon name={iconName} size={22} />
                </span>
            )}
            <div className={styles.text}>
                <p className={styles.space}>{space}</p>
                <h1>{title}</h1>
                {description && <p className={styles.description}>{description}</p>}
            </div>
            {actions && <div className={styles.actions}>{actions}</div>}
        </header>
    );
}
export default SpaceHeader;
