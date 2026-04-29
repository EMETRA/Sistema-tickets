export type IconName = 
    | "file" | "globe" | "logo-emetra" | "home" 
    | "users" | "ticket" | "settings" | "bell" | "logout" | string;

export type IconVariant = "navigation" | "status" | "action";

export interface IconProps {
    name: IconName;
    variant?: IconVariant;
    size?: number;
    className?: string;
    active?: boolean;
    color?: string; 
    backgroundColor?: string;
    raw?: boolean;
}