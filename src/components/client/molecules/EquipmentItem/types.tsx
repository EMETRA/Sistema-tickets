import { IconName } from "../../atoms/Icon/types";

export interface EquipmentItemProps {
    iconName: IconName;
    title: string;
    description: string;
    iconColor?: string;
    className?: string;
}