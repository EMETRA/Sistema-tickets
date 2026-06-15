export type LabelChipGroupRole = "USUARIO" | "TECNICO" | "ADMINISTRADOR" | "DESARROLLADOR";

export interface LabelOption {
    value: string;
    label: string;
    color?: string;
    backgroundColor?: string;
}

export interface LabelChipGroupProps {
    labels: LabelOption[];
    role: LabelChipGroupRole;
    availableOptions?: LabelOption[];
    onChange?: (labels: LabelOption[]) => void;
    className?: string;
}