import React, { useState } from "react";
import { displayDate } from "../../organisms/ResourceWorkspace/RecordDetail";

import { Icon } from "@/components/client/atoms/Icon";
import { Title } from "@/components/client/atoms/Title";
import { Text } from "@/components/client/atoms/Text";

import { useGetTicketHistory } from "@/api/hooks";

import styles from "./HistoryMessage.module.scss";
import { HistoryMessageProps } from "./types";
import type { TicketHistorial } from "@/api/graphql";

const HistoryMessage: React.FC<HistoryMessageProps> = ({ ticketId, className, variant = "timeline", actorNames = {} }) => {
    const [query, setQuery] = useState("");
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

    const { data: historyItems, loading: isHistoryLoading, error, refetch } = useGetTicketHistory(ticketId);

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
                {item.tag && <div className={styles.tag}><Text className={styles.tagName}>{item.tag}</Text> a el ticket</div>}
                <Text className={styles.ticket}> #{item.ticketId}</Text>
                {item.status && <div className={styles.status}>, en estado de <Text className={styles.statusName}>{item.status}</Text></div>}
                {item.asignado_a && <div className={styles.assignedTo}> a <Text className={styles.assignedToName}>{item.asignado_a}</Text></div>}
            </div>
        );
    };

    if (variant === "table") {
        const actions: Record<string, string> = { CREACION: "Creado", ASIGNACION: "Asignado", TAGGED: "Etiquetado", EN_TRABAJO: "En trabajo", CAMBIO_ESTADO: "Cambio de estado", COMPLETADO: "Completado", CANCELACION: "Cancelado" };
        const rows = historyItems.filter(item => [actions[item.accion] || item.accion, actorNames[item.usuarioId] || String(item.usuarioId), item.valorAnterior, item.valorNuevo, item.asignado_a, item.status, item.tag].join(" ").toLocaleLowerCase("es").includes(query.trim().toLocaleLowerCase("es")));
        return <section className={styles.tableView} aria-label="Historial del ticket">
            <div className={styles.toolbar}><input type="search" aria-label="Buscar en el historial" placeholder="Buscar en el historial" value={query} onChange={event => setQuery(event.target.value)} /><button onClick={() => void refetch()} disabled={isHistoryLoading}>Actualizar historial</button></div>
            {error && <p role="alert" className={styles.error}>No se pudo consultar el historial. Reintenta la consulta.</p>}
            {isHistoryLoading && <p role="status">Cargando historial…</p>}
            <div className={styles.tableRegion}><table><thead><tr><th>Fecha</th><th>Actor</th><th>Acción</th><th>Detalle</th></tr></thead><tbody>{rows.map(item => <tr key={item.id}><td>{displayDate(item.fecha)}</td><td>{actorNames[item.usuarioId] || `Usuario #${item.usuarioId}`}</td><td>{actions[item.accion] || item.accion.replaceAll("_", " ")}</td><td>{item.asignado_a || item.status || item.tag || (item.valorAnterior || item.valorNuevo ? `${item.valorAnterior || "—"} → ${item.valorNuevo || "—"}` : "—")}</td></tr>)}</tbody></table></div>
            {!isHistoryLoading && !error && !rows.length && <p className={styles.empty}>{query ? "No hay coincidencias en el historial." : "No hay movimientos registrados para este ticket."}</p>}
            <p className={styles.count}>{rows.length} movimientos · Se conserva la trazabilidad de cada actuación.</p>
        </section>;
    }
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
