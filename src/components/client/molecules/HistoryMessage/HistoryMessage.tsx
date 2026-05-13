import React from "react";

import { Icon } from "@/components/client/atoms/Icon";
import { Title } from "@/components/client/atoms/Title";
import { Text } from "@/components/client/atoms/Text";

import { useGetTicketHistory } from "@/api/hooks";

import styles from "./HistoryMessage.module.scss";
import { HistoryMessageProps } from "./types";
import type { TicketHistorial } from "@/api/graphql";

const HistoryMessage: React.FC<HistoryMessageProps> = ({ ticketId, className }) => {
    const iconMap: Record<string, string> = {
        CREACION: "ticket-solid",
        ASIGNACION: "user-add",
        TAGGED: "tag",
        EN_TRABAJO: "in-progress",
        CAMBIO_ESTADO: "hourglass-half-solid",
        COMPLETADO: "check-solid"
    };

    const iconBackgroundColorMap: Record<string, string> = {
        CREACION: "#A9DAFF",
        ASIGNACION: "#FFEFC8",
        TAGGED: "#D0F4DE",
        EN_TRABAJO: "#FFEFC8",
        CAMBIO_ESTADO: "#FCAB64",
        COMPLETADO: "#D0F4DE"
    };

    const iconColorMap: Record<string, string> = {
        CREACION: "#82BCE9",
        ASIGNACION: "#FFCD52",
        TAGGED: "#93EDB6",
        EN_TRABAJO: "#FFCD52",
        CAMBIO_ESTADO: "#FCD29F",
        COMPLETADO: "#93EDB6"
    };

    const { data: historyItems, loading: isHistoryLoading } = useGetTicketHistory(ticketId);

    const actionText = (action: string) => {
        switch (action) {
        case "CREACION":
            return "ha creado el ticket";
        case "ASIGNACION":
            return `asignó el ticket`;
        case "TAGGED":
            return `ha asignado la etiqueta`;
        case "EN_TRABAJO":
            return "marcó como en progreso el ticket";
        case "CAMBIO_ESTADO":
            return "cambió el estado del ticket";
        case "COMPLETADO":
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

    const renderHistoryItemText = (item: TicketHistorial) => {
        return (
            <div className={styles.textContainer}>
                <Text className={styles.user}>{item.usuarioId} </Text>
                <Text className={styles.action}>{actionText(item.accion)} </Text>
                {item.tag && <Text className={styles.tag}><Text className={styles.tagName}>{item.tag}</Text> a el ticket</Text>}
                <Text className={styles.ticket}> #{item.ticketId}</Text>
                {item.status && <Text className={styles.status}>, en estado de <Text className={styles.statusName}>{item.status}</Text></Text>}
                {item.asignado_a && <Text className={styles.assignedTo}> a <Text className={styles.assignedToName}>{item.asignado_a}</Text></Text>}
            </div>
        );
    };

    return (
        <div className={`${styles.HistoryMessage} ${className}`}>
            <Title>Historial</Title>
            {isHistoryLoading ? (
                <p>Cargando historial...</p>
            ) : historyItems.length === 0 ? (
                <p>No hay historial disponible para este ticket.</p>
            ) : (
                historyItems.map((item, index) => (
                    <div key={index} className={styles.historyItemContainer}>
                        <div key={index} className={styles.historyItem}>
                            <Icon name={iconMap[item.accion] || "file"} backgroundColor={iconBackgroundColorMap[item.accion]} color={iconColorMap[item.accion]} variant="status" className={styles.icon} />
                            <div className={styles.content}>
                                {renderHistoryItemText(item)}
                                <Text variant="caption" className={styles.timestamp}>{timestampConverter(item.fecha)}</Text>
                            </div>
                        </div>
                        {index < historyItems.length - 1 && <div className={styles.conector} /> }
                    </div>
                )))}
        </div>
    );
};

export default HistoryMessage;
