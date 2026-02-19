import { ReactNode } from "react";
export type TitleVariant = "xlarge" | "large" | "mid";
export interface TitleProps {
    children: ReactNode;
    variant?: TitleVariant;
    tag?: "h1" | "h2" | "h3" | "h4";
    className?: string;
}