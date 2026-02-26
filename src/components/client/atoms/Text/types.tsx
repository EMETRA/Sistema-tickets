import { ReactNode } from "react";
export type TextVariant = "body" | "muted" | "caption" | "overline";
export interface TextProps {
    children: ReactNode;
    variant?: TextVariant;
    className?: string;
}