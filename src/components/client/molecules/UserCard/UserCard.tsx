"use client";

import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import { Avatar } from "../../atoms/Avatar";
import { IconButton } from "../../atoms/IconButton";
import { Text } from "../../atoms/Text";
import { StatInLine } from "../StatInLine";
import { UserCardProps, UserStatusOption } from "./types";
import styles from "./UserCard.module.scss";
import { Link } from "../../atoms/Link";

// Opciones de estado del usuario
const statusOptions: UserStatusOption[] = [
  { label: "De vacaciones", color: "#EF4444", value: "vacation" },
  { label: "Disponible", color: "#AACC00", value: "available" },
];

/**
 * Componente UserCard - Muestra información de un usuario con estadísticas
 *
 * @param {UserCardProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente UserCard renderizado
 */
export const UserCard: React.FC<UserCardProps & { id: string }> = ({
  id,
  name,
  email,
  role,
  avatarSrc,
  avatarInitials,
  status,
  assignedCount,
  resolvedCount,
  onMenuClick,
  onStatusChange,
  className,
  pathActive = "profile",
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuClick?.();
  };

  const handleOptionClick = (value: string) => {
    onStatusChange?.(value);
    setIsMenuOpen(false);
  };
  return (
    <div className={classNames(styles.UserCard, className)}>
      {/* Header con Avatar y botón de menú */}
      <div className={styles.header}>
        <Link href={`/${pathActive}/${id}`} className={styles.avatarLink}>
          <Avatar
            src={avatarSrc}
            initials={avatarInitials}
            size="lg"
            status={status}
            className={styles.avatar}
          />
        </Link>
        <div className={styles.menuContainer} ref={menuRef}>
          <IconButton
            icon="ellipsis-vertical-solid"
            size={20}
            borderless
            onClick={handleMenuClick}
            className={styles.menuButton}
          />
          {isMenuOpen && (
            <div className={styles.dropdown}>
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  className={styles.dropdownItem}
                  onClick={() => handleOptionClick(option.value)}
                >
                  <span 
                    className={styles.statusDot}
                    style={{ backgroundColor: option.color }}
                  />
                  <span className={styles.optionLabel}>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
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
