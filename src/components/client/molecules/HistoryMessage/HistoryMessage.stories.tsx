import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HistoryMessage } from "./index";

const meta: Meta<typeof HistoryMessage> = {
    title: "Molecules/HistoryMessage",
    component: HistoryMessage,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        historyItems: [
            {
                user: "John Doe",
                ticketId: "123",
                timestamp: new Date().toISOString(),
                action: "CREATED",
                ticketStatus: "espera",
            },
            {
                user: "Jane Smith",
                ticketId: "123",
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                action: "ASSIGNED",
                assignedTo: "John Doe",
            },
            {
                user: "John Doe",
                ticketId: "123",
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                action: "TAGGED",
                tag: "Urgente",
            },
            {
                user: "Jane Smith",
                ticketId: "123",
                timestamp: new Date(Date.now() - 259200000).toISOString(),
                action: "IN_PROGRESS",
            },
            {
                user: "John Doe",
                ticketId: "123",
                timestamp: new Date(Date.now() - 345600000).toISOString(),
                action: "FINALIZED",
                ticketStatus: "Finalizado",
            },
        ],
    },
};
