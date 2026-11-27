import type { IconNameInput } from "../../atoms/Icon/types";

export interface TopBarProps {
    title: string;
    iconName: IconNameInput;
    userName: string;
    userRole: string;
    userAvatarUrl?: string;
    userStatus?: "online" | "offline";
    onSettingsClick?: () => void;
    onNotificationsClick?: () => void;
    onProfileClick?: () => void;
    className?: string;
    applications?: import("../../molecules/ApplicationSwitcher/ApplicationSwitcher").ApplicationLink[];
    createTicketPath?: string;
    /** Si existe, "Crear ticket" abre la ventana en lugar de navegar. */
    onCreateTicket?: () => void;
    /** Abre el buscador global en lugar del selector de aplicaciones. */
    onSearch?: () => void;
    settingsPath?: string;
    notificationsPath?: string;
    onMenuClick?: () => void;
    menuOpen?: boolean;
    unit?: string;
    profilePath?: string;
    onChangeView?: () => void;
}
