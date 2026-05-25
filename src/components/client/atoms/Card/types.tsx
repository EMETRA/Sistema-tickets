
export interface CardProps {
    title: string;
    value: string;
    variant?: "default" | "info" | "centered" | "kpi";
    description?: string;
    actions?: React.ReactNode;
    className?: string;
}