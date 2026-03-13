import { IconName } from "../../atoms/Icon/types";

export interface InlineAlertProps {
    isOpen: boolean;
    onClose: () => void;
    onAction: () => void;
    title: string;
    description: string;
    actionLabel: string;
    iconName?: IconName;
    duration?: number; // Segundos para que se cierre sola
    className?: string;
}