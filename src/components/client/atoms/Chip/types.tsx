export type ChipVariant = "default" | "outlined";
export type ChipState = "active" | "inactive" | "warning" | "success";

export interface ChipProps {
    label: string;
    variant?: ChipVariant;
    state?: ChipState;
    className?: string;
}