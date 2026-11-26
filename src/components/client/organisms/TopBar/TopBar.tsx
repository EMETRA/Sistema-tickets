import { HrNotificationBadge } from "@/platform/hr-notifications";
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
    onCreateTicket,
    onSearch,
    settingsPath,
    notificationsPath,
    onMenuClick,
    menuOpen,
    unit,
    profilePath,
    onChangeView,
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
            {onSearch ? (
                <button type="button" className={styles.paletteTrigger} onClick={onSearch} data-tour="buscar">
                    <Icon name="magnifying-glass-solid" size={14} color="#7b8ba2" />
                    <span>Buscar aplicaciones, módulos, tickets…</span>
                    <kbd>⌘K</kbd>
                </button>
            ) : (
                <ApplicationSwitcher applications={applications} />
            )}
            {createTicketPath && (
                <Link
                    href={createTicketPath}
                    className={styles.createTicket}
                    data-tour="crear-ticket"
                    onClick={(event) => {
                        if (!onCreateTicket || event.metaKey || event.ctrlKey || event.shiftKey) return;
                        event.preventDefault();
                        onCreateTicket();
                    }}
                >
                    <Icon name="plus-solid" size={15} color="#fff" />
                    <span>Crear ticket</span>
                </Link>
            )}
            {settingsPath ? (
                <Link
                    href={settingsPath}
                    aria-label="Ajustes"
                    title="Ajustes"
                    className={styles.settings}
                    data-tour="ajustes"
                >
                    <Icon name="gear-solid" size={19} color="var(--tickets-text-secondary)" />
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
            {notificationsPath && <Link href={notificationsPath} className={styles.notification} data-tour="notificaciones" aria-label="Notificaciones" title="Actualizaciones de RRHH y seguimiento de tickets"><span style={{position:"relative",display:"inline-flex"}}><WorkspaceIcon name="bell-regular" size={21}/><HrNotificationBadge/></span></Link>}
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
                settingsPath={settingsPath}
                onChangeView={onChangeView}
            />
        </div>
    </header>
);
export default TopBar;
