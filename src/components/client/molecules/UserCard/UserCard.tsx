"use client";

import React from "react";
import classNames from "classnames";
import { Avatar } from "../../atoms/Avatar";
import { IconButton } from "../../atoms/IconButton";
import { Text } from "../../atoms/Text";
import { StatInLine } from "../StatInLine";
import { UserCardProps } from "./types";
import styles from "./UserCard.module.scss";

/**
 * Componente UserCard - Muestra información de un usuario con estadísticas
 *
 * @param {UserCardProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente UserCard renderizado
 */
export const UserCard: React.FC<UserCardProps> = ({
  name,
  email,
  role,
  avatarSrc,
  avatarInitials,
  status,
  assignedCount,
  resolvedCount,
  menuIcon = "ellipsis-vertical-solid",
  onMenuClick,
  className,
}) => {
  return (
    <div className={classNames(styles.UserCard, className)}>
      {/* Header con Avatar y botón de menú */}
      <div className={styles.header}>
        <Avatar
          src={avatarSrc}
          initials={avatarInitials}
          size="lg"
          status={status}
          className={styles.avatar}
        />
        <IconButton
          icon={menuIcon}
          size={20}
          borderless
          onClick={onMenuClick}
          className={styles.menuButton}
        />
      </div>

      {/* Información del usuario */}
      <div className={styles.userInfo}>
        <Text className={styles.name}>
          {name}
        </Text>
        <Text className={styles.email}>
          {email}
        </Text>
        <Text className={styles.role}>
          {role}
        </Text>
      </div>

      {/* Estadísticas */}
      <div className={styles.stats}>
        <StatInLine
          label="Asignados"
          value={assignedCount}
          type="assigned"
          size="small"
        />
        <div className={styles.divider} />
        <StatInLine
          label="Resueltos"
          value={resolvedCount}
          type="resolved"
          size="small"
        />
      </div>
    </div>
  );
};

export default UserCard;
