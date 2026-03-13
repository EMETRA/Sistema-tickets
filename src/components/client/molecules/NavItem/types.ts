import { IconName } from "../../atoms/Icon/types";

export interface NavItemProps {
    iconName: IconName;
    label: string;
    active?: boolean;
    onClick?: () => void;
    className?: string;
}