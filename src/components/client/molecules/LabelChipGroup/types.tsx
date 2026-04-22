import { LabelChipVariant } from "../../atoms/LabelChip";

export type LabelChipGroupRole = "user" | "tech" | "admin";

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