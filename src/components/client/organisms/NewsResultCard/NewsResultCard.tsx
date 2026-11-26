import React from "react";
import classNames from "classnames";
import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import { Text } from "../../atoms/Text";
import type { NewsResultCardProps } from "./types";
import styles from "./NewsResultCard.module.scss";
import { StateNotice } from "../../molecules/StateNotice";

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
        <StateNotice
            tone={isSuccess ? "success" : "error"}
            title={title}
            description={description}
            reference={typeof reference === "string" ? reference : undefined}
            helpTopic={isSuccess ? undefined : "comunicacion"}
            actions={
                <>
                    <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
                    {secondaryAction && (
                        <Button variant="outlined" onClick={secondaryAction.onClick}>
                            {secondaryAction.label}
                        </Button>
                    )}
                </>
            }
        >
            <div className={classNames(styles.extra, className)}>
                {badge && (
                    <span className={styles.badge}>
                        <Icon name="clock-rotate-left-solid" size={11} color="currentColor" />
                        {badge}
                    </span>
                )}
                {note && (
                    <Text variant="caption" className={styles.note}>
                        {note}
                    </Text>
                )}
                {reference && typeof reference !== "string" && (
                    <div className={styles.reference}>{reference}</div>
                )}
            </div>
        </StateNotice>
    );
};

export default NewsResultCard;
