export type LabelChipVariant = "default" | "bug" | "maintenance" | "feature" | "urgent";

export interface LabelChipProps {
    label: string;
    color?: string;
    backgroundColor?: string;
    onRemove?: (label: string) => void;
    className?: string;
}