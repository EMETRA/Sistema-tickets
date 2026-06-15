"use client";

import React from "react";
import classNames from "classnames";
import { Icon } from "../../atoms/Icon";
import { TicketCardProps, TICKET_CARD_CONFIG } from "./types";
import styles from "./TicketCard.module.scss";

/**
 * Componente TicketCard - Muestra una tarjeta con información de tickets
 *
 * @param {TicketCardProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente TicketCard renderizado
 */
export const TicketCard: React.FC<TicketCardProps> = (props) => {
    const { label, value, className } = props;

    // Determinar color e iconName según si usa type predefinido o valores custom
    const color = props.type ? TICKET_CARD_CONFIG[props.type].color : props.color;
    const iconName = props.type ? TICKET_CARD_CONFIG[props.type].iconName : props.iconName;

    return (
        <div className={classNames(styles.TicketCard, className)}>
            <div className={styles.Header}>
                <h3 className={styles.Label}>{label}</h3>
                <div 
                    className={styles.IconContainer}
                    style={{ backgroundColor: color }}
                >
                    <Icon 
                        name={iconName} 
                        size={30}
                        variant="status"
                        className={styles.Icon}
                    />
                </div>
            </div>
      
            <div className={styles.Content}>
                <p 
                    className={styles.Value}
                    style={{ color }}
                >
                    {value.toLocaleString()}
                </p>
                <p className={styles.SubLabel}>Tickets</p>
            </div>
        </div>
    );
};

export default TicketCard;
