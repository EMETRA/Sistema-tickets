"use client";

import React from "react";
import classNames from "classnames";
import { Avatar } from "../../atoms/Avatar";
import { Text } from "../../atoms/Text";
import { Icon } from "../../atoms/Icon";
import { EventItemProps } from "./types";
import styles from "./EventItem.module.scss";

/**
 * Formatea la fecha: si es hoy muestra solo hora, sino muestra solo fecha
 */
const formatDate = (date: Date): string => {
  const today = new Date();
  const isToday = 
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) {
    // Mostrar solo hora (formato 24h)
    return date.toLocaleTimeString("es-ES", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  } else {
    // Mostrar solo fecha
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }
};

/**
 * Calcula los días faltantes desde hoy hasta la fecha objetivo
 */
const calculateDaysRemaining = (targetDate: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Componente EventItem - Muestra eventos o movimientos de tickets
 *
 * @param {EventItemProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente EventItem renderizado
 */
export const EventItem: React.FC<EventItemProps> = (props) => {
  const { type, date, className } = props;

  if (type === "movement") {
    const { 
      userName, 
      avatarSrc, 
      avatarInitials, 
      label 
    } = props;

    // Determinar el texto del label
    const labelText = typeof label === "string" 
      ? label 
      : `Ticket #${label.ticketId} a ${label.newState}`;

    return (
      <div className={classNames(styles.EventItem, styles.movement, className)}>
        <Avatar 
          src={avatarSrc} 
          initials={avatarInitials} 
          size="md" 
          className={styles.avatar}
        />
        
        <div className={styles.content}>
          <Text variant="body" className={styles.userName}>
            {userName}
          </Text>
          <Text variant="muted" className={styles.label}>
            {labelText}
          </Text>
        </div>
        
        <Text variant="caption" className={styles.date}>
          {formatDate(date)}
        </Text>
      </div>
    );
  }

  // type === "event"
  const { 
    eventName, 
    iconColor, 
    iconBackgroundColor 
  } = props;

  const daysRemaining = calculateDaysRemaining(date);
  const daysText = `${daysRemaining} ${daysRemaining === 1 ? "día" : "días"}`;

  return (
    <div className={classNames(styles.EventItem, styles.event, className)}>
      <Icon 
        name="calendar-day-solid" 
        variant="status"
        size={24}
        color={iconColor}
        backgroundColor={iconBackgroundColor}
        className={styles.icon}
      />
      
      <div className={styles.content}>
        <Text variant="body" className={styles.eventName}>
          {eventName}
        </Text>
        <Text variant="caption" className={styles.eventDate}>
          {date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })}
        </Text>
      </div>
      
      <Text variant="caption" className={styles.daysRemaining}>
        {daysText}
      </Text>
    </div>
  );
};

export default EventItem;
