"use client"

import React from "react";
import classNames from "classnames";
import { Title } from "../../atoms/Title";
import { ProgressRing } from "../../atoms/ProgressRing";
import { Divider } from "../../atoms/Divider";
import { StatInLine } from "../../molecules/StatInLine"
import styles from "./MyStatisticsPanel.module.scss";
import { MyStatisticsPanelProps } from "./types";

export const MyStatisticsPanel: React.FC<MyStatisticsPanelProps> = ({ percentage, resolvedTickets, assignedTickets, inProgressTickets  }) => {
    return(
        <div className={classNames(styles.MyStatisticsPanel)}>
            <Title variant="mid">
                Mis estadísticas
            </Title>
            <div className={classNames(styles.progressContainer)}>
                <ProgressRing percentage={percentage} size={120} strokeWidth={5} />
            </div>
            <div className={classNames(styles.statsMainContainer)}>
                <StatInLine size="medium" type="resolved" label="Resueltos" value={resolvedTickets} />
                <Divider />
                <div className={classNames(styles.statsSecondaryContainer)}>
                    <StatInLine size="medium" type="assigned" label="Asignados" value={assignedTickets} />
                    <Divider orientation="vertical" />
                    <StatInLine size="medium" type="in-progress" label="En Progreso" value={inProgressTickets} />
                </div>
            </div>
        </div>
    )
}