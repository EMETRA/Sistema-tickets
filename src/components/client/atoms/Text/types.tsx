import { ReactNode } from "react";
export type TextVariant = "body" | "muted" | "caption" | "overline" | "navLabel";
export interface TextProps {
    children: ReactNode;
    variant?: TextVariant;
    className?: string;
}