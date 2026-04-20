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
        ticketId: "12345",
    },
};
