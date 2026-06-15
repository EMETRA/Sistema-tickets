import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardStatsBar } from "./DashboardStatsBar";

const meta = {
    title: "Organisms/DashboardStatsBar",
    component: DashboardStatsBar,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
    argTypes: {
        stats: {
            description: "Array de estadísticas de tickets a mostrar",
        },
    },
} satisfies Meta<typeof DashboardStatsBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Panel con las 4 estadísticas principales
 */
export const Default: Story = {
    args: {
        stats: [
            {
                type: "solved",
                label: "Tickets resueltos",
                value: 250,
            },
            {
                type: "working",
                label: "Tickets en Trabajo",
                value: 1250,
            },
            {
                type: "entered",
                label: "Tickets Ingresados",
                value: 450,
            },
            {
                type: "assigned",
                label: "Tickets Asignados",
                value: 450,
            },
        ],
    },
};

/**
 * Panel con valores bajos
 */
export const LowVolume: Story = {
    args: {
        stats: [
            {
                type: "solved",
                label: "Tickets resueltos",
                value: 10,
            },
            {
                type: "working",
                label: "Tickets en Trabajo",
                value: 25,
            },
            {
                type: "entered",
                label: "Tickets Ingresados",
                value: 15,
            },
            {
                type: "assigned",
                label: "Tickets Asignados",
                value: 8,
            },
        ],
    },
};

/**
 * Panel con valores altos
 */
export const HighVolume: Story = {
    args: {
        stats: [
            {
                type: "solved",
                label: "Tickets resueltos",
                value: 15780,
            },
            {
                type: "working",
                label: "Tickets en Trabajo",
                value: 8920,
            },
            {
                type: "entered",
                label: "Tickets Ingresados",
                value: 12450,
            },
            {
                type: "assigned",
                label: "Tickets Asignados",
                value: 6340,
            },
        ],
    },
};

/**
 * Panel con solo 2 estadísticas
 */
export const TwoStats: Story = {
    args: {
        stats: [
            {
                type: "solved",
                label: "Tickets resueltos",
                value: 250,
            },
            {
                type: "working",
                label: "Tickets en Trabajo",
                value: 1250,
            },
        ],
    },
};

/**
 * Panel con 3 estadísticas
 */
export const ThreeStats: Story = {
    args: {
        stats: [
            {
                type: "solved",
                label: "Tickets resueltos",
                value: 250,
            },
            {
                type: "working",
                label: "Tickets en Trabajo",
                value: 1250,
            },
            {
                type: "entered",
                label: "Tickets Ingresados",
                value: 450,
            },
        ],
    },
};
