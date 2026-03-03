"use client";

import React from "react";
import classNames from "classnames";
import { Avatar } from "../../atoms/Avatar";
import { Text } from "../../atoms/Text";
import { AssignedChipProps } from "./types";
import styles from "./AssignedChip.module.scss";

/**
 * Componente AssignedChip - Muestra un chip con avatar y nombre del usuario asignado
 *
 * @param {AssignedChipProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente AssignedChip renderizado
 */
export const AssignedChip: React.FC<AssignedChipProps> = ({
  assigned,
  userName,
  avatarSrc,
  avatarInitials,
  className,
}) => {
  // Si no está asignado, mostrar estado por defecto
  if (!assigned) {
    return (
      <div className={classNames(styles.AssignedChip, styles.unassigned, className)}>
        <Avatar 
          src="/images/no-user.png"
          size="sm"
          className={styles.avatar}
        />
        <Text variant="body" className={styles.userName}>
          Sin Asignacion
        </Text>
      </div>
    );
  }

  // Si está asignado, mostrar usuario
  return (
    <div className={classNames(styles.AssignedChip, styles.assigned, className)}>
      <Avatar 
        src={avatarSrc}
        initials={avatarInitials}
        size="sm"
        className={styles.avatar}
      />
      <Text variant="body" className={styles.userName}>
        {userName || "Usuario"}
      </Text>
    </div>
  );
};

export default AssignedChip;
