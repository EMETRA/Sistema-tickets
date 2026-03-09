export interface TopBarProps {
    title: string;
    iconName: string;
    userName: string;
    userRole: string;
    userAvatarUrl?: string;
    userStatus?: "online" | "offline";
    onSettingsClick?: () => void;
    onNotificationsClick?: () => void;
    onProfileClick?: () => void;
    className?: string;
}