import { IconName } from "../../atoms/Icon/types";

/**
 * - default: ícono grande, Confirmar (rojo) y Cancelar (contorno) centrados
 * - compact: sin ícono, Cancelar (rojo) y Confirmar (verde) alineados a la derecha
 */
export type ModalContentVariant = "default" | "compact";

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
    /**
     * Variante visual
     * @default "default"
     */
    variant?: ModalContentVariant;
    /**
     * Alineación del título y la descripción
     * @default "center"
     */
    align?: "center" | "left";
}
