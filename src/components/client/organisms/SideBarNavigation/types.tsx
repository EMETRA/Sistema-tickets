import type { IconNameInput } from "@/components/client/atoms/Icon/types";

export interface NavConfigItem {
    iconName: IconNameInput;
    label: string;
    path: string;
}

export interface SideBarNavigationProps {
    items: NavConfigItem[];
    activePath: string;
    onNavigate: (path: string) => void;
    /** Ícono del botón superior (logo). Dentro de una app suele ser "house-solid". */
    logoIcon?: IconNameInput;
    className?: string;
}
