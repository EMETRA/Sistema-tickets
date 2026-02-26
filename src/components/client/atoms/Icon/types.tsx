export type IconName = 
    | "file" 
    | "globe" 
    | "logo-emetra" 
    | "home" 
    | "users" 
    | "ticket" 
    | "settings" 
    | "bell" 
    | "logout";

export type IconVariant = "navigation" | "status" | "action";

export interface IconProps {
    name: IconName;
    variant?: IconVariant;
    size?: number;
    className?: string;
    active?: boolean;
}