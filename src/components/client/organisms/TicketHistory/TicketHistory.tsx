import classNames from "classnames";
import { LabelChipGroup } from "@/components/client/molecules/LabelChipGroup";
import { HistoryMessage } from "@/components/client/molecules/HistoryMessage";
import type { TicketHistoryProps } from "./types";
import styles from "./TicketHistory.module.scss";

export const TicketHistory = ({
    // ticketId,
    role,
    labels,
    availableOptions = [],
    historyItems,
    onLabelsChange,
    className,
}: TicketHistoryProps) => {
    return (
        <div className={classNames(styles.container, className)}>
            <LabelChipGroup
                role={role}
                labels={labels}
                availableOptions={availableOptions}
                onChange={onLabelsChange}
            />

            <HistoryMessage
                historyItems={historyItems}
            />
        </div>
    );
};

export default TicketHistory;