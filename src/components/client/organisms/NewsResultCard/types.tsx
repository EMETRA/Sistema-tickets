export type NewsResultStatus = "success" | "error";

export interface NewsResultAction {
    label: string;
    onClick: () => void;
}

/**
 * Props del componente NewsResultCard
 */
export interface NewsResultCardProps {
    status: NewsResultStatus;

    title: string;

    description: string;

    /**
     * Pill de aviso (p. ej. "Notificación pendiente de envío")
     */
    badge?: string;

    /**
     * Texto debajo del pill
     */
    note?: string;

    /**
     * Nota de referencia del error (texto provisional mientras backend no lo defina)
     */
    reference?: string;

    primaryAction: NewsResultAction;

    secondaryAction?: NewsResultAction;

    className?: string;
}
