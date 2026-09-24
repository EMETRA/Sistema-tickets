export type ChipVariant = "default" | "outlined";

export interface ChipProps {
    label: string;
    variant?: ChipVariant;
    color?: string;
    className?: string;
}
