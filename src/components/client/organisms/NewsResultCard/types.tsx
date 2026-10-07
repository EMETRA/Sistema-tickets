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
     * Referencia del error para soporte (p. ej. "Código de referencia: 403")
     */
    reference?: string;

    primaryAction: NewsResultAction;

    secondaryAction?: NewsResultAction;

    className?: string;
}
