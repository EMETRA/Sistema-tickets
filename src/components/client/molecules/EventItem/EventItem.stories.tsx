import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EventItem } from "./EventItem";

const meta = {
    title: "Molecules/EventItem",
    component: EventItem,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof EventItem>;

export default meta;
type Story = StoryObj<typeof meta>;

// ===== MOVIMIENTOS (TIPO 1) =====

/**
 * Movimiento de ticket con label personalizado (muestra hora si es hoy)
 */
export const MovementTicketToday: Story = {
    args: {
        type: "movement",
        userName: "Gildder Alberto Caceres Urizar",
        avatarInitials: "G",
        label: {
            ticketId: 125,
            newState: "En Proceso",
        },
        date: new Date(), // Hoy, debería mostrar hora
    },
};

/**
 * Movimiento de ticket con fecha pasada
 */
export const MovementTicketPastDate: Story = {
    args: {
        type: "movement",
        userName: "Gildder Alberto Caceres Urizar",
        avatarInitials: "G",
        label: {
            ticketId: 124,
            newState: "Resuelto",
        },
        date: new Date("2023-11-02"), // Fecha pasada, debería mostrar fecha
    },
};

/**
 * Movimiento con avatar de imagen y label personalizado
 */
export const MovementWithImage: Story = {
    args: {
        type: "movement",
        userName: "María González",
        avatarSrc: "https://i.pravatar.cc/150?img=5",
        label: "Comentó en el ticket",
        date: new Date(),
    },
};

/**
 * Movimiento con estado "Ingresado"
 */
export const MovementIngresado: Story = {
    args: {
        type: "movement",
        userName: "Carlos Ramírez",
        avatarInitials: "CR",
        label: {
            ticketId: 130,
            newState: "Ingresado",
        },
        date: new Date(),
    },
};

/**
 * Movimiento con estado "Asignado"
 */
export const MovementAsignado: Story = {
    args: {
        type: "movement",
        userName: "Ana López",
        avatarInitials: "AL",
        label: {
            ticketId: 131,
            newState: "Asignado",
        },
        date: new Date("2024-03-01"),
    },
};

/**
 * Movimiento con estado "En Proceso"
 */
export const MovementEnProceso: Story = {
    args: {
        type: "movement",
        userName: "Pedro Martínez",
        avatarInitials: "PM",
        label: {
            ticketId: 132,
            newState: "En Proceso",
        },
        date: new Date(),
    },
};

/**
 * Movimiento con estado "En Revisión"
 */
export const MovementEnRevision: Story = {
    args: {
        type: "movement",
        userName: "Laura Sánchez",
        avatarInitials: "LS",
        label: {
            ticketId: 133,
            newState: "En Revisión",
        },
        date: new Date("2024-02-28"),
    },
};

// ===== EVENTOS (TIPO 2) =====

/**
 * Evento próximo (5 días)
 */
export const EventUpcoming: Story = {
    args: {
        type: "event",
        eventName: "Nombre evento",
        date: new Date("2023-11-18"), // 5 días en la fecha del diseño
    },
};

/**
 * Evento con colores personalizados
 */
export const EventCustomColors: Story = {
    args: {
        type: "event",
        eventName: "Reunión mensual",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En 7 días
        iconColor: "#E63946",
        iconBackgroundColor: "#FFE8E8",
    },
};

/**
 * Evento muy próximo (1 día)
 */
export const EventTomorrow: Story = {
    args: {
        type: "event",
        eventName: "Presentación de proyecto",
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Mañana
    },
};

/**
 * Evento lejano (30 días)
 */
export const EventFarAway: Story = {
    args: {
        type: "event",
        eventName: "Conferencia anual",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // En 30 días
    },
};

/**
 * Lista de varios eventos combinados
 */
export const EventList = {
    render: () => (
        <div style={{ width: "400px", border: "1px solid #E5E5E5", borderRadius: "8px" }}>
            <EventItem
                type="movement"
                userName="Gildder Alberto Caceres Urizar"
                avatarInitials="G"
                label={{ ticketId: 125, newState: "En Proceso" }}
                date={new Date()}
            />
            <EventItem
                type="movement"
                userName="Gildder Alberto Caceres Urizar"
                avatarInitials="G"
                label={{ ticketId: 124, newState: "Resuelto" }}
                date={new Date("2023-11-02")}
            />
            <EventItem
                type="event"
                eventName="Nombre evento"
                date={new Date("2023-11-18")}
            />
        </div>
    ),
};
