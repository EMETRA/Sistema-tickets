import React from "react";

import { Icon } from "@/components/client/atoms/Icon";
import { Title } from "@/components/client/atoms/Title";
import { Text } from "@/components/client/atoms/Text";

import styles from "./HistoryMessage.module.scss";
import { HistoryMessageProps } from "./types";

const HistoryMessage: React.FC<HistoryMessageProps> = ({ historyItems, className }) => {
    const iconMap: Record<string, string> = {
        CREATED: "ticket-solid",
        ASSIGNED: "user-add",
        TAGGED: "tag",
        IN_PROGRESS: "in-progress",
        FINALIZED: "check-solid"
    };

    const iconBackgroundColorMap: Record<string, string> = {
        CREATED: "#A9DAFF",
        ASSIGNED: "#FFEFC8",
        TAGGED: "#D0F4DE",
        IN_PROGRESS: "#FFEFC8",
        FINALIZED: "#D0F4DE"
    };

    const iconColorMap: Record<string, string> = {
        CREATED: "#82BCE9",
        ASSIGNED: "#FFCD52",
        TAGGED: "#93EDB6",
        IN_PROGRESS: "#FFCD52",
        FINALIZED: "#93EDB6"
    };

    const actionText = (action: string) => {
        switch (action) {
        case "CREATED":
            return "ha creado el ticket";
        case "ASSIGNED":
            return `asignó el ticket`;
        case "TAGGED":
            return `ha asignado la etiqueta`;
        case "IN_PROGRESS":
            return "marcó como en progreso el ticket";
        case "FINALIZED":
            return "finalizó el ticket";
        default:
            return "";
        }
    };

    const timestampConverter = (timestamp: string) => {
        // Si la fecha es de hoy, colocar "Hoy, HH:mm"; ayera, colocar "Ayer, HH:mm"; si es de hace más de un día, colocar "Mes, DD, YYYY"
        const now = new Date();
        const messageDate = new Date(timestamp);
        const diffTime = now.getTime() - messageDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            return `Hoy, ${messageDate.getHours()}:${messageDate.getMinutes().toString().padStart(2, "0")}`;
        } else if (diffDays === 1) {
            return `Ayer, ${messageDate.getHours()}:${messageDate.getMinutes().toString().padStart(2, "0")}`;
        } else {
            return `${messageDate.toLocaleString("default", { month: "long" })} ${messageDate.getDate()}, ${messageDate.getFullYear()}`;
        }
    }

    const renderHistoryItemText = (item: HistoryMessageProps["historyItems"][0]) => {
        return (
            <div className={styles.textContainer}>
                <Text className={styles.user}>{item.user} </Text>
                <Text className={styles.action}>{actionText(item.action)} </Text>
                {item.tag && <Text className={styles.tag}><Text className={styles.tagName}>{item.tag}</Text> a el ticket</Text>}
                <Text className={styles.ticket}> #{item.ticketId}</Text>
                {item.ticketStatus && <Text className={styles.status}>, en estado de <Text className={styles.statusName}>{item.ticketStatus}</Text></Text>}
                {item.assignedTo && <Text className={styles.assignedTo}> a <Text className={styles.assignedToName}>{item.assignedTo}</Text></Text>}
            </div>
        );
    };

    return (
        <div className={`${styles.HistoryMessage} ${className}`}>
            <Title>Historial</Title>
            {historyItems.map((item, index) => (
                <div key={index} className={styles.historyItemContainer}>
                    <div key={index} className={styles.historyItem}>
                        <Icon name={iconMap[item.action]} backgroundColor={iconBackgroundColorMap[item.action]} color={iconColorMap[item.action]} variant="status" className={styles.icon} />
                        <div className={styles.content}>
                            {renderHistoryItemText(item)}
                            <Text variant="caption" className={styles.timestamp}>{timestampConverter(item.timestamp)}</Text>
                        </div>
                    </div>
                    {index < historyItems.length - 1 && <div className={styles.conector} /> }
                </div>
            ))}
        </div>
    );
};

export default HistoryMessage;
