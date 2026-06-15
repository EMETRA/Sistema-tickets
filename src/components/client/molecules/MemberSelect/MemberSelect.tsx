"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import classNames from "classnames";
import { Avatar } from "../../atoms/Avatar";
import { Text } from "../../atoms/Text";
import { MemberSelectProps } from "./types";
import styles from "./MemberSelect.module.scss";

/**
 * Componente MemberSelect - Select personalizado para seleccionar miembros de un equipo
 *
 * @param {MemberSelectProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente MemberSelect renderizado
 */
export const MemberSelect: React.FC<MemberSelectProps> = ({
    members,
    selectedId,
    onSelect,
    disabled = false,
    placeholder = "Seleccionar miembro",
    children,
    isOpen: isOpenProp,
    onOpenChange,
    className,
}) => {
    const [isOpenInternal, setIsOpenInternal] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Determinar si es controlado o no controlado
    const isControlled = isOpenProp !== undefined;
    const isOpen = isControlled ? isOpenProp : isOpenInternal;

    // Función para cambiar el estado
    const setIsOpen = useCallback(
        (newValue: boolean) => {
            if (!isControlled) {
                setIsOpenInternal(newValue);
            }
            onOpenChange?.(newValue);
        },
        [isControlled, onOpenChange]
    );

    // Encontrar el miembro seleccionado
    const selectedMember = members.find((member) => member.id === selectedId);

    // Cerrar el dropdown cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, setIsOpen]);

    const handleToggle = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
    };

    const handleSelect = (member: typeof members[0]) => {
    // Si el miembro clickeado ya está seleccionado, deseleccionar
        if (member.id === selectedId) {
            onSelect?.(undefined);
        } else {
            onSelect?.(member);
        }
        setIsOpen(false);
    };

    return (
        <div className={classNames(styles.MemberSelect, className)} ref={containerRef}>
            {/* Trigger personalizado o por defecto */}
            {children ? (
                <div onClick={handleToggle}>{children}</div>
            ) : (
                <button
                    type="button"
                    className={classNames(styles.trigger, { [styles.open]: isOpen })}
                    onClick={handleToggle}
                    disabled={disabled}
                >
                    {selectedMember ? (
                        <>
                            <Avatar
                                src={selectedMember.avatarSrc}
                                initials={selectedMember.initials}
                                size="sm"
                                className={styles.avatar}
                            />
                            <Text variant="body" className={styles.memberName}>
                                {selectedMember.name}
                            </Text>
                        </>
                    ) : (
                        <Text variant="muted" className={styles.placeholder}>
                            {placeholder}
                        </Text>
                    )}
                </button>
            )}

            {/* Dropdown con la lista de miembros */}
            {isOpen && (
                <div className={styles.dropdown}>
                    {members.map((member) => (
                        <button
                            key={member.id}
                            type="button"
                            className={classNames(styles.memberItem, {
                                [styles.selected]: member.id === selectedId,
                            })}
                            onClick={() => handleSelect(member)}
                        >
                            <Avatar
                                src={member.avatarSrc}
                                initials={member.initials}
                                size="sm"
                                className={styles.avatar}
                            />
                            <Text variant="body" className={styles.memberName}>
                                {member.name}
                            </Text>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MemberSelect;
