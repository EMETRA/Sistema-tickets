export type ChipVariant = "default" | "outlined";
export type ChipState = "ingresado" | "creado" | "sin_asignar" | "asignado" | "en_trabajo" | "en_atencion" | "completado" | "resuelto" | "cancelado";

export interface TicketStateChipProps {
    label: string;
    variant?: ChipVariant;
    state?: ChipState;
    className?: string;
}
