"use client";
import classNames from "classnames";
import { AppCardProps } from "./types";
import { WorkspaceIcon } from "../../atoms/WorkspaceIcon/WorkspaceIcon";
import styles from "./AppCard.module.scss";

export const AppCard = ({ icon, iconLabel, title, description, onButtonClick, className }: AppCardProps) => (
    <article className={classNames(styles.AppCard, className)}>
        <button
            type="button"
            className={styles.entry}
            onClick={onButtonClick}
            aria-label={"Ingresar a " + (title || iconLabel)}
        >
            <span className={styles.icon} aria-hidden="true">
                <WorkspaceIcon name={icon} size={20} />
            </span>
            <span className={styles.content}>
                <span className={styles.title}>{title}</span>
                {description && <span className={styles.description}>{description}</span>}
            </span>
            <span className={styles.arrow} aria-hidden="true">
                <WorkspaceIcon name="arrow-right-solid" size={16} />
            </span>
        </button>
    </article>
);
export default AppCard;
