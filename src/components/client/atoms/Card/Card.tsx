import React from "react";
import classNames from "classnames";
import { Title } from "../Title";
import { Text } from "../Text";


import { CardProps } from "./types";
import styles from "./Card.module.scss";

const Card: React.FC<CardProps> = ({ title, value, variant = "default", description, actions, className }) => {

    const cardVariant = () => {
        switch (variant) {
        case "default":
            return (
                <div className={styles.defaultCard}>
                    <Title variant="mid" tag="h3" className={styles.title}>{title}</Title>
                    {description && <Text className={styles.description}>{description}</Text>}
                    {actions && <div className={styles.actions}>{actions}</div>}
                </div>
            );
        case "info":
            return (
                <div className={classNames(styles.infoCard, styles.centeredCard, className)}>
                    <Title variant="mid" tag="h4" className={styles.title}>{title}</Title>
                    <Text variant="body" className={styles.value}>{value}</Text>
                </div>
            );
        case "centered":
            return (
                <div className={styles.centeredCard}>
                    <Title variant="mid" tag="h4" className={styles.title}>{title}</Title>
                    <Text variant="body" className={styles.value}>{value}</Text>
                    {description && <Text className={styles.description}>{description}</Text>}
                    {actions && <div className={styles.actions}>{actions}</div>}
                </div>
            );
        case "kpi":
            return (
                <div className={classNames(styles.kpiCard, styles.centeredCard, className)}>
                    <Title variant="mid" tag="h4" className={styles.title}>{value}</Title>
                    <Text variant="body" className={styles.value}>{title}</Text>
                </div>
            );
        default:
            return null;
        }
    }

    return (
        <div className={classNames(styles.card, className)}>
            {cardVariant()}
        </div>
    );

}

export default Card;
