
export type HistoryAction =
    | "CREATED"
    | "ASSIGNED"
    | "TAGGED"
    | "IN_PROGRESS"
    | "FINALIZED";


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
    historyItems: HistoryItem[];
    className?: string;
}