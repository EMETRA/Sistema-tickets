import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TicketsPanel } from "./TicketsPanel";
import { TicketData } from "./types";

// Datos de ejemplo
const sampleTickets: TicketData[] = [
    {
        id: 125,
        description: "Problemas con fotocopiadora",
        userName: "Gildder Alberto Caceres Urizar",
        avatarInitials: "G",
        assigned: true,
        type: "Urgente",
        status: "inwork",
        statusLabel: "En Trabajo",
        dateIngress: new Date("2024-01-15"),
        dateAssigned: new Date("2024-01-16"),
    },
    {
        id: 124,
        description: "Problemas con remision",
        userName: "María González López",
        avatarInitials: "MG",
        assigned: true,
        type: "Normal",
        status: "resolved",
        statusLabel: "Resuelto",
        dateIngress: new Date("2024-01-14"),
        dateAssigned: new Date("2024-01-15"),
    },
    {
        id: 123,
        description: "Sistema lento",
        userName: "Carlos Ramírez",
        avatarInitials: "CR",
        assigned: true,
        type: "Hardware",
        status: "assigned",
        statusLabel: "Asignado",
        dateIngress: new Date("2024-01-13"),
        dateAssigned: new Date("2024-01-14"),
    },
    {
        id: 122,
        description: "Error en aplicación",
        userName: "Ana Martínez",
        avatarInitials: "AM",
        assigned: false,
        type: "Software",
        status: "ingressed",
        statusLabel: "Ingresado",
        dateIngress: new Date("2024-01-12"),
    },
    {
        id: 121,
        description: "Solicitud de acceso",
        userName: "Pedro Sánchez",
        avatarInitials: "PS",
        assigned: true,
        type: "Acceso",
        status: "resolved",
        statusLabel: "Resuelto",
        dateIngress: new Date("2024-01-11"),
        dateAssigned: new Date("2024-01-12"),
    },
];

const manyTickets: TicketData[] = [
    ...sampleTickets,
    {
        id: 120,
        description: "Impresora no funciona",
        userName: "Laura Torres",
        avatarInitials: "LT",
        assigned: true,
        type: "Hardware",
        status: "inwork",
        statusLabel: "En Trabajo",
        dateIngress: new Date("2024-01-10"),
        dateAssigned: new Date("2024-01-11"),
    },
    {
        id: 119,
        description: "Cambio de contraseña",
        userName: "Miguel Hernández",
        avatarInitials: "MH",
        assigned: true,
        type: "Seguridad",
        status: "resolved",
        statusLabel: "Resuelto",
        dateIngress: new Date("2024-01-09"),
        dateAssigned: new Date("2024-01-10"),
    },
    {
        id: 118,
        description: "Red no disponible",
        userName: "Sofia Mendoza",
        avatarInitials: "SM",
        assigned: true,
        type: "Red",
        status: "inwork",
        statusLabel: "En Trabajo",
        dateIngress: new Date("2024-01-08"),
        dateAssigned: new Date("2024-01-09"),
    },
];

const meta = {
    title: "Organisms/TicketsPanel",
    component: TicketsPanel,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["my-tickets", "recent-tickets"],
            description: "Variante de la tabla",
        },
        tickets: {
            description: "Array de tickets a mostrar (máximo 10)",
        },
    },
} satisfies Meta<typeof TicketsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Variante "Mis últimos tickets"
 */
export const MyTickets: Story = {
    args: {
        variant: "my-tickets",
        tickets: sampleTickets,
    },
};

/**
 * Variante "Últimos tickets"
 */
export const RecentTickets: Story = {
    args: {
        variant: "recent-tickets",
        tickets: sampleTickets,
    },
};

/**
 * Mis últimos tickets con más datos (scrolleable)
 */
export const MyTicketsWithScroll: Story = {
    args: {
        variant: "my-tickets",
        tickets: manyTickets,
    },
};

/**
 * Últimos tickets con más datos (scrolleable)
 */
export const RecentTicketsWithScroll: Story = {
    args: {
        variant: "recent-tickets",
        tickets: manyTickets,
    },
};

/**
 * Mis últimos tickets con tickets no asignados
 */
export const MyTicketsWithUnassigned: Story = {
    args: {
        variant: "my-tickets",
        tickets: [
            {
                id: 130,
                description: "Sistema caído",
                userName: "Sin asignar",
                assigned: false,
                type: "Crítico",
                status: "ingressed",
                statusLabel: "Ingresado",
                dateIngress: new Date("2024-01-20"),
            },
            ...sampleTickets.slice(0, 3),
        ],
    },
};

/**
 * Últimos tickets con diferentes estados
 */
export const RecentTicketsVariedStates: Story = {
    args: {
        variant: "recent-tickets",
        tickets: [
            {
                id: 150,
                description: "Actualización requerida",
                userName: "Roberto Flores",
                avatarInitials: "RF",
                assigned: true,
                type: "Mantenimiento",
                status: "ingressed",
                statusLabel: "Ingresado",
                dateIngress: new Date("2024-01-25"),
            },
            {
                id: 151,
                description: "Backup fallido",
                userName: "Elena Vargas",
                avatarInitials: "EV",
                assigned: true,
                type: "Sistema",
                status: "assigned",
                statusLabel: "Asignado",
                dateIngress: new Date("2024-01-24"),
                dateAssigned: new Date("2024-01-25"),
            },
            {
                id: 152,
                description: "Capacitación solicitada",
                userName: "Diego Martín",
                avatarInitials: "DM",
                assigned: true,
                type: "Capacitación",
                status: "inwork",
                statusLabel: "En Trabajo",
                dateIngress: new Date("2024-01-23"),
                dateAssigned: new Date("2024-01-24"),
            },
            {
                id: 153,
                description: "Hardware obsoleto",
                userName: "Patricia Luna",
                avatarInitials: "PL",
                assigned: true,
                type: "Hardware",
                status: "canceled",
                statusLabel: "Cancelado",
                dateIngress: new Date("2024-01-22"),
                dateAssigned: new Date("2024-01-23"),
            },
        ],
    },
};
