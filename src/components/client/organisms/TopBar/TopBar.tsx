import React from "react";
import { TopBarProps } from "./types";
import { TableHeader } from "../../molecules/TableHeader";
import { UserMenu } from "../../molecules/UserMenu";
import { IconButton } from "../../atoms/IconButton";
import styles from "./TopBar.module.scss";
import classNames from "classnames";

export const TopBar = ({
    title,
    iconName,
    userName,
    userRole,
    userAvatarUrl,
    userStatus,
    onSettingsClick,
    onNotificationsClick,
    onProfileClick,
    className
}: TopBarProps) => {
    return (
        <header className={classNames(styles.topBar, className)}>
            <div className={styles.pageContext}>
                <TableHeader 
                    iconName={iconName} 
                    label={title} 
                    className={styles.header}
                />
            </div>

            <div className={styles.globalActions}>
                <div className={styles.buttonGroup}>
                    <IconButton 
                        icon="gear-solid" 
                        borderless 
                        onClick={onSettingsClick}
                        size={20}
                        iconColor="#000000"
                    />
                    <IconButton 
                        icon="bell-regular" 
                        borderless 
                        onClick={onNotificationsClick}
                        size={20}
                        iconColor="#000000"
                    />
                </div>
                
                <UserMenu 
                    name={userName}
                    role={userRole}
                    avatarUrl={userAvatarUrl}
                    status={userStatus}
                    onMenuClick={onProfileClick}
                />
            </div>
        </header>
    );
};

export default TopBar;