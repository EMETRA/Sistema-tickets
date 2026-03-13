"use client";

import React from "react";
import classNames from "classnames";
import { TicketStat } from "../../molecules/TicketStat";
import { Divider } from "@/components/client/atoms/Divider";
import { DashboardStatsBarProps } from "./types";
import styles from "./DashboardStatsBar.module.scss";

/**
 * Componente DashboardStatsBar - Panel que muestra múltiples estadísticas de tickets
 *
 * @param {DashboardStatsBarProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente DashboardStatsBar renderizado
 */
export const DashboardStatsBar: React.FC<DashboardStatsBarProps> = ({
  stats,
  className,
}) => {
  return (
    <div className={classNames(styles.DashboardStatsBar, className)}>
      {stats.map((stat, index) => (
        <React.Fragment key={`${stat.type}-${index}`}>
          <TicketStat
            type={stat.type}
            label={stat.label}
            value={stat.value}
            className={styles.StatItem}
          />
          {index < stats.length - 1 && (
            <Divider orientation="vertical" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default DashboardStatsBar;
