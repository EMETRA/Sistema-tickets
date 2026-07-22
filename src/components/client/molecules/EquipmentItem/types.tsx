import type { IconNameInput } from "../../atoms/Icon/types";

export interface EquipmentItemProps {
    iconName: IconNameInput;
    title: string;
    description: string;
    iconColor?: string;
    className?: string;
}
