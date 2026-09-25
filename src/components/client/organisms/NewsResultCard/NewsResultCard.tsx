import React from "react";
import classNames from "classnames";
import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import { LabelChip } from "../../atoms/LabelChip";
import { Text } from "../../atoms/Text";
import type { NewsResultCardProps } from "./types";
import styles from "./NewsResultCard.module.scss";

/**
 * Componente NewsResultCard - Resultado de publicar, programar o guardar una noticia (éxito o error).
 */
const NewsResultCard: React.FC<NewsResultCardProps> = ({
    status,
    title,
    description,
    badge,
    note,
    reference,
    primaryAction,
    secondaryAction,
    className,
}) => {
    const isSuccess = status === "success";

    return (
        <div
            className={classNames(styles.NewsResultCard, className)}
            role={isSuccess ? "status" : "alert"}
        >
            <span className={classNames(styles.statusIcon, isSuccess ? styles.success : styles.error)} aria-hidden="true">
                {isSuccess ? <Icon name="check-solid" size={20} color="#FFFFFF" /> : "!"}
            </span>

            <h2 className={styles.title}>{title}</h2>
            <Text variant="caption" className={styles.description}>{description}</Text>

            {badge && (
                <span className={styles.badge}>
                    <Icon name="clock-rotate-left-solid" size={11} color="#B45309" />
                    {badge}
                </span>
            )}

            {note && <Text variant="caption" className={styles.note}>{note}</Text>}

            {reference && (
                <div className={styles.reference}>
                    <LabelChip label="Texto provisional" className={styles.referenceBadge} />
                    <span>{reference}</span>
                </div>
            )}

            <div className={styles.actions}>
                <Button rounded onClick={primaryAction.onClick}>
                    {primaryAction.label}
                </Button>
                {secondaryAction && (
                    <Button variant="outlined" color="neutral-light" rounded onClick={secondaryAction.onClick}>
                        {secondaryAction.label}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default NewsResultCard;
