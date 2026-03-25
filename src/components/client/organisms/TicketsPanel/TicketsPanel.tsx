"use client";

import React from "react";
import classNames from "classnames";
import { Title } from "../../atoms/Title";
import { Text } from "../../atoms/Text";
import { Chip } from "../../atoms/Chip";
import { TableHeader } from "../../molecules/TableHeader";
import { TableRow } from "../../molecules/TableRow";
import { AssignedChip } from "../../molecules/AssignedChip";
import { TicketsPanelProps } from "./types";
import styles from "./TicketsPanel.module.scss";

/**
 * Formatea una fecha a formato dd/mm/yyyy
 */
const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

/**
 * Componente TicketsPanel - Panel de tickets con dos variantes
 *
 * @param {TicketsPanelProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente TicketsPanel renderizado
 */
export const TicketsPanel: React.FC<TicketsPanelProps> = ({
    variant,
    tickets,
    className,
}) => {
    // Limitar a máximo 10 tickets
    const limitedTickets = tickets.slice(0, 10);

    if (tickets.length === 0) {
        return (
            <div className={classNames(styles.TicketTable, className)}>
                {variant === "my-tickets" ? (
                    <Title variant="mid" tag="h2" className={styles.title}>
                        Mis últimos tickets
                    </Title>
                ) : (
                    <TableHeader iconName="ticket-solid" label="Últimos tickets" />
                )}
                <Text variant="caption" className={styles.noTicketsText}>
                    No hay tickets para mostrar.
                </Text>
            </div>
        );
    }

    // Renderizar variante "my-tickets"
    if (variant === "my-tickets") {
        return (
            <div className={classNames(styles.TicketTable, className)}>
                <Title variant="mid" tag="h2" className={styles.title}>
                    Mis últimos tickets
                </Title>

                <div className={styles.tableContainer}>
                    <TableRow
                        cells={[
                            { label: "Usuario", align: "center" },
                            { label: "Tipo", align: "center" },
                            { label: "Status", align: "center" },
                            { label: "Ticket", align: "left" },
                            { label: "Fecha de Ingreso", align: "center" },
                            { label: "Fecha Asignación", align: "center" },
                        ]}
                        isHeader={true}
                        gridTemplate="1.5fr 1fr 1fr 2fr 1.2fr 1.2fr"
                        className={styles.headerRow}
                    />

                    <div className={styles.rowsContainer}>
                        {limitedTickets.map((ticket) => (
                            <TableRow
                                key={ticket.id}
                                cells={[
                                    {
                                        content: (
                                            <AssignedChip
                                                assigned={ticket.assigned}
                                                userName={ticket.userName}
                                                avatarSrc={ticket.avatarSrc}
                                                avatarInitials={ticket.avatarInitials}
                                            />
                                        ),
                                        align: "left",
                                    },
                                    {
                                        content: <Text variant="body">{ticket.type}</Text>,
                                        align: "left",
                                    },
                                    {
                                        content: (
                                            <Chip state={ticket.status} label={ticket.statusLabel} />
                                        ),
                                        align: "left",
                                    },
                                    {
                                        content: (
                                            <Text variant="body">
                                                #{ticket.id} - {ticket.description}
                                            </Text>
                                        ),
                                        align: "left",
                                    },
                                    {
                                        content: (
                                            <Text variant="body">{formatDate(ticket.dateIngress)}</Text>
                                        ),
                                        align: "center",
                                    },
                                    {
                                        content: (
                                            <Text variant="body">
                                                {ticket.dateAssigned
                                                    ? formatDate(ticket.dateAssigned)
                                                    : "-"}
                                            </Text>
                                        ),
                                        align: "center",
                                    },
                                ]}
                                gridTemplate="1.5fr 1fr 1fr 2fr 1.2fr 1.2fr"
                                className={styles.dataRow}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Renderizar variante "recent-tickets"
    return (
        <div className={classNames(styles.TicketTable, className)}>
            <TableHeader iconName="ticket-solid" label="Últimos tickets" />

            <div className={styles.tableContainer}>
                <TableRow
                    cells={[
                        { label: "Ticket", align: "left" },
                        { label: "Usuario", align: "left" },
                        { label: "Problema", align: "left" },
                        { label: "Tipo Problema", align: "left" },
                        { label: "Fecha", align: "left" },
                        { label: "Status", align: "left" },
                    ]}
                    isHeader={true}
                    gridTemplate="0.8fr 1.5fr 2fr 1.2fr 1fr 1fr"
                    className={styles.headerRow}
                />

                <div className={styles.rowsContainer}>
                    {limitedTickets.map((ticket) => (
                        <TableRow
                            key={ticket.id}
                            cells={[
                                {
                                    content: <Text variant="body">#{ticket.id}</Text>,
                                    align: "left",
                                },
                                {
                                    content: <Text variant="body">{ticket.userName}</Text>,
                                    align: "left",
                                },
                                {
                                    content: <Text variant="body">{ticket.description}</Text>,
                                    align: "left",
                                },
                                {
                                    content: <Text variant="body">{ticket.type}</Text>,
                                    align: "left",
                                },
                                {
                                    content: (
                                        <Text variant="body">{formatDate(ticket.dateIngress)}</Text>
                                    ),
                                    align: "left",
                                },
                                {
                                    content: (
                                        <Chip state={ticket.status} label={ticket.statusLabel} />
                                    ),
                                    align: "left",
                                },
                            ]}
                            gridTemplate="0.8fr 1.5fr 2fr 1.2fr 1fr 1fr"
                            className={styles.dataRow}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TicketsPanel;
