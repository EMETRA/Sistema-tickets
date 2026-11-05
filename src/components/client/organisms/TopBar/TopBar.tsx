import React from "react";
import Link from "next/link";
import { TopBarProps } from "./types";
import { UserMenu } from "../../molecules/UserMenu";
import { ApplicationSwitcher } from "../../molecules/ApplicationSwitcher/ApplicationSwitcher";
import { Icon } from "../../atoms/Icon";
import { WorkspaceIcon } from "../../atoms/WorkspaceIcon/WorkspaceIcon";
import { IconButton } from "../../atoms/IconButton";
import styles from "./TopBar.module.scss";
import classNames from "classnames";

export const TopBar = ({
    title,
    userName,
    userRole,
    userAvatarUrl,
    userStatus,
    onSettingsClick,
    onNotificationsClick,
    onProfileClick,
    className,
    applications = [],
    createTicketPath,
    settingsPath,
    notificationsPath,
    onMenuClick,
    menuOpen,
    unit,
    profilePath,
}: TopBarProps) => (
    <header className={classNames(styles.topBar, className)}>
        <div className={styles.pageContext}>
            {onMenuClick && (
                <button
                    type="button"
                    className={styles.menuButton}
                    aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                    aria-expanded={Boolean(menuOpen)}
                    aria-controls="system-navigation"
                    onClick={onMenuClick}
                >
                    <Icon name="bars-solid" size={22} color="#263b58" />
                </button>
            )}
            <div className={styles.heading}>
                <strong>{title}</strong>
                {unit && <span>{unit}</span>}
            </div>
        </div>
        <div className={styles.globalActions}>
            <ApplicationSwitcher applications={applications} />
            {createTicketPath && (
                <Link href={createTicketPath} className={styles.createTicket}>
                    <Icon name="plus-solid" size={15} color="#fff" />
                    <span>Crear ticket</span>
                </Link>
            )}
            {settingsPath ? (
                <Link
                    href={settingsPath}
                    aria-label="Configuración"
                    className={styles.settings}
                >
                    <Icon name="gear-solid" size={19} color="#61728b" />
                </Link>
            ) : (
                onSettingsClick && (
                    <IconButton
                        icon="gear-solid"
                        onClick={onSettingsClick}
                        borderless
                        aria-label="Configuración"
                    />
                )
            )}
            {notificationsPath && <Link href={notificationsPath} className={styles.notification} aria-label="Seguimiento de mis tickets" title="Respuestas y actualizaciones de mis tickets"><WorkspaceIcon name="bell-regular" size={21}/></Link>}
            {!notificationsPath && onNotificationsClick && (
                <IconButton
                    icon="bell-regular"
                    onClick={onNotificationsClick}
                    borderless
                    aria-label="Notificaciones"
                />
            )}
            <UserMenu
                name={userName}
                role={userRole}
                avatarUrl={userAvatarUrl}
                status={userStatus}
                onMenuClick={onProfileClick}
                profilePath={profilePath}
            />
        </div>
    </header>
);
export default TopBar;
