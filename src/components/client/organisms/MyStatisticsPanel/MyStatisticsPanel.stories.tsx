import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MyStatisticsPanel } from "./MyStatisticsPanel";

const meta = {
    title: "Organisms/MyStatisticsPanel",
    component: MyStatisticsPanel,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
    argTypes: {
        percentage: {
            description: "Porcentaje de tickets resueltos (de 0 a 100)",
        },
        resolvedTickets: {
            description: "Número de tickets resueltos",
        },
        assignedTickets: {
            description: "Número de tickets asignados",
        },
        inProgressTickets: {
            description: "Número de tickets en progreso",
        },
    },
} satisfies Meta<typeof MyStatisticsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default
 */
export const Default: Story = {
    args: {
        percentage: 75,
        resolvedTickets: 15,
        assignedTickets: 5,
        inProgressTickets: 3,
    },
};