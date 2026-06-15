import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TicketStat } from "./";

const meta = {
    title: "Molecules/TicketStat",
    component: TicketStat,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        type: {
            control: "select",
            options: ["resueltos", "en-trabajo", "ingresados", "asignados"],
            description: "Tipo predefinido de estadística (usa colores e íconos automáticos)",
        },
        label: {
            control: "text",
            description: "Texto del título de la estadística",
        },
        value: {
            control: "number",
            description: "Número de tickets a mostrar",
        },
        color: {
            control: "color",
            description: "Color personalizado del ícono y del valor (solo si no se usa type)",
        },
        iconName: {
            control: "text",
            description: "Nombre del ícono personalizado (solo si no se usa type)",
        },
    },
} satisfies Meta<typeof TicketStat>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Estadística de Tickets Resueltos
 */
export const TicketsResueltos: Story = {
    args: {
        type: "solved",
        label: "Tickets resueltos",
        value: 250,
    },
};

/**
 * Estadística de Tickets en trabajo
 */
export const TicketsEnTrabajo: Story = {
    args: {
        type: "working",
        label: "Tickets en Trabajo",
        value: 150,
    },
};

/**
 * Estadística de Tickets Ingresados
 */
export const TicketsIngresados: Story = {
    args: {
        type: "entered",
        label: "Tickets ingresados",
        value: 89,
    },
};

/**
 * Estadística de Tickets asignados
 */
export const TicketsAsignados: Story = {
    args: {
        type: "assigned",
        label: "Tickets Asignados",
        value: 45,
    },
};

/**
 * Estadística con valor grande
 */
export const ValorGrande: Story = {
    args: {
        label: "Total de tickets",
        value: 1250,
        color: "#54C8E8",
        iconName: "ticket",
    },
};

/**
 * Estadística con valor pequeño
 */
export const ValorPequeño: Story = {
    args: {
        label: "Tickets críticos",
        value: 3,
        color: "#E63946",
        iconName: "ticket",
    },
};



