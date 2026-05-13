export type ChipVariant = "default" | "outlined";
export type ChipState = "ingresado" | "asignado" | "en_trabajo" | "completado" | "cancelado";

export interface ChipProps {
    label: string;
    variant?: ChipVariant;
    state?: ChipState;
    className?: string;
}