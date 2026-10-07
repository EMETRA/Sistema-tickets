import { ButtonColor } from "@/components/client/atoms/Button/types";

export interface PopUpProps {
    isOpen: boolean;
    variant?: 'default' | 'success' | 'warning' | 'error';
    title: string;
    description: string;
    actions?: {
        text: string;
        color: ButtonColor;
        onClick: () => void;
    }[];
    onClose: () => void;
}
