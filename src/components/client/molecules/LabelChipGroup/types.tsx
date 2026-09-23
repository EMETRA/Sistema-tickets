export type LabelChipGroupRole = "USUARIO" | "TECNICO" | "ADMINISTRADOR" | "DESARROLLADOR";

export interface LabelOption {
    value: string;
    label: string;
    color?: string;
    backgroundColor?: string;
}

export interface LabelChipGroupProps {
    labels: LabelOption[];
    role?: LabelChipGroupRole;
    /**
     * Fuerza si se puede editar, sin depender del rol.
     * Si no se envía, la edición depende de `role`.
     */
    editable?: boolean;
    availableOptions?: LabelOption[];
    onChange?: (labels: LabelOption[]) => void;
    className?: string;
}