import { LabelChipVariant } from "../../atoms/LabelChip";

export type LabelChipGroupRole = "USUARIO" | "TECNICO" | "ADMINISTRADOR" | "DESARROLLADOR";

export interface LabelOption {
    value: string;
    label: string;
    variant?: LabelChipVariant;
}

export interface LabelChipGroupProps {
    labels: LabelOption[];
    role: LabelChipGroupRole;
    availableOptions?: LabelOption[];
    onChange?: (labels: LabelOption[]) => void;
    className?: string;
}