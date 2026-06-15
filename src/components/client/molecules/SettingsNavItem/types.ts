import { IconName } from "../../atoms/Icon/types";

export interface SettingsNavItemProps {
    iconName: IconName;
    label: string;
    active?: boolean;
    onClick?: () => void;
    className?: string;
}