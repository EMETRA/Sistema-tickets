import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InfoPanel } from "./InfoPanel";

const meta = {
    title: "Organisms/InfoPanel",
    component: InfoPanel,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
    argTypes: {
        type: {
            control: "select",
            options: ["team", "my-activity", "upcoming-events"],
            description: "Tipo de panel (determina el header y comportamiento)",
        },
        items: {
            description: "Array de eventos/movimientos a mostrar (máximo 10)",
        },
    },
} satisfies Meta<typeof InfoPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Panel tipo "Equipo - Últimos movimientos"
 */
export const Team: Story = {
    args: {
        type: "team",
        items: [
            {
                type: "movement",
                userName: "Gildder Alberto Caceres Urizar",
                avatarInitials: "G",
                label: { ticketId: 125, newState: "En Proceso" },
                date: new Date(),
            },
            {
                type: "movement",
                userName: "Gildder Alberto Caceres Urizar",
                avatarInitials: "G",
                label: { ticketId: 124, newState: "Resuelto" },
                date: new Date("2023-11-02"),
            },
            {
                type: "movement",
                userName: "Feyser Caceres",
                avatarInitials: "F",
                label: { ticketId: 10, newState: "En Proceso" },
                date: new Date("2023-11-01"),
            },
            {
                type: "movement",
                userName: "Feyser Caceres",
                avatarInitials: "F",
                label: { ticketId: 1, newState: "En Proceso" },
                date: new Date("2023-11-01"),
            },
        ],
    },
};

/**
 * Panel tipo "Mi actividad"
 */
export const MyActivity: Story = {
    args: {
        type: "my-activity",
        items: [
            {
                type: "movement",
                userName: "Gildder Alberto Caceres Urizar",
                avatarInitials: "G",
                label: "Problemas con fotocopiadora",
                date: new Date(),
            },
            {
                type: "movement",
                userName: "Gildder Alberto Caceres Urizar",
                avatarInitials: "G",
                label: "Problemas con remision",
                date: new Date("2023-11-02"),
            },
            {
                type: "movement",
                userName: "Gildder Alberto Caceres Urizar",
                avatarInitials: "G",
                label: "Problemas con remision",
                date: new Date("2023-11-01"),
            },
            {
                type: "movement",
                userName: "Gildder Alberto Caceres Urizar",
                avatarInitials: "G",
                label: "Problemas en revision",
                date: new Date("2023-11-01"),
            },
        ],
    },
};

/**
 * Panel tipo "Próximos eventos"
 */
export const UpcomingEvents: Story = {
    args: {
        type: "upcoming-events",
        items: [
            {
                type: "event",
                eventName: "Nombre evento",
                date: new Date("2026-03-10"),
                iconColor: "#262626",
                iconBackgroundColor: "#F5F5F5",
            },
            {
                type: "event",
                eventName: "Nombre evento",
                date: new Date("2026-03-10"),
                iconColor: "#262626",
                iconBackgroundColor: "#F5F5F5",
            },
            {
                type: "event",
                eventName: "Nombre evento",
                date: new Date("2026-03-10"),
                iconColor: "#262626",
                iconBackgroundColor: "#F5F5F5",
            },
            {
                type: "event",
                eventName: "Nombre evento",
                date: new Date("2026-03-10"),
                iconColor: "#262626",
                iconBackgroundColor: "#F5F5F5",
            },
        ],
    },
};

/**
 * Panel con más de 5 items (scrolleable)
 */
export const WithScrolling: Story = {
    args: {
        type: "my-activity",
        items: [
            {
                type: "movement",
                userName: "Usuario 1",
                avatarInitials: "U1",
                label: "Ticket #1 asignado",
                date: new Date(),
            },
            {
                type: "movement",
                userName: "Usuario 2",
                avatarInitials: "U2",
                label: "Ticket #2 en proceso",
                date: new Date(),
            },
            {
                type: "movement",
                userName: "Usuario 3",
                avatarInitials: "U3",
                label: "Ticket #3 resuelto",
                date: new Date(),
            },
            {
                type: "movement",
                userName: "Usuario 4",
                avatarInitials: "U4",
                label: "Ticket #4 en revisión",
                date: new Date(),
            },
            {
                type: "movement",
                userName: "Usuario 5",
                avatarInitials: "U5",
                label: "Ticket #5 asignado",
                date: new Date(),
            },
            {
                type: "movement",
                userName: "Usuario 6",
                avatarInitials: "U6",
                label: "Ticket #6 en proceso",
                date: new Date(),
            },
            {
                type: "movement",
                userName: "Usuario 7",
                avatarInitials: "U7",
                label: "Ticket #7 resuelto",
                date: new Date(),
            },
            {
                type: "movement",
                userName: "Usuario 8",
                avatarInitials: "U8",
                label: "Ticket #8 en revisión",
                date: new Date(),
            },
        ],
    },
};

/**
 * Panel de eventos con scroll
 */
export const EventsWithScrolling: Story = {
    args: {
        type: "upcoming-events",
        items: Array.from({ length: 8 }, (_, i) => ({
            type: "event" as const,
            eventName: `Evento ${i + 1}`,
            date: new Date(`2026-03-${10 + i}`),
            iconColor: "#262626",
            iconBackgroundColor: "#F5F5F5",
        })),
    },
};

/**
 * Panel con datos reales tipo equipo
 */
export const TeamRealData: Story = {
    args: {
        type: "team",
        items: [
            {
                type: "movement",
                userName: "Gildder Alberto Caceres Urizar",
                avatarInitials: "G",
                label: { ticketId: 125, newState: "En Proceso" },
                date: new Date(),
            },
            {
                type: "movement",
                userName: "Gildder Alberto Caceres Urizar",
                avatarInitials: "G",
                label: { ticketId: 124, newState: "Resuelto" },
                date: new Date("2023-11-02"),
            },
            {
                type: "movement",
                userName: "Feyser Caceres",
                avatarInitials: "F",
                label: { ticketId: 10, newState: "En Proceso" },
                date: new Date("2023-11-01"),
            },
            {
                type: "movement",
                userName: "Feyser Caceres",
                avatarInitials: "F",
                label: { ticketId: 1, newState: "En Proceso" },
                date: new Date("2023-11-01"),
            },
            {
                type: "movement",
                userName: "María González",
                avatarInitials: "MG",
                label: { ticketId: 98, newState: "Asignado" },
                date: new Date("2023-10-30"),
            },
            {
                type: "movement",
                userName: "Carlos Pérez",
                avatarInitials: "CP",
                label: { ticketId: 87, newState: "En Revisión" },
                date: new Date("2023-10-29"),
            },
        ],
    },
};
