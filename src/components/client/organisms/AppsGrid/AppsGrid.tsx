import React from "react";
import { AppsGridProps } from "./types";
import { AppCard } from "../../molecules/AppCard";
import styles from "./AppsGrid.module.scss";
import classNames from "classnames";
import { Title } from "../../atoms/Title";
import { Text } from "../../atoms/Text";

export const AppsGrid = ({
    title,
    apps,
    className
}: AppsGridProps) => {
    return (
        <section className={classNames(styles.container, className)}>
            <Title className={styles.header}>
                {title}
            </Title>
            <div className={styles.grid}>
                {apps.length === 0 ? (
                    <Text variant="body" className={styles.title}>
                        No hay apps asignadas.
                    </Text>
                ) : (
                    apps.map((app, index) => (
                        <AppCard
                            key={index}
                            {...app}
                            className={styles.card}
                        />
                    ))
                )}
            </div>
        </section>
    );
};

export default AppsGrid;