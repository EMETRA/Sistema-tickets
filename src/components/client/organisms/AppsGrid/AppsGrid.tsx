import React from "react";
import { AppsGridProps } from "./types";
import { AppCard } from "../../molecules/AppCard";
import styles from "./AppsGrid.module.scss";
import classNames from "classnames";
import { Title } from "../../atoms/Title";

export const AppsGrid = ({
    title,
    apps,
    className
}: AppsGridProps) => {
    return (
        <section className={classNames(styles.container, className)}>
            <Title
                className={styles.header}
            >
                {title}
            </Title>
            <div className={styles.grid}>
                {apps.map((app, index) => (
                    <AppCard 
                        key={index}
                        {...app}
                        className={styles.card}
                    />
                ))}
            </div>
        </section>
    );
};

export default AppsGrid;