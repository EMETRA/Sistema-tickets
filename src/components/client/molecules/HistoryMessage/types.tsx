
export type HistoryAction =
    | "CREACION"
    | "ASIGNACION"
    | "TAGGED"
    | "EN_TRABAJO"
    | "CAMBIO_ESTADO"
    | "COMPLETADO";


export interface HistoryItem {
    user: string;
    ticketId: string;
    timestamp: string;
    action: HistoryAction;
    ticketStatus?: string;
    assignedTo?: string;
    tag?: string;
}

export interface HistoryMessageProps {
    ticketId: string;
    className?: string;
}