import { IconName } from "../../atoms/Icon/types";

export interface ModalContentProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    iconName?: IconName;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
}