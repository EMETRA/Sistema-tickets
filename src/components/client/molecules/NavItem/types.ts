import type { IconNameInput } from "../../atoms/Icon/types";

export interface NavItemProps {
    iconName: IconNameInput;
    label: string;
    active?: boolean;
    onClick?: () => void;
    className?: string;
}
