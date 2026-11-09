"use client";
import classNames from "classnames";
import { AppCardProps } from "./types";
import { WorkspaceIcon } from "../../atoms/WorkspaceIcon/WorkspaceIcon";
import { Button } from "../../atoms/Button";
import styles from "./AppCard.module.scss";

export const AppCard = ({
    icon,
    iconLabel,
    title,
    description = "Acceso del catálogo de aplicaciones",
    onButtonClick,
    className,
}: AppCardProps) => (
    <article className={classNames(styles.AppCard, className)}>
        <div className={styles.content}>
            <div className={styles.icon} aria-hidden="true">
                <WorkspaceIcon name={icon} size={26} />
            </div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
        </div>
        <div className={styles.footer}>
            <Button
                variant="text"
                color="cancel"
                icon="arrow-right-solid"
                onClick={onButtonClick}
                aria-label={"Ingresar a " + (title || iconLabel)}
                className={styles.button}
                fullWidth
            >
                Ingresar
            </Button>
        </div>
    </article>
);
export default AppCard;
