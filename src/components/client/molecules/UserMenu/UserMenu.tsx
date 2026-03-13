import React from "react";
import { UserMenuProps } from "./types";
import { Avatar } from "../../atoms/Avatar";
import { Text } from "../../atoms/Text";
import { IconButton } from "../../atoms/IconButton"; // Asumiendo que esta es la ruta
import styles from "./UserMenu.module.scss";
import classNames from "classnames";

export const UserMenu = ({
    name,
    role,
    avatarUrl,
    status,
    onMenuClick,
    className
}: UserMenuProps) => {
    return (
        <div className={classNames(styles.userMenu, className)}>
            <Avatar 
                src={avatarUrl} 
                initials={name.charAt(0)}
                status={status}
                ringed={status ? true : false}
                size="sm"
            />
            
            <div className={styles.info}>
                <Text variant="body" className={styles.name}>
                    {name}
                </Text>
                <Text variant="caption" className={styles.role}>
                    {role}
                </Text>
            </div>

            <IconButton 
                icon="angle-down-solid"
                borderless 
                onClick={onMenuClick}
                size={20}
            />
        </div>
    );
};