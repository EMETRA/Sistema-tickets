export type LabelChipVariant = "default" | "bug" | "maintenance" | "feature" | "urgent";

export interface LabelChipProps {
    label: string;
    variant?: LabelChipVariant;
    onRemove?: (label: string) => void;
    className?: string;
    color?: string;
    backgroundColor?: string;
}