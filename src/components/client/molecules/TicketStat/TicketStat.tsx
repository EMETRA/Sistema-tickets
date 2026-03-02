"use client";

import React from "react";
import classNames from "classnames";
import { Icon } from "../../atoms/Icon";
import { TicketStatProps, TICKET_STAT_CONFIG } from "./types";
import styles from "./TicketStat.module.scss";

/**
 * Componente TicketStat - Muestra una estadística de tickets en formato horizontal
 *
 * @param {TicketStatProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente TicketStat renderizado
 */
export const TicketStat: React.FC<TicketStatProps> = (props) => {
  const { label, value, className } = props;

  // Determinar color e iconName según si usa type predefinido o valores custom
  const color = props.type ? TICKET_STAT_CONFIG[props.type].color : props.color;
  const iconName = props.type ? TICKET_STAT_CONFIG[props.type].iconName : props.iconName;

  return (
    <div className={classNames(styles.TicketStat, className)}>
      <div 
        className={styles.IconContainer}
        style={{ backgroundColor: color }}
      >
        <Icon 
          name={iconName} 
          size={32}
          variant="status"
        />
      </div>
      
      <div className={styles.Content}>
        <h3 className={styles.Label}>{label}</h3>
        <p 
          className={styles.Value}
          style={{ color }}
        >
          {value.toLocaleString()} tickets
        </p>
      </div>
    </div>
  );
};

export default TicketStat;
