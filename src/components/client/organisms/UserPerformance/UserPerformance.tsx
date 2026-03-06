import React from "react";
import classNames from "classnames";
import { TicketCard } from "../../molecules/TicketCard";
import { UserPerformanceProps } from "./types";
import styles from "./UserPerformance.module.scss";

export const UserPerformance: React.FC<UserPerformanceProps> = ({
    enteredTickets,
    solvedTickets,
    inProgressTickets,
    className,
}) => {
    return (
        <div className={classNames(styles.UserPerformance, className)}>

        <div className={styles.Content}>

            {/* Contenedor de Tarjetas */}
            <div className={styles.CardsContainer}>
                <TicketCard
                    type="entered"
                    label="Tickets Ingresados"
                    value={enteredTickets}
                />
                <TicketCard
                    type="solved"
                    label="Tickets Resueltos"
                    value={solvedTickets}
                />
                <TicketCard
                    type="in-progress"
                    label="Tickets En Proceso"
                    value={inProgressTickets}
                />
            </div>
        </div>
        </div>
    );
};

export default UserPerformance;