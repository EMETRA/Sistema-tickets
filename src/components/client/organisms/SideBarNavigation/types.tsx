export type UserRole = "admin" | "tech" | "user";

export interface NavConfigItem {
    iconName: string;
    label: string;
    path: string;
}

export interface SideBarNavigationProps {
    role: UserRole;
    activePath: string;
    onNavigate: (path: string) => void;
    className?: string;
}

export const MENU_CONFIG: Record<UserRole, NavConfigItem[]> = {
    admin: [
        { iconName: "house-solid", label: "INICIO", path: "/home" },
        { iconName: "people-group-solid", label: "EQUIPO", path: "/equip" },
        { iconName: "user-solid", label: "USUARIOS", path: "/profile" },
        { iconName: "clipboard-list-solid", label: "TICKETS", path: "/tickets" },
        { iconName: "network-wired-solid", label: "CONFIG", path: "/config" },
        { iconName: "ticket-solid", label: "MIS TICKETS", path: "/mis-tickets" },
        { iconName: "clock-rotate-left-solid", label: "HISTORIAL", path: "/historial" },
        { iconName: "person-chalkboard-solid", label: "PLANIFICA", path: "/planifica" },
        { iconName: "chart-pie-solid", label: "REPORTES", path: "/reportes" },
        { iconName: "chart-bar-regular", label: "ESTADISTICA", path: "/estadistica" },
    ],
    tech: [
        { iconName: "house-solid", label: "INICIO", path: "/" },
        { iconName: "ticket-solid", label: "MIS TICKETS", path: "/mis-tickets" },
        { iconName: "person-chalkboard-solid", label: "PLANIFICA", path: "/planifica" },
        { iconName: "user-solid", label: "EQUIPO", path: "/equipo" },
        { iconName: "user-solid", label: "USUARIOS", path: "/usuarios" },
        { iconName: "clock-rotate-left-solid", label: "HISTORIAL", path: "/historial" },
    ],
    user: [
        { iconName: "house-solid", label: "INICIO", path: "/" },
        { iconName: "file-circle-plus-solid", label: "CREAR TICKET", path: "/crear" },
        { iconName: "clock-rotate-left-solid", label: "HISTORIAL", path: "/historial" },
        { iconName: "user-solid", label: "USUARIOS", path: "/usuarios" },
        { iconName: "chart-pie-solid", label: "REPORTES", path: "/reportes" },
    ]
};