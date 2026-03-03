export type ChipVariant = "default" | "outlined";
export type ChipState = "ingressed" | "assigned" | "inwork" | "resolved" | "canceled";

export interface ChipProps {
    label: string;
    variant?: ChipVariant;
    state?: ChipState;
    className?: string;
}