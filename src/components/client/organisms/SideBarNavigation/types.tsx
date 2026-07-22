export interface NavConfigItem {
    iconName: string;
    label: string;
    path: string;
}

export interface SideBarNavigationProps {
    items: NavConfigItem[];
    activePath: string;
    onNavigate: (path: string) => void;
    logoIcon?: string;
    className?: string;
}
