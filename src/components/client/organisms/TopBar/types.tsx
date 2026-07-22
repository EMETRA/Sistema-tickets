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
}
