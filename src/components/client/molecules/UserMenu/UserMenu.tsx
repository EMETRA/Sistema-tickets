import React, { useState, useRef, useEffect } from "react";
import { UserMenuProps } from "./types";
import { Avatar } from "../../atoms/Avatar";
import { Text } from "../../atoms/Text";
import { IconButton } from "../../atoms/IconButton";
import { useAuthStore } from "@/store/useAuthStore";
import styles from "./UserMenu.module.scss";
import classNames from "classnames";

export const UserMenu = ({
    name,
    role,
    avatarUrl,
    status,
    className
}: UserMenuProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const logout = useAuthStore((state) => state.logout);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={classNames(styles.userMenu, className)} ref={menuRef}>
            <Avatar 
                src={avatarUrl} 
                initials={name.charAt(0)}
                status={status}
                ringed={status ? true : false}
                size="sm"
            />
            
            <div className={styles.info}>
                <Text variant="body" className={styles.name}>{name}</Text>
                <Text variant="caption" className={styles.role}>{role}</Text>
            </div>

            <div className={styles.menuWrapper}>
                <IconButton 
                    icon="angle-down-solid"
                    borderless 
                    onClick={() => {
                        console.log("clicked, isMenuOpen:", isMenuOpen);
                        setIsMenuOpen((prev) => !prev);
                    }}
                    size={20}
                    iconColor="#000000"
                    className={classNames(styles.chevron, { [styles.chevronOpen]: isMenuOpen })}
                />
                {isMenuOpen && (
                    <ul className={styles.menu}>
                        <li 
                            className={styles.menuItem} 
                            onClick={(e) => {
                                e.stopPropagation();
                                logout();
                            }}
                        >
                            <Text>Cerrar sesión</Text>
                        </li>
                    </ul>
                )}
            </div>
        </div>
    );
};