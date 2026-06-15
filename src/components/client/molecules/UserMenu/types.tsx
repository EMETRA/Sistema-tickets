export interface UserMenuProps {
    name: string;
    role: string;
    avatarUrl?: string;
    status?: "online" | "offline" | "busy";
    onMenuClick?: () => void;
    className?: string;
}