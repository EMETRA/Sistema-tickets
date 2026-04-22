import type { LabelOption, LabelChipGroupRole } from "@/components/client/molecules/LabelChipGroup/types";
import type { HistoryItem } from "@/components/client/molecules/HistoryMessage/types";

export type { LabelOption, LabelChipGroupRole, HistoryItem };

export interface TicketHistoryProps {
    ticketId: string;
    role: LabelChipGroupRole;
    labels: LabelOption[];
    availableOptions?: LabelOption[];
    historyItems: HistoryItem[];
    onLabelsChange?: (labels: LabelOption[]) => void;
    className?: string;
}