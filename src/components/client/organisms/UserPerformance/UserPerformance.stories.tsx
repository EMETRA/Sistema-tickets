import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { UserPerformance } from "./index";

const meta: Meta<typeof UserPerformance> = {
    title: "Organisms/UserPerformance",
    component: UserPerformance,
    parameters: {
        layout: "padded",
    },
    };

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        enteredTickets: 150,
        solvedTickets: 120,
        inProgressTickets: 1,
    },
};